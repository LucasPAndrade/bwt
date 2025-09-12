import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigration();
});

//Define a base for a valid user, to be used in all invalid data test cases.
const baseUser = {
  username: "validUsername",
  email: "validemail@mail.com",
  password: "validpwd1",
};

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      // eslint-disable-next-line no-undef
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "lucasandrade",
          email: "meulemail@mail.com",
          password: "123QWE",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "lucasandrade",
        username_normalized: responseBody.username_normalized,
        email: "meulemail@mail.com",
        email_normalized: responseBody.email_normalized,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("lucasandrade");
      const correctPasswordMatch = await password.compare(
        "123QWE",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "senha incorreta",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      // eslint-disable-next-line no-undef
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "emailduplicado@mail.com",
          password: "123QWE",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Emailduplicado@mail.com",
          password: "123QWE",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O e-mail informado já está sendo utilizado.",
        action: "Utilize outro e-mail para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      // eslint-disable-next-line no-undef
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "userduplicado",
          email: "novouserduplicado@mail.com",
          password: "123QWE",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Userduplicado",
          email: "novouserduplicado2@mail.com",
          password: "123QWE",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With missing data", async () => {
      const invalidUserCases = [
        {
          description: "missing 'username'",
          body: {
            ...baseUser,
            username: "",
          },
        },
        {
          description: "missing 'email'",
          body: {
            ...baseUser,
            email: "",
          },
        },
        {
          description: "missing 'password'",
          body: {
            ...baseUser,
            password: "",
          },
        },
      ];

      for (const testCase of invalidUserCases) {
        // eslint-disable-next-line no-undef
        const response = await fetch("http://localhost:3000/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testCase.body),
        });

        expect(response.status).toBe(400);
        // console.log(`Test passed for ${testCase.description}`);
      }
    });
  });
});
