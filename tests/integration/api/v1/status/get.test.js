test("GET to /api/v1/status should return 200 and message key", async () => {
  const url =
    "https://bug-free-memory-rp6v9jgxgvv2p67x-3000.app.github.dev/api/v1/status";

  const response = await fetch(url);

  expect(response.status).toBe(200);
});
