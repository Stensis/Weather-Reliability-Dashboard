import { useEffect, useState } from 'react';
import type { TestSummary } from '../types';

const EMPTY: TestSummary = {
  status: 'not-run',
  generatedAt: null,
  api: { total: 0, passed: 0, failed: 0, skipped: 0 },
  ui: { total: 0, passed: 0, failed: 0, skipped: 0 },
  negative: { total: 0, passed: 0, failed: 0, skipped: 0 }
};

export function useTestSummary() {
  const [summary, setSummary] = useState<TestSummary>(EMPTY);

  useEffect(() => {
    void fetch(`/test-summary.json?ts=${Date.now()}`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() as Promise<TestSummary> : Promise.reject())
      .then(setSummary)
      .catch(() => setSummary(EMPTY));
  }, []);

  return summary;
}
