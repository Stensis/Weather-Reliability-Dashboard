
type ServerRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};


const DEFAULT_BASE_URL = 'https://api.weather-ai.co';
const FORWARDED_HEADERS = [
  'content-type',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
  'x-country',
  'x-region',
  'x-city'
];

function getQueryString(req: ServerRequest) {
  if (req.url?.includes('?')) return req.url.slice(req.url.indexOf('?'));
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(req.query ?? {})) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === 'string' && value.length) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function createWeatherAiHandler(endpoint: string) {
  return async function handler(request: Request): Promise<Response> {
    try {
      const apiKey = process.env.WEATHER_AI_API_KEY;

      if (!apiKey) {
        return Response.json(
          {
            error: 'WEATHER_AI_API_KEY is not configured on the deployment.'
          },
          {
            status: 503
          }
        );
      }

      const baseUrl =
        process.env.WEATHER_AI_BASE_URL || DEFAULT_BASE_URL;

      const incomingUrl = new URL(request.url);
      const upstreamUrl = new URL(endpoint, baseUrl);

      incomingUrl.searchParams.forEach((value, key) => {
        upstreamUrl.searchParams.set(key, value);
      });

      const startedAt = Date.now();

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 12_000);

      let upstream: Response;

      try {
        upstream = await fetch(upstreamUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json'
          },
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      const body = await upstream.text();

      const headers = new Headers();

      for (const header of FORWARDED_HEADERS) {
        const value = upstream.headers.get(header);

        if (value) {
          headers.set(header, value);
        }
      }

      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }

      headers.set(
        'x-proxy-latency-ms',
        String(Date.now() - startedAt)
      );

      headers.set('cache-control', 'no-store');

      return new Response(body, {
        status: upstream.status,
        headers
      });
    } catch (error) {
      console.error('WeatherAI proxy failed:', error);

      return Response.json(
        {
          error: 'Unable to reach WeatherAI.',
          detail:
            error instanceof Error
              ? error.message
              : 'Unknown upstream error'
        },
        {
          status: 502
        }
      );
    }
  };
}