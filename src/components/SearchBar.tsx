import { LocateFixed, Loader2, MapPin, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { locationLabel } from '../lib/format';
import type { LocationOption, RequestMeta } from '../types';
import { useLocationSearch } from '../hooks/useLocationSearch';

export function SearchBar({
  onSelect,
  onUseBrowserLocation,
  selected,
  onSearchMeta
}: {
  onSelect: (location: LocationOption) => void;
  onUseBrowserLocation: () => void;
  selected: LocationOption | null;
  onSearchMeta: (meta: RequestMeta | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { results, loading, error, meta } = useLocationSearch(query);

  useEffect(() => onSearchMeta(meta), [meta, onSearchMeta]);
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const select = (location: LocationOption) => {
    setQuery(locationLabel(location));
    setOpen(false);
    onSelect(location);
  };

  return (
    <div ref={wrapperRef} className="relative z-30 w-full" data-testid="location-search">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search any city or place..."
            className="h-14 w-full rounded-2xl border border-white/[0.08] bg-slate-950/70 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-4 focus:ring-sky-400/[0.06]"
            aria-label="Search location"
            data-testid="location-input"
          />
          {loading ? (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-sky-300" data-testid="search-loader" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setOpen(false);
              }}
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-600 transition hover:bg-white/5 hover:text-slate-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          {open && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl" data-testid="search-results">
              {loading && results.length === 0 ? (
                <div className="space-y-3 p-3">
                  {[0, 1, 2].map((item) => <div key={item} className="shimmer h-12 rounded-xl" />)}
                </div>
              ) : error ? (
                <p className="p-4 text-sm text-rose-300">{error}</p>
              ) : results.length ? (
                <div className="p-2">
                  {results.map((location) => (
                    <button
                      type="button"
                      key={location.id}
                      onClick={() => select(location)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.05]"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-400/10 text-sky-300"><MapPin className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">{location.name}</p>
                        <p className="truncate text-xs text-slate-500">{[location.admin1, location.country].filter(Boolean).join(', ') || 'Location result'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm text-slate-500">No matching locations found.</p>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onUseBrowserLocation}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-sky-300/15 bg-sky-400/10 px-5 text-sm font-medium text-sky-200 transition hover:border-sky-300/30 hover:bg-sky-400/15"
        >
          <LocateFixed className="h-4 w-4" />
          Use my location
        </button>
      </div>
      {selected && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" /> Showing {locationLabel(selected)}</p>}
    </div>
  );
}
