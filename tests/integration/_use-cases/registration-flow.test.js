import orchestrator from "tests/orchestrator.js";
import activation from "models/activation.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigration();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration flow (all successful)", () => {
  let createUserResponseBody;

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

    const activationTokenId = activation.extractActivationTokenFromEmail(
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

  test("Activate account", async () => {});

  test("Login", async () => {});

  test("Get user information", async () => {});
});
