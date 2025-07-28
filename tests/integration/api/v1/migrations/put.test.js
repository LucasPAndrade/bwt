import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("PUT /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Returning Method Not Allowed error", async () => {
      // eslint-disable-next-line no-undef
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "PUT",
      });

      expect(response.status).toBe(405);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint.",
        action: "Verifique se o método HTTP é válido para este endpoint",
        statusCode: 405,
      });
    });
  });
});
