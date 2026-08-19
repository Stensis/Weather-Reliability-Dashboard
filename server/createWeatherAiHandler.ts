type ServerRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ServerResponse = {
  status: (code: number) => ServerResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
  json: (body: unknown) => void;
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
  return async function handler(req: ServerRequest, res: ServerResponse) {
    const apiKey = process.env.WEATHER_AI_API_KEY;
    if (!apiKey || !apiKey.startsWith('wai_')) {
      return res.status(503).json({
        error: 'WEATHER_AI_API_KEY is not configured on the deployment.'
      });
    }

    const baseUrl = process.env.WEATHER_AI_BASE_URL || DEFAULT_BASE_URL;
    const startedAt = performance.now();

    try {
      const upstream = await fetch(`${baseUrl}${endpoint}${getQueryString(req)}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(12_000)
      });

      const body = await upstream.text();
      for (const header of FORWARDED_HEADERS) {
        const value = upstream.headers.get(header);
        if (value) res.setHeader(header, value);
      }
      res.setHeader('x-proxy-latency-ms', String(Math.round(performance.now() - startedAt)));
      res.setHeader('cache-control', 'no-store');
      return res.status(upstream.status).send(body);
    } catch (error) {
      return res.status(502).json({
        error: 'Unable to reach WeatherAI.',
        detail: error instanceof Error ? error.message : 'Unknown upstream error'
      });
    }
  };
}
