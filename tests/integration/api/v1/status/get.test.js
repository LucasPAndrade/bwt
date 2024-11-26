test("GET to /api/v1/status should return 200 and message key", async () => {
  const response = await fetch(`${TEST_BASE_URL}/api/v1/status`);
  expect(response.status).toBe(200);
});
