import { CloudSun, Search, ShieldCheck, Zap } from 'lucide-react';

export function EmptyState() {
  return (
    <section className="panel relative overflow-hidden p-8 sm:p-12" data-testid="empty-state">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-400/[0.08] blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-500/[0.06] blur-3xl" />
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto grid h-20 w-20 animate-float place-items-center rounded-[1.75rem] border border-sky-300/15 bg-gradient-to-br from-sky-400/15 to-indigo-400/10 text-sky-200 shadow-glow">
          <CloudSun className="h-10 w-10" />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Ready for a live request</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Search a location to start the reliability check.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400">The dashboard does not ship with fake weather values. Select a real place and the UI will populate from WeatherAI, measure the request, and expose the quality signals underneath.</p>
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {[
            [Search, 'Dynamic search', 'City results resolve to real coordinates.'],
            [Zap, 'Live latency', 'Response time is measured per request.'],
            [ShieldCheck, 'QA first', 'Automation and negative coverage are visible.']
          ].map(([Icon, title, detail]) => {
            const IconComponent = Icon as typeof Search;
            return (
              <div key={String(title)} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <IconComponent className="h-4 w-4 text-sky-300" />
                <p className="mt-3 text-sm font-medium text-slate-200">{String(title)}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{String(detail)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
