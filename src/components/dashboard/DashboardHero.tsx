import { SearchBar } from '../SearchBar';
import type { LocationOption, RequestMeta, Units } from '../../types';

const FORECAST_OPTIONS = [3, 5, 7] as const;
const UNIT_OPTIONS: Units[] = ['metric', 'imperial'];

export function DashboardHero({
  location,
  days,
  units,
  searchMeta,
  onLocationChange,
  onDaysChange,
  onUnitsChange,
  onUseBrowserLocation,
  onSearchMeta,
}: {
  location: LocationOption | null;
  days: number;
  units: Units;
  searchMeta: RequestMeta | null;
  onLocationChange: (location: LocationOption) => void;
  onDaysChange: (days: number) => void;
  onUnitsChange: (units: Units) => void;
  onUseBrowserLocation: () => void;
  onSearchMeta: (meta: RequestMeta | null) => void;
}) {
  return (
    <section className="mb-6 overflow-visible rounded-[1.75rem] border border-white/[0.06] bg-gradient-to-br from-white/[0.045] to-white/[0.018] p-5 shadow-2xl shadow-black/20 sm:p-7">
      <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/10 bg-sky-400/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
            Reliability in real time
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
            Weather data you can see.
            <br className="hidden sm:block" /> API quality you can verify.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Explore live WeatherAI forecasts while monitoring API reliability, latency and automated test coverage.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/45 p-1">
            {FORECAST_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onDaysChange(option)}
                aria-pressed={days === option}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  days === option ? 'bg-white/[0.09] text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {option}d
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-slate-950/45 p-1">
            {UNIT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onUnitsChange(option)}
                aria-pressed={units === option}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  units === option ? 'bg-sky-400 text-slate-950' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {option === 'metric' ? '°C' : '°F'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <SearchBar
          selected={location}
          onSelect={onLocationChange}
          onUseBrowserLocation={onUseBrowserLocation}
          onSearchMeta={onSearchMeta}
        />
        {searchMeta && (
          <p className="mt-2 text-right text-[11px] text-slate-500">
            Location lookup completed in{' '}
            <span className="font-medium text-slate-400">{searchMeta.latencyMs} ms</span>
          </p>
        )}
      </div>
    </section>
  );
}
