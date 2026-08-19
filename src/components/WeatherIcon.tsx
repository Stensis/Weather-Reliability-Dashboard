import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Snowflake, Sun } from 'lucide-react';

export function WeatherIcon({ code, condition, className = 'h-8 w-8' }: { code?: number; condition?: string; className?: string }) {
  const text = condition?.toLowerCase() ?? '';
  if ([95, 96, 99].includes(code ?? -1) || text.includes('thunder')) return <CloudLightning className={className} />;
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1) || text.includes('snow')) return <Snowflake className={className} />;
  if ([45, 48].includes(code ?? -1) || text.includes('fog')) return <CloudFog className={className} />;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code ?? -1) || text.includes('rain') || text.includes('drizzle')) return <CloudRain className={className} />;
  if (code === 0 || text.includes('clear') || text.includes('sunny')) return <Sun className={className} />;
  if ([1, 2].includes(code ?? -1) || text.includes('partly')) return <CloudSun className={className} />;
  if (code === 3 || text.includes('cloud') || text.includes('overcast')) return <Cloud className={className} />;
  return <CloudSun className={className} />;
}
