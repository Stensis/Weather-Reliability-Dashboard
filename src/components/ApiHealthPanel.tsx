import { Activity, CheckCircle2, Gauge, Loader2, RefreshCw, Search, Server, ShieldAlert, Timer, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { searchLocations, timedJsonFetch, weatherUrl } from '../lib/api';
import { findUsage } from '../lib/normalize';
import { formatUpdatedAt } from '../lib/format';
import type { HealthCheck, HealthStatus, LocationOption, RequestMeta, Units } from '../types';

function statusFrom(ok: boolean, latencyMs?: number): HealthStatus {
  if (!ok) return 'failed';
  if (latencyMs === undefined) return 'idle';
  if (latencyMs <= 800) return 'operational';
  if (latencyMs <= 1500) return 'slow';
  return 'degraded';
}

function statusCopy(status: HealthStatus) {
  if (status === 'operational') return 'Operational';
  if (status === 'slow') return 'Slow';
  if (status === 'degraded') return 'Degraded';
  if (status === 'failed') return 'Failed';
  return 'Not checked';
}

function statusClass(status: HealthStatus) {
  if (status === 'operational') return 'text-emerald-300 bg-emerald-400/10';
  if (status === 'slow') return 'text-amber-300 bg-amber-400/10';
  if (status === 'degraded') return 'text-orange-300 bg-orange-400/10';
  if (status === 'failed') return 'text-rose-300 bg-rose-400/10';
  return 'text-slate-500 bg-white/[0.03]';
}

function errorMeta(error: unknown): RequestMeta | undefined {
  if (typeof error !== 'object' || error === null || !('result' in error)) return undefined;
  const result = (error as { result?: { meta?: RequestMeta } }).result;
  return result?.meta;
}

export function ApiHealthPanel({ location, units, mainRequest }: { location: LocationOption; units: Units; mainRequest: RequestMeta }) {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [running, setRunning] = useState(false);
  const [usage, setUsage] = useState<{ used?: number; limit?: number; remaining?: number }>({});

  const lastChecked = useMemo(() => checks.map((check) => check.checkedAt).filter(Boolean).sort().at(-1), [checks]);

  const runCheck = async (id: string, label: string, endpoint: string, url: string): Promise<HealthCheck> => {
    try {
      const result = await timedJsonFetch(url);
      if (id === 'usage') setUsage(findUsage(result.data));
      return {
        id,
        label,
        endpoint,
        status: statusFrom(true, result.meta.latencyMs),
        statusCode: result.meta.status,
        latencyMs: result.meta.latencyMs,
        checkedAt: result.meta.fetchedAt
      };
    } catch (error) {
      const meta = errorMeta(error);
      return {
        id,
        label,
        endpoint,
        status: 'failed',
        statusCode: meta?.status,
        latencyMs: meta?.latencyMs,
        checkedAt: new Date().toISOString(),
        detail: error instanceof Error ? error.message : 'Request failed'
      };
    }
  };

  const runHealth = async () => {
    setRunning(true);
    const base = { lat: location.latitude, lon: location.longitude, units };
    try {
      const tasks = [
        runCheck('current', 'Current Weather', '/v1/current', weatherUrl('current', base)),
        runCheck('hourly', 'Hourly Forecast', '/v1/hourly', weatherUrl('hourly', { ...base, days: 1 })),
        runCheck('daily', 'Daily Forecast', '/v1/daily', weatherUrl('daily', { ...base, days: 3 })),
        runCheck('usage', 'Usage & Quota', '/v1/usage', '/api/usage'),
        (async (): Promise<HealthCheck> => {
          if (location.id === 'browser-location') {
            return {
              id: 'location',
              label: 'Location Search',
              endpoint: 'Browser geolocation',
              status: 'idle',
              checkedAt: new Date().toISOString(),
              detail: 'City geocoding was not used for this selection.'
            };
          }
          try {
            const result = await searchLocations(location.name);
            return {
              id: 'location',
              label: 'Location Search',
              endpoint: 'Open-Meteo Geocoding',
              status: statusFrom(true, result.meta.latencyMs),
              statusCode: result.meta.status,
              latencyMs: result.meta.latencyMs,
              checkedAt: result.meta.fetchedAt
            };
          } catch (error) {
            return {
              id: 'location',
              label: 'Location Search',
              endpoint: 'Open-Meteo Geocoding',
              status: 'failed',
              checkedAt: new Date().toISOString(),
              detail: error instanceof Error ? error.message : 'Location search failed'
            };
          }
        })()
      ];
      setChecks(await Promise.all(tasks));
    } finally {
      setRunning(false);
    }
  };

  const displayChecks: HealthCheck[] = checks.length ? checks : [
    {
      id: 'main',
      label: 'Last WeatherAI Request',
      endpoint: '/v1/weather',
      status: statusFrom(mainRequest.ok, mainRequest.latencyMs),
      statusCode: mainRequest.status,
      latencyMs: mainRequest.latencyMs,
      checkedAt: mainRequest.fetchedAt
    }
  ];

  return (
    <section className="panel overflow-hidden" data-testid="api-health">
      <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="eyebrow">API reliability</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Live endpoint health</h3>
          <p className="mt-1 text-xs text-slate-500">Measured only when a real request runs.</p>
        </div>
        <button
          type="button"
          onClick={runHealth}
          disabled={running}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-300/15 bg-sky-400/10 px-4 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="run-health-check"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {running ? 'Running checks…' : 'Run health check'}
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {running && checks.length === 0 ? (
          <div className="space-y-3" data-testid="health-loader">
            {[0, 1, 2, 3, 4].map((item) => <div key={item} className="shimmer h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {displayChecks.map((check) => {
              const width = check.latencyMs === undefined ? 0 : Math.min(100, Math.max(5, check.latencyMs / 20));
              return (
                <div key={check.id} className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900/70 text-slate-400">
                        {check.id === 'location' ? <Search className="h-4 w-4" /> : check.id === 'usage' ? <Gauge className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">{check.label}</p>
                        <p className="truncate text-xs text-slate-600">{check.endpoint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {check.latencyMs !== undefined && <span className="inline-flex items-center gap-1 text-xs tabular-nums text-slate-400"><Timer className="h-3.5 w-3.5" /> {check.latencyMs} ms</span>}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(check.status)}`}>
                        {check.status === 'failed' ? <XCircle className="h-3 w-3" /> : check.status === 'idle' ? <ShieldAlert className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {statusCopy(check.status)}
                      </span>
                    </div>
                  </div>
                  {check.latencyMs !== undefined && (
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full bg-sky-400/60 transition-all duration-700" style={{ width: `${width}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(usage.used !== undefined || usage.limit !== undefined || usage.remaining !== undefined) && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="stat-mini"><span>Requests used</span><strong>{usage.used ?? '—'}</strong></div>
            <div className="stat-mini"><span>Monthly limit</span><strong>{usage.limit ?? '—'}</strong></div>
            <div className="stat-mini"><span>Remaining</span><strong>{usage.remaining ?? (usage.limit !== undefined && usage.used !== undefined ? Math.max(0, usage.limit - usage.used) : '—')}</strong></div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Health thresholds: &lt;800 ms healthy</span>
          <span>Last checked {formatUpdatedAt(lastChecked || mainRequest.fetchedAt)}</span>
        </div>
      </div>
    </section>
  );
}
