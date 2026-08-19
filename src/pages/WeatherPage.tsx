import { ApiHealthPanel } from '../components/ApiHealthPanel';
import { AutomationPanel } from '../components/AutomationPanel';
import { CurrentWeatherHero } from '../components/CurrentWeatherHero';
import { DailyForecast } from '../components/DailyForecast';
import { ForecastChart } from '../components/ForecastChart';
import { HourlyForecast } from '../components/HourlyForecast';
import { MetricCard } from '../components/MetricCard';
import { RawResponse } from '../components/RawResponse';
import { WeatherAlerts } from '../components/WeatherAlerts';
import type { LucideIcon } from 'lucide-react';
import type { ApiResult, HourlyPoint, LocationOption, Units, WeatherViewModel } from '../types';

type Metric = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
};

export function WeatherPage({
  location,
  units,
  weather,
  result,
  payload,
  metrics,
  hourlyPreview,
  hasAlerts,
}: {
  location: LocationOption;
  units: Units;
  weather: WeatherViewModel;
  result: ApiResult;
  payload: unknown;
  metrics: Metric[];
  hourlyPreview: HourlyPoint[];
  hasAlerts: boolean;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <CurrentWeatherHero weather={weather} location={location} meta={result.meta} units={units} />
        <div
          className={`grid gap-3 ${metrics.length > 4 ? 'sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-2'}`}
          data-testid="weather-metrics"
        >
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      {weather.hourly.length > 0 && <ForecastChart hourly={weather.hourly} units={units} />}
      {hourlyPreview.length > 0 && <HourlyForecast hourly={hourlyPreview} units={units} />}
      {weather.daily.length > 0 && <DailyForecast daily={weather.daily} units={units} />}

      {weather.aiSummary && (
        <section className="panel p-5 sm:p-6">
          <p className="eyebrow">AI summary</p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{weather.aiSummary}</p>
        </section>
      )}

      {hasAlerts && <WeatherAlerts alerts={weather.alerts} />}

      <section className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <ApiHealthPanel location={location} units={units} mainRequest={result.meta} />
        <AutomationPanel />
      </section>

      {payload !== null && <RawResponse payload={payload} />}
    </div>
  );
}
