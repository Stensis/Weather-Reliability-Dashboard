import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTime } from '../lib/format';
import type { HourlyPoint, Units } from '../types';

export function ForecastChart({ hourly, units }: { hourly: HourlyPoint[]; units: Units }) {
  const data = hourly.slice(0, 12).map((point) => ({
    time: formatTime(point.time),
    temperature: point.temperature,
    rain: point.rainProbability
  }));

  if (!data.some((point) => point.temperature !== undefined)) return null;

  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Temperature trend</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Next hours</h3>
        </div>
        <p className="text-xs text-slate-500">Live forecast values • {units === 'metric' ? '°C' : '°F'}</p>
      </div>
      <div className="mt-5 h-64 w-full" data-testid="forecast-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(56 189 248)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="rgb(56 189 248)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,.08)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
            <Tooltip
              contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: number | string | Array<number | string> | undefined) => [`${value ?? '—'}°`, 'Temperature']}
            />
            <Area type="monotone" dataKey="temperature" stroke="rgb(56 189 248)" strokeWidth={2.2} fill="url(#temperatureFill)" connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
