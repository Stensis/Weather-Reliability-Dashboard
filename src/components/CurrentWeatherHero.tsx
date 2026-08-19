import { Clock3, Radio } from "lucide-react";
import { formatTemperature, formatTime, locationLabel } from "../lib/format";
import type {
  LocationOption,
  RequestMeta,
  Units,
  WeatherViewModel,
} from "../types";
import { WeatherIcon } from "./WeatherIcon";

export function CurrentWeatherHero({
  weather,
  location,
  meta,
  units,
}: {
  weather: WeatherViewModel;
  location: LocationOption;
  meta: RequestMeta;
  units: Units;
}) {
  const { current } = weather;
  return (
    <section
      className="panel relative overflow-hidden p-6 sm:p-8"
      data-testid="current-weather"
    >
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/[0.11] blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-indigo-500/[0.07] blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Current weather</p>
            <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
              {locationLabel(location)}
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
            <Radio className="h-3.5 w-3.5" /> Live response
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-[2rem] border border-sky-200/10 bg-gradient-to-br from-sky-400/15 to-white/[0.02] text-sky-200 shadow-glow">
            <WeatherIcon
              code={current.weatherCode}
              condition={current.condition}
              className="h-14 w-14"
            />
          </div>
          <div className="min-w-0">
            <p
              className="text-6xl font-semibold tracking-[-0.06em] text-white sm:text-7xl"
              data-testid="temperature"
            >
              {formatTemperature(current.temperature, units)}
            </p>
            <p className="mt-2 text-base font-medium text-slate-300">
              {current.condition ?? "Condition unavailable"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" /> Observed{" "}
                {formatTime(current.time || meta.fetchedAt)}
              </span>
              <span>{meta.latencyMs} ms end-to-end</span>
              <span>HTTP {meta.status}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
