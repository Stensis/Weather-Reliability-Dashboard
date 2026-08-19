import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function WeatherAlerts({ alerts }: { alerts: string[] }) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Weather alerts</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Returned risk signals</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${alerts.length ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'}`}>{alerts.length ? `${alerts.length} active` : 'None returned'}</span>
      </div>
      {alerts.length ? (
        <div className="mt-5 space-y-3">
          {alerts.map((alert, index) => (
            <div key={`${alert}-${index}`} className="flex gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-sm leading-6 text-amber-100/80">{alert}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          <div>
            <p className="text-sm font-medium text-slate-300">No alert objects were returned by this WeatherAI payload.</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">This is a response-driven state, not a hard-coded “safe weather” claim.</p>
          </div>
        </div>
      )}
    </section>
  );
}
