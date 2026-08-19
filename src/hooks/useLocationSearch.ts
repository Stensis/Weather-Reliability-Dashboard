import { useEffect, useState } from 'react';
import { searchLocations } from '../lib/api';
import type { LocationOption, RequestMeta } from '../types';
import { useDebouncedValue } from './useDebouncedValue';

export function useLocationSearch(query: string) {
  const debounced = useDebouncedValue(query.trim(), 320);
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<RequestMeta | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (debounced.length < 2) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    void searchLocations(debounced)
      .then(({ locations, meta: nextMeta }) => {
        if (cancelled) return;
        setResults(locations);
        setMeta(nextMeta);
      })
      .catch((reason) => {
        if (cancelled) return;
        setResults([]);
        setError(reason instanceof Error ? reason.message : 'Location search failed.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return { results, loading, error, meta };
}
