import { Braces, ChevronDown } from 'lucide-react';

export function RawResponse({ payload }: { payload: unknown }) {
  return (
    <details className="panel group overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] text-sky-300"><Braces className="h-4 w-4" /></div>
          <div>
            <p className="text-sm font-medium text-slate-200">Raw WeatherAI response</p>
            <p className="mt-0.5 text-xs text-slate-600">Open for payload traceability and debugging.</p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-600 transition group-open:rotate-180" />
      </summary>
      <pre className="max-h-[520px] overflow-auto border-t border-white/[0.06] bg-slate-950/70 p-5 text-xs leading-6 text-slate-400">{JSON.stringify(payload, null, 2)}</pre>
    </details>
  );
}
