export type Units = 'metric' | 'imperial';

export type LocationOption = {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

export type RequestMeta = {
  status: number;
  ok: boolean;
  latencyMs: number;
  proxyLatencyMs?: number;
  fetchedAt: string;
  rateLimit: {
    limit?: number;
    remaining?: number;
    reset?: number;
  };
};

export type ApiResult<T = unknown> = {
  data: T;
  meta: RequestMeta;
};

export type HourlyPoint = {
  time: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  rainProbability?: number;
  weatherCode?: number;
  condition?: string;
};

export type DailyPoint = {
  date: string;
  minTemperature?: number;
  maxTemperature?: number;
  rainProbability?: number;
  weatherCode?: number;
  condition?: string;
};

export type CurrentWeather = {
  temperature?: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  rainProbability?: number;
  precipitation?: number;
  airQuality?: number | string;
  weatherCode?: number;
  condition?: string;
  time?: string;
};

export type WeatherViewModel = {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  aiSummary?: string;
  alerts: string[];
};

export type HealthStatus = 'operational' | 'slow' | 'degraded' | 'failed' | 'idle';

export type HealthCheck = {
  id: string;
  label: string;
  endpoint: string;
  status: HealthStatus;
  statusCode?: number;
  latencyMs?: number;
  checkedAt?: string;
  detail?: string;
};

export type TestBucket = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
};

export type TestSummary = {
  status: 'not-run' | 'passed' | 'failed';
  generatedAt: string | null;
  api: TestBucket;
  ui: TestBucket;
  negative: TestBucket;
};

export type WorkflowState = {
  configured: boolean;
  loading: boolean;
  status: 'success' | 'failure' | 'in_progress' | 'unknown';
  updatedAt?: string;
  url?: string;
};
