import type { DailyPoint, HourlyPoint, WeatherViewModel } from "../types";
import { weatherCodeLabel } from "./weatherCodes";

type Obj = Record<string, unknown>;

function isObject(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function firstValue(root: unknown, aliases: string[]): unknown {
  if (!isObject(root)) return undefined;

  for (const key of aliases) {
    const value = root[key];
    if (value !== undefined && value !== null) return value;
  }

  return undefined;
}

/**
 * Safely converts common API value shapes into a finite number.
 * Supports numbers, numeric strings, arrays and simple wrapper objects.
 */
function toFiniteNumber(value: unknown, depth = 0): number | undefined {
  if (depth > 3 || value === null || value === undefined) return undefined;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const parsed = toFiniteNumber(entry, depth + 1);
      if (parsed !== undefined) return parsed;
    }
    return undefined;
  }

  if (isObject(value)) {
    for (const key of [
      "value",
      "current",
      "amount",
      "percent",
      "percentage",
      "index",
    ]) {
      if (key in value) {
        const parsed = toFiniteNumber(value[key], depth + 1);
        if (parsed !== undefined) return parsed;
      }
    }
  }

  return undefined;
}

function numberValue(root: unknown, aliases: string[]): number | undefined {
  return toFiniteNumber(firstValue(root, aliases));
}

function stringValue(root: unknown, aliases: string[]): string | undefined {
  const raw = firstValue(root, aliases);
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

function findDeep(root: unknown, aliases: string[], depth = 0): unknown {
  if (depth > 5 || root === null || root === undefined) return undefined;

  if (isObject(root)) {
    for (const alias of aliases) {
      const value = root[alias];
      if (value !== undefined && value !== null) return value;
    }

    for (const value of Object.values(root)) {
      const found = findDeep(value, aliases, depth + 1);
      if (found !== undefined) return found;
    }
  }

  if (Array.isArray(root)) {
    for (const value of root.slice(0, 24)) {
      const found = findDeep(value, aliases, depth + 1);
      if (found !== undefined) return found;
    }
  }

  return undefined;
}

function deepNumberValue(root: unknown, aliases: string[]): number | undefined {
  return toFiniteNumber(findDeep(root, aliases));
}

function unwrapPayload(payload: unknown): unknown {
  if (!isObject(payload)) return payload;

  for (const key of ["data", "weather", "result", "payload"]) {
    const candidate = payload[key];

    if (
      isObject(candidate) &&
      [
        "current",
        "hourly",
        "daily",
        "forecast",
        "current_weather",
        "currentWeather",
      ].some((name) => name in candidate)
    ) {
      return candidate;
    }
  }

  return payload;
}

function normalizeCurrent(root: unknown) {
  const current =
    objectAt(root, ["current"]) ??
    objectAt(root, ["current_weather"]) ??
    objectAt(root, ["currentWeather"]) ??
    objectAt(root, ["conditions"]) ??
    objectAt(root, ["now"]) ??
    (isObject(root) ? root : {});

  const weatherCodeAliases = [
    "weather_code",
    "weathercode",
    "weatherCode",
    "code",
    "wmo_code",
    "wmoCode",
  ];

  const temperatureAliases = [
    "temperature_2m",
    "temperature",
    "temp",
    "temp_c",
    "temp_f",
    "temperatureC",
    "temperatureF",
    "current_temperature",
    "currentTemperature",
  ];

  const feelsLikeAliases = [
    "apparent_temperature",
    "apparentTemperature",
    "feels_like",
    "feelsLike",
    "feelslike",
    "feels_like_c",
    "feels_like_f",
    "feelslike_c",
    "feelslike_f",
    "real_feel",
    "realFeel",
  ];

  const humidityAliases = [
    "relative_humidity_2m",
    "relative_humidity",
    "relativeHumidity",
    "humidity",
    "humidity_pct",
    "humidity_percent",
    "humidityPercent",
  ];

  const windAliases = [
    "wind_speed_10m",
    "wind_speed",
    "windSpeed",
    "windspeed",
    "wind_kph",
    "wind_mph",
    "windKph",
    "windMph",
  ];

  const rainProbabilityAliases = [
    "precipitation_probability",
    "precipitationProbability",
    "rain_probability",
    "rainProbability",
    "rain_chance",
    "rainChance",
    "chance_of_rain",
    "chanceOfRain",
    "precip_probability",
    "precipProbability",
    "pop",
  ];

  const weatherCode =
    numberValue(current, weatherCodeAliases) ??
    deepNumberValue(root, weatherCodeAliases);

  const condition =
    stringValue(current, [
      "condition",
      "weather_description",
      "weatherDescription",
      "description",
      "summary",
      "text",
    ]) ?? weatherCodeLabel(weatherCode);

  const temperature =
    numberValue(current, temperatureAliases) ??
    deepNumberValue(root, temperatureAliases);

  const feelsLike =
    numberValue(current, feelsLikeAliases) ??
    deepNumberValue(root, feelsLikeAliases);

  const humidity =
    numberValue(current, humidityAliases) ??
    deepNumberValue(root, humidityAliases);

  const windSpeed =
    numberValue(current, windAliases) ??
    deepNumberValue(root, windAliases);

  const rainProbability =
    numberValue(current, rainProbabilityAliases) ??
    deepNumberValue(root, rainProbabilityAliases);

  const precipitation =
    numberValue(current, [
      "precipitation",
      "rain",
      "rainfall",
      "precip",
      "precip_mm",
      "precipMm",
    ]) ??
    deepNumberValue(root, [
      "precipitation",
      "rainfall",
      "precip_mm",
      "precipMm",
    ]);

  const airQualityRaw =
    firstValue(current, [
      "air_quality",
      "airQuality",
      "aqi",
      "air_quality_index",
      "airQualityIndex",
    ]) ??
    findDeep(root, [
      "air_quality",
      "airQuality",
      "aqi",
      "air_quality_index",
      "airQualityIndex",
    ]);

  const airQuality = isObject(airQualityRaw)
    ? firstValue(airQualityRaw, [
        "aqi",
        "us_aqi",
        "usAqi",
        "index",
        "value",
        "label",
      ])
    : airQualityRaw;

  return {
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    rainProbability,
    precipitation,
    airQuality:
      typeof airQuality === "number" || typeof airQuality === "string"
        ? airQuality
        : undefined,
    weatherCode,
    condition,
    time: stringValue(current, [
      "time",
      "timestamp",
      "observed_at",
      "observedAt",
      "updated_at",
      "updatedAt",
    ]),
  };
}

function arrayFromObject(source: Obj, aliases: string[]): unknown[] {
  for (const key of aliases) {
    const value = source[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function normalizeHourly(root: unknown): HourlyPoint[] {
  const source =
    valueAt(root, ["hourly"]) ??
    valueAt(root, ["forecast", "hourly"]) ??
    valueAt(root, ["hourly_forecast"]) ??
    valueAt(root, ["hourlyForecast"]) ??
    findDeep(root, ["hourly", "hourly_forecast", "hourlyForecast"]);

  if (Array.isArray(source)) {
    return source
      .filter(isObject)
      .map((item, index): HourlyPoint => {
        const weatherCode = numberValue(item, [
          "weather_code",
          "weathercode",
          "weatherCode",
          "code",
          "wmo_code",
          "wmoCode",
        ]);

        return {
          time:
            stringValue(item, ["time", "timestamp", "datetime", "date"]) ??
            String(index),
          temperature: numberValue(item, [
            "temperature_2m",
            "temperature",
            "temp",
            "temp_c",
            "temp_f",
          ]),
          humidity: numberValue(item, [
            "relative_humidity_2m",
            "relative_humidity",
            "relativeHumidity",
            "humidity",
            "humidity_pct",
            "humidity_percent",
            "humidityPercent",
          ]),
          windSpeed: numberValue(item, [
            "wind_speed_10m",
            "wind_speed",
            "windSpeed",
            "windspeed",
            "wind_kph",
            "wind_mph",
            "windKph",
            "windMph",
          ]),
          rainProbability: numberValue(item, [
            "precipitation_probability",
            "precipitationProbability",
            "rain_probability",
            "rainProbability",
            "rain_chance",
            "rainChance",
            "chance_of_rain",
            "chanceOfRain",
            "precip_probability",
            "precipProbability",
            "pop",
          ]),
          weatherCode,
          condition:
            stringValue(item, [
              "condition",
              "description",
              "summary",
              "weather_description",
              "weatherDescription",
            ]) ?? weatherCodeLabel(weatherCode),
        };
      })
      .filter(
        (item) =>
          item.temperature !== undefined ||
          item.rainProbability !== undefined ||
          item.humidity !== undefined ||
          item.windSpeed !== undefined,
      );
  }

  if (isObject(source)) {
    const times = arrayFromObject(source, [
      "time",
      "times",
      "timestamp",
      "datetime",
      "date",
    ]);

    const temperatures = arrayFromObject(source, [
      "temperature_2m",
      "temperature",
      "temperatures",
      "temp",
      "temp_c",
      "temp_f",
    ]);

    const humidity = arrayFromObject(source, [
      "relative_humidity_2m",
      "relative_humidity",
      "relativeHumidity",
      "humidity",
      "humidity_pct",
      "humidity_percent",
      "humidityPercent",
    ]);

    const wind = arrayFromObject(source, [
      "wind_speed_10m",
      "wind_speed",
      "windSpeed",
      "windspeed",
      "wind_kph",
      "wind_mph",
      "windKph",
      "windMph",
    ]);

    const rain = arrayFromObject(source, [
      "precipitation_probability",
      "precipitationProbability",
      "rain_probability",
      "rainProbability",
      "rain_chance",
      "rainChance",
      "chance_of_rain",
      "chanceOfRain",
      "precip_probability",
      "precipProbability",
      "pop",
    ]);

    const codes = arrayFromObject(source, [
      "weather_code",
      "weathercode",
      "weatherCode",
      "code",
      "wmo_code",
      "wmoCode",
    ]);

    const conditions = arrayFromObject(source, [
      "condition",
      "conditions",
      "description",
      "descriptions",
      "summary",
      "weather_description",
      "weatherDescription",
    ]);

    const count = Math.max(
      times.length,
      temperatures.length,
      humidity.length,
      wind.length,
      rain.length,
      codes.length,
      conditions.length,
    );

    return Array.from({ length: count }, (_, index): HourlyPoint => {
      const numberAt = (values: unknown[]) => toFiniteNumber(values[index]);
      const weatherCode = numberAt(codes);
      const conditionValue = conditions[index];

      return {
        time: String(times[index] ?? index),
        temperature: numberAt(temperatures),
        humidity: numberAt(humidity),
        windSpeed: numberAt(wind),
        rainProbability: numberAt(rain),
        weatherCode,
        condition:
          typeof conditionValue === "string" && conditionValue.trim()
            ? conditionValue.trim()
            : weatherCodeLabel(weatherCode),
      };
    }).filter(
      (item) =>
        item.temperature !== undefined ||
        item.rainProbability !== undefined ||
        item.humidity !== undefined ||
        item.windSpeed !== undefined,
    );
  }

  return [];
}

function normalizeDaily(root: unknown): DailyPoint[] {
  const source =
    valueAt(root, ["daily"]) ??
    valueAt(root, ["forecast", "daily"]) ??
    valueAt(root, ["daily_forecast"]) ??
    valueAt(root, ["dailyForecast"]) ??
    findDeep(root, ["daily", "daily_forecast", "dailyForecast"]);

  if (Array.isArray(source)) {
    return source.filter(isObject).map((item, index): DailyPoint => {
      const weatherCode = numberValue(item, [
        "weather_code",
        "weathercode",
        "weatherCode",
        "code",
        "wmo_code",
        "wmoCode",
      ]);

      return {
        date:
          stringValue(item, ["date", "time", "datetime", "timestamp"]) ??
          String(index),
        minTemperature: numberValue(item, [
          "temperature_2m_min",
          "temp_min",
          "min_temperature",
          "minTemperature",
          "min_temp",
          "low",
          "low_temp",
          "lowTemp",
        ]),
        maxTemperature: numberValue(item, [
          "temperature_2m_max",
          "temp_max",
          "max_temperature",
          "maxTemperature",
          "max_temp",
          "high",
          "high_temp",
          "highTemp",
          "temperature",
        ]),
        rainProbability: numberValue(item, [
          "precipitation_probability_max",
          "precipitation_probability",
          "precipitationProbability",
          "rain_probability",
          "rainProbability",
          "rain_chance",
          "rainChance",
          "chance_of_rain",
          "chanceOfRain",
          "pop",
        ]),
        weatherCode,
        condition:
          stringValue(item, [
            "condition",
            "description",
            "summary",
            "weather_description",
            "weatherDescription",
          ]) ?? weatherCodeLabel(weatherCode),
      };
    });
  }

  if (isObject(source)) {
    const dates = arrayFromObject(source, ["time", "date", "dates"]);

    const minTemps = arrayFromObject(source, [
      "temperature_2m_min",
      "temp_min",
      "min_temperature",
      "minTemperature",
      "min_temp",
      "low",
      "low_temp",
      "lowTemp",
    ]);

    const maxTemps = arrayFromObject(source, [
      "temperature_2m_max",
      "temp_max",
      "max_temperature",
      "maxTemperature",
      "max_temp",
      "high",
      "high_temp",
      "highTemp",
      "temperature",
    ]);

    const rain = arrayFromObject(source, [
      "precipitation_probability_max",
      "precipitation_probability",
      "precipitationProbability",
      "rain_probability",
      "rainProbability",
      "rain_chance",
      "rainChance",
      "chance_of_rain",
      "chanceOfRain",
      "pop",
    ]);

    const codes = arrayFromObject(source, [
      "weather_code",
      "weathercode",
      "weatherCode",
      "code",
      "wmo_code",
      "wmoCode",
    ]);

    const conditions = arrayFromObject(source, [
      "condition",
      "conditions",
      "description",
      "descriptions",
      "summary",
      "weather_description",
      "weatherDescription",
    ]);

    const count = Math.max(
      dates.length,
      minTemps.length,
      maxTemps.length,
      rain.length,
      codes.length,
      conditions.length,
    );

    return Array.from({ length: count }, (_, index): DailyPoint => {
      const numberAt = (values: unknown[]) => toFiniteNumber(values[index]);
      const weatherCode = numberAt(codes);
      const conditionValue = conditions[index];

      return {
        date: String(dates[index] ?? index),
        minTemperature: numberAt(minTemps),
        maxTemperature: numberAt(maxTemps),
        rainProbability: numberAt(rain),
        weatherCode,
        condition:
          typeof conditionValue === "string" && conditionValue.trim()
            ? conditionValue.trim()
            : weatherCodeLabel(weatherCode),
      };
    });
  }

  return [];
}

function dailyFromHourly(hourly: HourlyPoint[]): DailyPoint[] {
  const groups = new Map<string, HourlyPoint[]>();

  for (const point of hourly) {
    const date = point.time.includes("T")
      ? point.time.split("T")[0]
      : point.time.slice(0, 10);

    if (!date) continue;
    groups.set(date, [...(groups.get(date) ?? []), point]);
  }

  return [...groups.entries()].map(([date, points]) => {
    const temperatures = points
      .map((point) => point.temperature)
      .filter((value): value is number => value !== undefined);

    const rain = points
      .map((point) => point.rainProbability)
      .filter((value): value is number => value !== undefined);

    const code = points.find(
      (point) => point.weatherCode !== undefined,
    )?.weatherCode;

    return {
      date,
      minTemperature: temperatures.length
        ? Math.min(...temperatures)
        : undefined,
      maxTemperature: temperatures.length
        ? Math.max(...temperatures)
        : undefined,
      rainProbability: rain.length ? Math.max(...rain) : undefined,
      weatherCode: code,
      condition: weatherCodeLabel(code),
    };
  });
}

function normalizeAlerts(root: unknown): string[] {
  const source = findDeep(root, [
    "alerts",
    "warnings",
    "risk_flags",
    "riskFlags",
    "weather_alerts",
    "weatherAlerts",
    "risks",
  ]);

  const entries = Array.isArray(source) ? source : source ? [source] : [];

  return entries
    .map((item) => {
      if (typeof item === "string") return item;

      if (isObject(item)) {
        return stringValue(item, [
          "title",
          "message",
          "description",
          "name",
          "text",
          "summary",
        ]);
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

  // Prefer current conditions, then fall back to the first hourly point.
  if (current.rainProbability === undefined) {
    current.rainProbability = hourly[0]?.rainProbability;
  }

  if (current.temperature === undefined) {
    current.temperature = hourly[0]?.temperature;
  }

  if (current.humidity === undefined) {
    current.humidity = hourly[0]?.humidity;
  }

  if (current.windSpeed === undefined) {
    current.windSpeed = hourly[0]?.windSpeed;
  }

  if (current.weatherCode === undefined) {
    current.weatherCode = hourly[0]?.weatherCode;
  }

  if (!current.condition) {
    current.condition =
      hourly[0]?.condition ?? weatherCodeLabel(current.weatherCode);
  }

  const aiValue = findDeep(root, [
    "ai_summary",
    "aiSummary",
    "ai_insight",
    "aiInsight",
    "insight",
    "analysis",
  ]);

  const aiSummary =
    typeof aiValue === "string" && aiValue.trim()
      ? aiValue.trim()
      : undefined;

  return {
    current,
    hourly: hourly.slice(0, 24),
    daily: (daily.length ? daily : dailyFromHourly(hourly)).slice(0, 7),
    aiSummary,
    alerts: normalizeAlerts(root),
  };
}

export function findUsage(payload: unknown) {
  const root = unwrapPayload(payload);

  const read = (aliases: string[]) => deepNumberValue(root, aliases);

  return {
    used: read([
      "requests_used",
      "requestsUsed",
      "request_count",
      "requestCount",
      "requests",
      "used",
    ]),
    limit: read([
      "request_limit",
      "requestLimit",
      "monthly_limit",
      "monthlyLimit",
      "limit",
    ]),
    remaining: read([
      "requests_remaining",
      "requestsRemaining",
      "remaining",
    ]),
  };
}