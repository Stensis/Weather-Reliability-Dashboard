import { Droplets } from 'lucide-react';
import { formatTemperature, formatTime } from '../lib/format';
import type { HourlyPoint, Units } from '../types';
import { WeatherIcon } from './WeatherIcon';

export function HourlyForecast({ hourly, units }: { hourly: HourlyPoint[]; units: Units }) {
  if (!hourly.length) return null;
  return (
    <section className="panel p-5 sm:p-6">
      <div>
        <p className="eyebrow">Hourly forecast</p>
        <h3 className="mt-1 text-lg font-semibold text-white">What the next hours look like</h3>
      </div>
      <div className="scrollbar-subtle mt-5 flex gap-3 overflow-x-auto pb-2">
        {hourly.map((point, index) => (
          <div key={`${point.time}-${index}`} className="min-w-[128px] rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
            <p className="text-xs font-medium text-slate-500">{formatTime(point.time)}</p>
            <WeatherIcon code={point.weatherCode} condition={point.condition} className="mx-auto mt-4 h-7 w-7 text-sky-300" />
            <p className="mt-3 text-xl font-semibold text-white">{formatTemperature(point.temperature, units)}</p>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-sky-300/80"><Droplets className="h-3 w-3" /> {point.rainProbability !== undefined ? `${Math.round(point.rainProbability)}%` : '—'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
