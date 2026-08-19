import type { ApiResult, LocationOption, Units } from '../types';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

function numberHeader(headers: Headers, name: string) {
  const raw = headers.get(name);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

export async function timedJsonFetch<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResult<T>> {
  const started = performance.now();
  const response = await fetch(input, init);
  const latencyMs = Math.round(performance.now() - started);
  const text = await response.text();

  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  const result: ApiResult<T> = {
    data: data as T,
    meta: {
      status: response.status,
      ok: response.ok,
      latencyMs,
      proxyLatencyMs: numberHeader(response.headers, 'x-proxy-latency-ms'),
      fetchedAt: new Date().toISOString(),
      rateLimit: {
        limit: numberHeader(response.headers, 'x-ratelimit-limit'),
        remaining: numberHeader(response.headers, 'x-ratelimit-remaining'),
        reset: numberHeader(response.headers, 'x-ratelimit-reset')
      }
    }
  };

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data
      ? String((data as Record<string, unknown>).error)
      : `Request failed with HTTP ${response.status}`;
    throw Object.assign(new Error(message), { result });
  }

  return result;
}

export async function searchLocations(query: string) {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set('name', query.trim());
  url.searchParams.set('count', '6');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const result = await timedJsonFetch<{ results?: Array<Record<string, unknown>> }>(url);
  const locations: LocationOption[] = (result.data.results ?? [])
    .map((item) => ({
      id: String(item.id ?? `${item.latitude}-${item.longitude}-${item.name}`),
      name: String(item.name ?? 'Unknown location'),
      admin1: item.admin1 ? String(item.admin1) : undefined,
      country: item.country ? String(item.country) : undefined,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude)
    }))
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));

  return { locations, meta: result.meta };
}

export function weatherUrl(endpoint: 'weather' | 'current' | 'hourly' | 'daily', params: {
  lat: number;
  lon: number;
  days?: number;
  units?: Units;
}) {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lon: String(params.lon),
    ai: 'false',
    units: params.units ?? 'metric'
  });
  if (params.days !== undefined) query.set('days', String(params.days));
  return `/api/${endpoint}?${query.toString()}`;
}
