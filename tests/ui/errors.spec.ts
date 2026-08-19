import { expect, test } from "@playwright/test";
import { geocodeFixture } from "../fixtures/weather";

test("[ui][negative] displays a readable error when WeatherAI returns 503", async ({
  page,
}) => {
  await page.route("https://geocoding-api.open-meteo.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(geocodeFixture),
    }),
  );
  await page.route("**/api/weather?**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Service unavailable" }),
    }),
  );

  await page.goto("/");
  await page.getByTestId("location-input").fill("Nairobi");
  await page
    .getByRole("button", { name: /Nairobi/i })
    .first()
    .click();

  await expect(page.getByTestId("error-banner")).toContainText(
    "Service unavailable",
  );
});

test("[ui][negative] does not query the geocoder for a one-character search", async ({
  page,
}) => {
  let requests = 0;
  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    requests += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [] }),
    });
  });
  await page.goto("/");
  await page.getByTestId("location-input").fill("N");
  await page.waitForTimeout(500);
  expect(requests).toBe(0);
});
