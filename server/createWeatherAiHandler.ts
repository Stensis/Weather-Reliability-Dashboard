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

type WeatherHandler = (request: Request) => Promise<Response>;

export function createWeatherAiHandler(endpoint: string): WeatherHandler {
  return async (request: Request): Promise<Response> => {
    try {
      if (request.method !== 'GET') {
        return Response.json(
          { error: 'Method not allowed' },
          {
            status: 405,
            headers: { Allow: 'GET' }
          }
        );
      }

      const apiKey = process.env.WEATHER_AI_API_KEY;

      if (!apiKey) {
        console.error('WEATHER_AI_API_KEY is missing in the Vercel runtime.');
        return Response.json(
          { error: 'Weather service is not configured.' },
          { status: 503 }
        );
      }

      const baseUrl = process.env.WEATHER_AI_BASE_URL || DEFAULT_BASE_URL;
      const incomingUrl = new URL(request.url);
      const upstreamUrl = new URL(endpoint, baseUrl);

      incomingUrl.searchParams.forEach((value, key) => {
        upstreamUrl.searchParams.set(key, value);
      });

      const startedAt = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);

      try {
        const upstream = await fetch(upstreamUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json'
          },
          signal: controller.signal,
          cache: 'no-store'
        });

        const body = await upstream.text();
        const headers = new Headers();

        for (const header of FORWARDED_HEADERS) {
          const value = upstream.headers.get(header);
          if (value) headers.set(header, value);
        }

        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json; charset=utf-8');
        }

        headers.set(
          'x-proxy-latency-ms',
          String(Math.round(performance.now() - startedAt))
        );
        headers.set('cache-control', 'no-store');

        return new Response(body, {
          status: upstream.status,
          headers
        });
      } catch (error) {
        const isTimeout =
          error instanceof Error && error.name === 'AbortError';

        console.error('WeatherAI upstream request failed:', error);

        return Response.json(
          {
            error: isTimeout
              ? 'WeatherAI request timed out.'
              : 'Unable to reach WeatherAI.'
          },
          { status: isTimeout ? 504 : 502 }
        );
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('WeatherAI function failed before upstream request:', error);

      return Response.json(
        { error: 'Unexpected server error.' },
        { status: 500 }
      );
    }
  };
}
