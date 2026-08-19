import { expect, test, type Page } from "@playwright/test";
import { geocodeFixture, weatherFixture } from "../fixtures/weather";

async function mockGeocoding(page: Page) {
  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(geocodeFixture),
    });
  });
}

async function searchNairobi(page: Page) {
  await page.getByTestId("location-input").fill("Nairobi");
  await expect(page.getByTestId("search-results")).toBeVisible();
  await page
    .getByRole("button", { name: /Nairobi/i })
    .first()
    .click();
}

test("[ui] renders an empty state before any live weather request", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await expect(page.getByTestId("current-weather")).toHaveCount(0);
});

test("[ui] searches a city and renders dynamic weather metrics", async ({
  page,
}) => {
  await mockGeocoding(page);
  await page.route("**/api/weather?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherFixture),
    });
  });

  await page.goto("/");
  await searchNairobi(page);

  await expect(page.getByTestId("current-weather")).toContainText("Nairobi");
  await expect(page.getByTestId("temperature")).toHaveText("21°C");
  await expect(page.getByTestId("weather-metrics")).toContainText("Humidity");
  await expect(page.getByTestId("weather-metrics")).toContainText("68%");
  await expect(page.getByTestId("daily-forecast")).toBeVisible();
});

test("[ui] shows a loader while WeatherAI is still responding", async ({
  page,
}) => {
  await mockGeocoding(page);
  await page.route("**/api/weather?**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 750));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherFixture),
    });
  });

  await page.goto("/");
  await searchNairobi(page);
  await expect(page.getByTestId("weather-loader")).toBeVisible();
  await expect(page.getByTestId("current-weather")).toBeVisible();
});

test("[ui] adapts the dashboard to a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockGeocoding(page);
  await page.route("**/api/weather?**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherFixture),
    }),
  );

  await page.goto("/");
  await searchNairobi(page);
  await expect(page.getByTestId("current-weather")).toBeVisible();
  await expect(page.getByTestId("weather-metrics")).toBeVisible();
});
