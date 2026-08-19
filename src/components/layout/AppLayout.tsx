import type { ReactNode } from 'react';
import { Header } from '../Header';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(14,165,233,.10),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(99,102,241,.07),transparent_26%),linear-gradient(to_bottom,#020617,#020617)]" />
      <Header />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="relative border-t border-white/[0.05] bg-slate-950/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Weather Reliability Dashboard • React + TypeScript + Tailwind + Playwright</p>
          <a
            href="https://weather-ai.co/docs"
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 transition hover:text-sky-300"
          >
            WeatherAI API documentation ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
