import type { LucideIcon } from 'lucide-react';

export function MetricCard({ icon: Icon, label, value, helper }: { icon: LucideIcon; label: string; value: string; helper?: string }) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/15 hover:bg-white/[0.055]">
      <div className="mb-5 flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-slate-900/70 text-sky-300">
          <Icon className="h-4 w-4" />
        </div>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 shadow-[0_0_12px_rgba(52,211,153,.6)]" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-white">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-600">{helper}</p>}
    </div>
  );
}
