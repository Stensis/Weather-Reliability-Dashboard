import { RefreshCw } from 'lucide-react';

export function RefreshBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-sky-400/10 bg-sky-400/[0.05] px-4 py-2.5 text-xs text-sky-300">
      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      Refreshing live WeatherAI data…
    </div>
  );
}
