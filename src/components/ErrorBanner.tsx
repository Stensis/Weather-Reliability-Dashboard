import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export function ErrorBanner({ message, onRetry, onDismiss }: { message: string; onRetry?: () => void; onDismiss: () => void }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-rose-400/20 bg-rose-400/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between" role="alert" data-testid="error-banner">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-400/10 text-rose-300"><AlertTriangle className="h-5 w-5" /></div>
        <div>
          <p className="text-sm font-semibold text-rose-100">Weather request could not be completed</p>
          <p className="mt-1 text-sm text-rose-200/70">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-13 sm:pl-0">
        {onRetry && <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl border border-rose-200/10 bg-rose-200/10 px-3 py-2 text-xs font-medium text-rose-100 transition hover:bg-rose-200/15"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>}
        <button onClick={onDismiss} className="grid h-9 w-9 place-items-center rounded-xl text-rose-200/60 transition hover:bg-white/5 hover:text-rose-100" aria-label="Dismiss error"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
