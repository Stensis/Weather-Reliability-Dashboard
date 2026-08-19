import { Activity, CloudSun, Github, Sparkles } from 'lucide-react';

export function Header() {
  const repo = import.meta.env.VITE_GITHUB_REPOSITORY as string | undefined;
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-400/10 text-sky-300 shadow-glow">
            <CloudSun className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold tracking-wide text-white sm:text-base">Weather Reliability Dashboard</p>
              <Sparkles className="hidden h-4 w-4 text-cyan-300 sm:block" />
            </div>
            <p className="truncate text-xs text-slate-500">WeatherAI integration • observability • QA automation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300 sm:flex">
            <Activity className="h-3.5 w-3.5" />
            Live API
          </div>
          {repo && (
            <a
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noreferrer"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:text-white"
              aria-label="Open GitHub repository"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
