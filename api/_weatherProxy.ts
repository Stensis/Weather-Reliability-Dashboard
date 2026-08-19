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

function jsonError(status: number, error: string, detail?: string) {
  return Response.json(
    detail ? { error, detail } : { error },
    {
      status,
      headers: {
        'cache-control': 'no-store'
      }
    }
  );
}

export async function proxyWeather(
  request: Request,
  endpoint: string
): Promise<Response> {
  const apiKey = process.env.WEATHER_AI_API_KEY;

  if (!apiKey) {
    console.error('WEATHER_AI_API_KEY is missing in the Vercel runtime.');
    return jsonError(503, 'Weather service is not configured.');
  }

  const baseUrl = process.env.WEATHER_AI_BASE_URL || DEFAULT_BASE_URL;
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(endpoint, baseUrl);

  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

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
    const headers = new Headers();

    for (const header of FORWARDED_HEADERS) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }

    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json; charset=utf-8');
    }

    headers.set('cache-control', 'no-store');
    headers.set('x-proxy-latency-ms', String(Date.now() - startedAt));

    return new Response(body, {
      status: upstream.status,
      headers
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error('WeatherAI upstream request failed:', error);

    return jsonError(
      isTimeout ? 504 : 502,
      isTimeout ? 'WeatherAI request timed out.' : 'Unable to reach WeatherAI.',
      error instanceof Error ? error.message : undefined
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
