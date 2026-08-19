const DEFAULT_BASE_URL = 'https://api.weather-ai.co';

const FORWARDED_HEADERS = [
  'content-type',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
  'x-country',
  'x-region',
  'x-city'
] as const;

type ServerRequest = {
  method?: string;
  url?: string;
};

type ServerResponse = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
};

function sendJson(
  response: ServerResponse,
  status: number,
  payload: Record<string, unknown>
) {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  response.end(JSON.stringify(payload));
}

export function createWeatherAiHandler(endpoint: string) {
  return async function handler(
    request: ServerRequest,
    response: ServerResponse
  ): Promise<void> {
    try {
      if (request.method && request.method !== 'GET') {
        response.setHeader('allow', 'GET');
        sendJson(response, 405, { error: 'Method not allowed' });
        return;
      }

      const apiKey = process.env.WEATHER_AI_API_KEY;

      if (!apiKey) {
        console.error('WEATHER_AI_API_KEY is missing in the Vercel runtime.');
        sendJson(response, 503, {
          error: 'Weather service is not configured.'
        });
        return;
      }

      const baseUrl = process.env.WEATHER_AI_BASE_URL || DEFAULT_BASE_URL;
      const upstreamUrl = new URL(endpoint, baseUrl);

      const rawUrl = request.url || '';
      const queryIndex = rawUrl.indexOf('?');

      if (queryIndex >= 0) {
        const incomingParams = new URLSearchParams(rawUrl.slice(queryIndex + 1));
        incomingParams.forEach((value, key) => {
          upstreamUrl.searchParams.set(key, value);
        });
      }

      const startedAt = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);

      try {
        const upstream = await fetch(upstreamUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json'
          },
          signal: controller.signal
        });

        const body = await upstream.text();

        response.statusCode = upstream.status;

        for (const header of FORWARDED_HEADERS) {
          const value = upstream.headers.get(header);
          if (value) response.setHeader(header, value);
        }

        if (!upstream.headers.get('content-type')) {
          response.setHeader('content-type', 'application/json; charset=utf-8');
        }

        response.setHeader(
          'x-proxy-latency-ms',
          String(Date.now() - startedAt)
        );
        response.setHeader('cache-control', 'no-store');
        response.end(body);
      } catch (error) {
        const isTimeout = error instanceof Error && error.name === 'AbortError';

        console.error('WeatherAI upstream request failed:', error);

        sendJson(response, isTimeout ? 504 : 502, {
          error: isTimeout
            ? 'WeatherAI request timed out.'
            : 'Unable to reach WeatherAI.'
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('WeatherAI function failed:', error);
      sendJson(response, 500, { error: 'Unexpected server error.' });
    }
  };
}
