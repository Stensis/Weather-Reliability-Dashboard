import { Droplets } from "lucide-react";
import { formatDay, formatTemperature } from "../lib/format";
import type { DailyPoint, Units } from "../types";
import { WeatherIcon } from "./WeatherIcon";

export function DailyForecast({
  daily,
  units,
}: {
  daily: DailyPoint[];
  units: Units;
}) {
  if (!daily.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Daily outlook</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Forecast</h3>
        </div>
        <p className="text-xs text-slate-500">
          Up to {daily.length} days returned
        </p>
      </div>
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
        data-testid="daily-forecast"
      >
        {daily.map((day, index) => (
          <article
            key={`${day.date}-${index}`}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.028] p-4 transition duration-300 hover:-translate-y-1 hover:border-sky-300/15 hover:bg-white/[0.045]"
          >
            <p className="text-xs font-medium text-slate-500">
              {formatDay(day.date)}
            </p>
            <WeatherIcon
              code={day.weatherCode}
              condition={day.condition}
              className="mt-5 h-7 w-7 text-sky-300"
            />
            <p className="mt-4 text-sm font-medium text-slate-300 line-clamp-1">
              {day.condition ?? "Forecast"}
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-lg font-semibold text-white">
                {formatTemperature(day.maxTemperature, units)}
              </span>
              <span className="text-xs text-slate-500">
                {formatTemperature(day.minTemperature, units)}
              </span>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs text-sky-300/80">
              <Droplets className="h-3 w-3" />{" "}
              {day.rainProbability !== undefined
                ? `${Math.round(day.rainProbability)}%`
                : "—"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
