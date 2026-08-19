import type { DailyPoint, HourlyPoint, WeatherViewModel } from '../types';
import { weatherCodeLabel } from './weatherCodes';

type Obj = Record<string, unknown>;

function isObject(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function objectAt(root: unknown, path: string[]): Obj | undefined {
  let current: unknown = root;
  for (const key of path) {
    if (!isObject(current)) return undefined;
    current = current[key];
  }
  return isObject(current) ? current : undefined;
}

function valueAt(root: unknown, path: string[]): unknown {
  let current: unknown = root;
  for (const key of path) {
    if (!isObject(current)) return undefined;
    current = current[key];
  }
  return current;
}

function firstValue(root: unknown, aliases: string[]) {
  if (!isObject(root)) return undefined;
  for (const key of aliases) {
    const value = root[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function numberValue(root: unknown, aliases: string[]) {
  const raw = firstValue(root, aliases);
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function stringValue(root: unknown, aliases: string[]) {
  const raw = firstValue(root, aliases);
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
}

function findDeep(root: unknown, aliases: string[], depth = 0): unknown {
  if (depth > 4 || root == null) return undefined;
  if (isObject(root)) {
    for (const alias of aliases) {
      if (root[alias] !== undefined && root[alias] !== null) return root[alias];
    }
    for (const value of Object.values(root)) {
      const found = findDeep(value, aliases, depth + 1);
      if (found !== undefined) return found;
    }
  }
  if (Array.isArray(root)) {
    for (const value of root.slice(0, 8)) {
      const found = findDeep(value, aliases, depth + 1);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function unwrapPayload(payload: unknown) {
  if (!isObject(payload)) return payload;
  for (const key of ['data', 'weather', 'result', 'payload']) {
    const candidate = payload[key];
    if (isObject(candidate) && ['current', 'hourly', 'daily', 'forecast', 'current_weather'].some((name) => name in candidate)) {
      return candidate;
    }
  }
  return payload;
}

function normalizeCurrent(root: unknown) {
  const current =
    objectAt(root, ['current']) ??
    objectAt(root, ['current_weather']) ??
    objectAt(root, ['conditions']) ??
    objectAt(root, ['now']) ??
    (isObject(root) ? root : {});

  const weatherCode = numberValue(current, ['weather_code', 'weathercode', 'code', 'wmo_code']);
  const condition =
    stringValue(current, ['condition', 'weather_description', 'description', 'summary', 'text']) ??
    weatherCodeLabel(weatherCode);

  const airQualityRaw = firstValue(current, ['air_quality', 'aqi', 'air_quality_index']);
  const airQuality = isObject(airQualityRaw)
    ? firstValue(airQualityRaw, ['aqi', 'us_aqi', 'index', 'value', 'label'])
    : airQualityRaw;

  return {
    temperature: numberValue(current, ['temperature_2m', 'temperature', 'temp', 'temp_c', 'temp_f']),
    feelsLike: numberValue(current, ['apparent_temperature', 'feels_like', 'feelslike', 'real_feel']),
    humidity: numberValue(current, ['relative_humidity_2m', 'relative_humidity', 'humidity', 'humidity_pct']),
    windSpeed: numberValue(current, ['wind_speed_10m', 'wind_speed', 'windspeed', 'wind_kph', 'wind_mph']),
    rainProbability: numberValue(current, ['precipitation_probability', 'rain_probability', 'chance_of_rain', 'pop']),
    precipitation: numberValue(current, ['precipitation', 'rain', 'rainfall']),
    airQuality: typeof airQuality === 'number' || typeof airQuality === 'string' ? airQuality : undefined,
    weatherCode,
    condition,
    time: stringValue(current, ['time', 'timestamp', 'observed_at', 'updated_at'])
  };
}

function arrayFromObject(source: Obj, aliases: string[]) {
  for (const key of aliases) {
    const value = source[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeHourly(root: unknown): HourlyPoint[] {
  const source =
    valueAt(root, ['hourly']) ??
    valueAt(root, ['forecast', 'hourly']) ??
    valueAt(root, ['hourly_forecast']) ??
    findDeep(root, ['hourly']);

  if (Array.isArray(source)) {
    return source
      .filter(isObject)
      .map((item, index) => {
        const weatherCode = numberValue(item, ['weather_code', 'weathercode', 'code']);
        return {
          time: stringValue(item, ['time', 'timestamp', 'datetime', 'date']) ?? String(index),
          temperature: numberValue(item, ['temperature_2m', 'temperature', 'temp']),
          humidity: numberValue(item, ['relative_humidity_2m', 'relative_humidity', 'humidity']),
          windSpeed: numberValue(item, ['wind_speed_10m', 'wind_speed', 'windspeed']),
          rainProbability: numberValue(item, ['precipitation_probability', 'rain_probability', 'chance_of_rain', 'pop']),
          weatherCode,
          condition: stringValue(item, ['condition', 'description', 'summary']) ?? weatherCodeLabel(weatherCode)
        };
      })
      .filter((item) => item.temperature !== undefined || item.rainProbability !== undefined);
  }

  if (isObject(source)) {
    const times = arrayFromObject(source, ['time', 'times', 'timestamp', 'datetime']);
    const temperatures = arrayFromObject(source, ['temperature_2m', 'temperature', 'temperatures', 'temp']);
    const humidity = arrayFromObject(source, ['relative_humidity_2m', 'relative_humidity', 'humidity']);
    const wind = arrayFromObject(source, ['wind_speed_10m', 'wind_speed', 'windspeed']);
    const rain = arrayFromObject(source, ['precipitation_probability', 'rain_probability', 'chance_of_rain', 'pop']);
    const codes = arrayFromObject(source, ['weather_code', 'weathercode', 'code']);
    const count = Math.max(times.length, temperatures.length, humidity.length, wind.length, rain.length, codes.length);

    return Array.from({ length: count }, (_, index) => {
      const code = Number(codes[index]);
      const weatherCode = Number.isFinite(code) ? code : undefined;
      const numberAt = (values: unknown[]) => {
        const value = Number(values[index]);
        return Number.isFinite(value) ? value : undefined;
      };
      return {
        time: String(times[index] ?? index),
        temperature: numberAt(temperatures),
        humidity: numberAt(humidity),
        windSpeed: numberAt(wind),
        rainProbability: numberAt(rain),
        weatherCode,
        condition: weatherCodeLabel(weatherCode)
      };
    }).filter((item) => item.temperature !== undefined || item.rainProbability !== undefined);
  }

  return [];
}

function normalizeDaily(root: unknown): DailyPoint[] {
  const source =
    valueAt(root, ['daily']) ??
    valueAt(root, ['forecast', 'daily']) ??
    valueAt(root, ['daily_forecast']) ??
    findDeep(root, ['daily']);

  if (Array.isArray(source)) {
    return source
      .filter(isObject)
      .map((item, index) => {
        const weatherCode = numberValue(item, ['weather_code', 'weathercode', 'code']);
        return {
          date: stringValue(item, ['date', 'time', 'datetime', 'timestamp']) ?? String(index),
          minTemperature: numberValue(item, ['temperature_2m_min', 'temp_min', 'min_temperature', 'min_temp']),
          maxTemperature: numberValue(item, ['temperature_2m_max', 'temp_max', 'max_temperature', 'max_temp', 'temperature']),
          rainProbability: numberValue(item, ['precipitation_probability_max', 'precipitation_probability', 'rain_probability', 'chance_of_rain', 'pop']),
          weatherCode,
          condition: stringValue(item, ['condition', 'description', 'summary']) ?? weatherCodeLabel(weatherCode)
        };
      });
  }

  if (isObject(source)) {
    const dates = arrayFromObject(source, ['time', 'date', 'dates']);
    const minTemps = arrayFromObject(source, ['temperature_2m_min', 'temp_min', 'min_temperature']);
    const maxTemps = arrayFromObject(source, ['temperature_2m_max', 'temp_max', 'max_temperature', 'temperature']);
    const rain = arrayFromObject(source, ['precipitation_probability_max', 'precipitation_probability', 'rain_probability']);
    const codes = arrayFromObject(source, ['weather_code', 'weathercode', 'code']);
    const count = Math.max(dates.length, minTemps.length, maxTemps.length, rain.length, codes.length);

    return Array.from({ length: count }, (_, index) => {
      const parseNumber = (values: unknown[]) => {
        const value = Number(values[index]);
        return Number.isFinite(value) ? value : undefined;
      };
      const code = Number(codes[index]);
      const weatherCode = Number.isFinite(code) ? code : undefined;
      return {
        date: String(dates[index] ?? index),
        minTemperature: parseNumber(minTemps),
        maxTemperature: parseNumber(maxTemps),
        rainProbability: parseNumber(rain),
        weatherCode,
        condition: weatherCodeLabel(weatherCode)
      };
    });
  }

  return [];
}

function dailyFromHourly(hourly: HourlyPoint[]): DailyPoint[] {
  const groups = new Map<string, HourlyPoint[]>();
  for (const point of hourly) {
    const date = point.time.includes('T') ? point.time.split('T')[0] : point.time.slice(0, 10);
    if (!date) continue;
    groups.set(date, [...(groups.get(date) ?? []), point]);
  }

  return [...groups.entries()].map(([date, points]) => {
    const temperatures = points.map((point) => point.temperature).filter((value): value is number => value !== undefined);
    const rain = points.map((point) => point.rainProbability).filter((value): value is number => value !== undefined);
    const code = points.find((point) => point.weatherCode !== undefined)?.weatherCode;
    return {
      date,
      minTemperature: temperatures.length ? Math.min(...temperatures) : undefined,
      maxTemperature: temperatures.length ? Math.max(...temperatures) : undefined,
      rainProbability: rain.length ? Math.max(...rain) : undefined,
      weatherCode: code,
      condition: weatherCodeLabel(code)
    };
  });
}

function normalizeAlerts(root: unknown) {
  const source = findDeep(root, ['alerts', 'warnings', 'risk_flags', 'weather_alerts', 'risks']);
  const entries = Array.isArray(source) ? source : source ? [source] : [];
  return entries
    .map((item) => {
      if (typeof item === 'string') return item;
      if (isObject(item)) {
        return stringValue(item, ['title', 'message', 'description', 'name', 'text', 'summary']);
      }
      return undefined;
    })
    .filter((value): value is string => Boolean(value));
}

export function normalizeWeather(payload: unknown): WeatherViewModel {
  const root = unwrapPayload(payload);
  const hourly = normalizeHourly(root);
  const daily = normalizeDaily(root);
  const current = normalizeCurrent(root);

  if (current.rainProbability === undefined) current.rainProbability = hourly[0]?.rainProbability;
  if (current.temperature === undefined) current.temperature = hourly[0]?.temperature;
  if (current.humidity === undefined) current.humidity = hourly[0]?.humidity;
  if (current.windSpeed === undefined) current.windSpeed = hourly[0]?.windSpeed;
  if (current.weatherCode === undefined) current.weatherCode = hourly[0]?.weatherCode;
  if (!current.condition) current.condition = hourly[0]?.condition ?? weatherCodeLabel(current.weatherCode);

  const aiValue = findDeep(root, ['ai_summary', 'aiSummary', 'ai_insight', 'insight', 'analysis']);
  const aiSummary = typeof aiValue === 'string' && aiValue.trim() ? aiValue.trim() : undefined;

  return {
    current,
    hourly: hourly.slice(0, 24),
    daily: (daily.length ? daily : dailyFromHourly(hourly)).slice(0, 7),
    aiSummary,
    alerts: normalizeAlerts(root)
  };
}

export function findUsage(payload: unknown) {
  const root = unwrapPayload(payload);
  const read = (aliases: string[]) => {
    const raw = findDeep(root, aliases);
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  };
  return {
    used: read(['requests_used', 'request_count', 'requests', 'used']),
    limit: read(['request_limit', 'monthly_limit', 'limit']),
    remaining: read(['requests_remaining', 'remaining'])
  };
}
