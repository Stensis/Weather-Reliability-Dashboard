import { useCallback, useState } from 'react';
import { timedJsonFetch, weatherUrl } from '../lib/api';
import { normalizeWeather } from '../lib/normalize';
import type { ApiResult, LocationOption, Units, WeatherViewModel } from '../types';

export function useWeather() {
  const [payload, setPayload] = useState<unknown>(null);
  const [weather, setWeather] = useState<WeatherViewModel | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (location: LocationOption, days: number, units: Units) => {
    setLoading(true);
    setError('');
    setPayload(null);
    setWeather(null);
    setResult(null);
    try {
      const next = await timedJsonFetch(weatherUrl('weather', {
        lat: location.latitude,
        lon: location.longitude,
        days,
        units
      }));
      setPayload(next.data);
      setResult(next);
      setWeather(normalizeWeather(next.data));
      return next;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Weather request failed.';
      setError(message);
      throw reason;
    } finally {
      setLoading(false);
    }
  }, []);

  return { payload, weather, result, loading, error, load, setError };
}
