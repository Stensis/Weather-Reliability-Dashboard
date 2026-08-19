export function formatTemperature(value: number | undefined, units: 'metric' | 'imperial') {
  return Number.isFinite(value) ? `${Math.round(value as number)}°${units === 'metric' ? 'C' : 'F'}` : '—';
}

export function formatPercent(value: number | undefined) {
  return Number.isFinite(value) ? `${Math.round(value as number)}%` : '—';
}

export function formatWind(value: number | undefined, units: 'metric' | 'imperial') {
  return Number.isFinite(value) ? `${Math.round(value as number)} ${units === 'metric' ? 'km/h' : 'mph'}` : '—';
}

export function formatTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

export function formatUpdatedAt(value?: string) {
  if (!value) return 'Not checked';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
}

export function locationLabel(location: { name: string; admin1?: string; country?: string }) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}
