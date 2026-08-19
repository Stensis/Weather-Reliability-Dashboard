import { CloudRain, Droplets, Gauge, ThermometerSun, Wind } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatPercent, formatTemperature, formatWind } from '../lib/format';
import { useWeather } from './useWeather';
import type { LocationOption, RequestMeta, Units } from '../types';

export function useDashboardController() {
  const [location, setLocation] = useState<LocationOption | null>(null);
  const [units, setUnits] = useState<Units>('metric');
  const [days, setDays] = useState(7);
  const [searchMeta, setSearchMeta] = useState<RequestMeta | null>(null);
  const weatherState = useWeather();
  const { weather, load, setError } = weatherState;

  useEffect(() => {
    if (!location) return;
    void load(location, days, units).catch(() => undefined);
  }, [location, days, units, load]);

  const handleSearchMeta = useCallback((meta: RequestMeta | null) => {
    setSearchMeta(meta);
  }, []);

  const useBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Browser geolocation is not supported on this device. Search for a city instead.');
      return;
    }

    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          id: 'browser-location',
          name: 'Current location',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setError('Location permission was denied or unavailable. Search for a city instead.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [setError]);

  const retry = useCallback(() => {
    if (!location) return;
    void load(location, days, units).catch(() => undefined);
  }, [location, days, units, load]);

  const metrics = useMemo(() => {
    if (!weather) return [];
    const current = weather.current;
    const items = [
      { icon: Droplets, label: 'Humidity', value: formatPercent(current.humidity), helper: 'Relative humidity' },
      { icon: Wind, label: 'Wind', value: formatWind(current.windSpeed, units), helper: 'Current wind speed' },
      { icon: CloudRain, label: 'Rain chance', value: formatPercent(current.rainProbability), helper: 'Precipitation probability' },
      { icon: ThermometerSun, label: 'Feels like', value: formatTemperature(current.feelsLike, units), helper: 'Apparent temperature' },
    ];

    if (current.airQuality !== undefined) {
      items.push({ icon: Gauge, label: 'Air quality', value: String(current.airQuality), helper: 'Air quality index' });
    }

    return items;
  }, [weather, units]);

  const hourlyPreview = useMemo(() => weather?.hourly?.slice(0, 8) ?? [], [weather]);

  return {
    ...weatherState,
    location,
    units,
    days,
    searchMeta,
    metrics,
    hourlyPreview,
    hasAlerts: Boolean(weather?.alerts?.length),
    setLocation,
    setUnits,
    setDays,
    handleSearchMeta,
    useBrowserLocation,
    retry,
  };
}
