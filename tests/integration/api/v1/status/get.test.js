test("GET to /api/v1/status should return 200 and message key", async () => {
  const response = await fetch(
    "https://bug-free-memory-rp6v9jgxgvv2p67x-3000.app.github.dev/api/v1/status",
  );
  // "http://localhost:3000/api/v1/status"
  expect(response.status).toBe(200);
});
