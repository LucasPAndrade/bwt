import orchestrator from "tests/orchestrator.js";
import activation from "models/activation.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigration();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration flow (all successful)", () => {
  let createUserResponseBody;
  let activationTokenId;

  test("Create user account", async () => {
    // eslint-disable-next-line no-undef
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registration.flow@curso.dev",
          password: "RegistrationFlowPassword",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      username_normalized: createUserResponseBody.username_normalized,
      email: "registration.flow@curso.dev",
      email_normalized: createUserResponseBody.email_normalized,
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@bwt.com.br>");
    expect(lastEmail.recipients[0]).toBe(`<${createUserResponseBody.email}>`);
    expect(lastEmail.subject).toBe("Ative seu cadastro");
    expect(lastEmail.text).toContain(createUserResponseBody.username);

    activationTokenId = activation.extractActivationTokenFromEmail(
      lastEmail.text,
    );

    const activationTokenObject =
      await activation.findOneValidById(activationTokenId);

    expect(lastEmail.text).toContain(
      activation.ACTIVATION_BASE_URL + activationTokenId,
    );
    expect(activationTokenObject.user_id).toBe(createUserResponseBody.id);
    expect(activationTokenObject.used_at).toBe(null);
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername(
      createUserResponseBody.username,
    );
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Login", async () => {
    // eslint-disable-next-line no-undef
    const createSessionsResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "registration.flow@curso.dev",
          password: "RegistrationFlowPassword",
        }),
      },
    );

    expect(createSessionsResponse.status).toBe(201);

    const createSessionsResponseBody = await createSessionsResponse.json();

    expect(createSessionsResponseBody.user_id).toBe(createUserResponseBody.id);
  });

  test("Get user information", async () => {});
});
