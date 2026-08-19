import { expect, test } from "@playwright/test";

const baseURL = process.env.WEATHER_AI_BASE_URL || "https://api.weather-ai.co";
const key = process.env.WEATHER_AI_API_KEY;

const authHeaders: Record<string, string> = key
  ? { Authorization: `Bearer ${key}` }
  : {};

test("[api][negative] rejects a request with no bearer token", async ({
  request,
}) => {
  const response = await request.get(
    `${baseURL}/v1/weather?lat=-1.2921&lon=36.8219&days=1&ai=false`,
  );
  expect(response.status()).toBe(401);
});

test("[api][negative] rejects missing required coordinates", async ({
  request,
}) => {
  test.skip(
    !key,
    "WEATHER_AI_API_KEY is required for authenticated negative validation.",
  );
  const response = await request.get(`${baseURL}/v1/weather?days=1&ai=false`, {
    headers: authHeaders,
  });
  expect(response.status()).toBe(400);
});

test("[api] returns current weather for valid coordinates", async ({
  request,
}) => {
  test.skip(!key, "WEATHER_AI_API_KEY is required for live integration tests.");
  const response = await request.get(
    `${baseURL}/v1/current?lat=-1.2921&lon=36.8219&ai=false&units=metric`,
    { headers: authHeaders },
  );
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("application/json");
  const body = await response.json();
  expect(body).toBeTruthy();
});

test("[api] returns an hourly forecast for valid coordinates", async ({
  request,
}) => {
  test.skip(!key, "WEATHER_AI_API_KEY is required for live integration tests.");
  const response = await request.get(
    `${baseURL}/v1/hourly?lat=-1.2921&lon=36.8219&days=1&ai=false&units=metric`,
    { headers: authHeaders },
  );
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toBeTruthy();
});

test("[api] returns a daily forecast for valid coordinates", async ({
  request,
}) => {
  test.skip(!key, "WEATHER_AI_API_KEY is required for live integration tests.");
  const response = await request.get(
    `${baseURL}/v1/daily?lat=-1.2921&lon=36.8219&days=3&ai=false&units=metric`,
    { headers: authHeaders },
  );
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toBeTruthy();
});

test("[api] usage endpoint returns JSON for an authenticated caller", async ({
  request,
}) => {
  test.skip(!key, "WEATHER_AI_API_KEY is required for usage tests.");
  const response = await request.get(`${baseURL}/v1/usage`, {
    headers: authHeaders,
  });
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("application/json");
});
