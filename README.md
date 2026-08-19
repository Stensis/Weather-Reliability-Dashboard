# Weather Reliability Dashboard

A small WeatherAI client built for a QA Automation Engineer take-home. It keeps the product simple: search a location, view live weather, inspect forecast data, and see the reliability/testing signals behind the experience.

## Stack

React • TypeScript • Tailwind CSS • Vite • Playwright • GitHub Actions • Vercel

## Features

- Dynamic city search and browser geolocation
- Current weather, hourly trend, and 3/5/7-day forecast
- Metric/imperial units
- Loading, empty, error, and retry states
- Real request latency and HTTP status
- On-demand API health checks
- Dynamic Playwright test summary and GitHub Actions status
- Collapsible raw WeatherAI response
- API key kept server-side through thin Vercel/Vite proxy routes

## Run locally

Requires Node 20+ (Node 22 recommended).

```bash
nvm use
npm install
cp .env.example .env
npm run dev
```

Add your key to `.env`:

```env
WEATHER_AI_API_KEY=wai_your_api_key_here
WEATHER_AI_BASE_URL=https://api.weather-ai.co
```

Open `http://localhost:5173`.

## Tests

```bash
npm run typecheck
npm run build
npm test
```

Playwright covers UI flows, live API integration, authentication/validation failures, and generates `public/test-summary.json` for the dashboard.

## Structure

```text
src/
  pages/        # page-level composition
  components/   # reusable UI
  hooks/        # state and dashboard logic
  lib/          # API, normalization and formatting
  types/        # shared types
tests/          # Playwright API + UI tests
api/            # thin production proxy functions
.github/         # CI workflow
```

WeatherAI docs: https://weather-ai.co/docs
