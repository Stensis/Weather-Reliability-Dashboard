import { useEffect, useState } from 'react';
import type { WorkflowState } from '../types';

const initial: WorkflowState = {
  configured: false,
  loading: false,
  status: 'unknown'
};

export function useGithubWorkflow() {
  const repository = import.meta.env.VITE_GITHUB_REPOSITORY as string | undefined;
  const [state, setState] = useState<WorkflowState>(initial);

  useEffect(() => {
    if (!repository || !repository.includes('/')) {
      setState(initial);
      return;
    }

    let cancelled = false;
    setState({ configured: true, loading: true, status: 'unknown' });

    const url = `https://api.github.com/repos/${repository}/actions/workflows/ci.yml/runs?per_page=1`;
    void fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        return response.json() as Promise<{ workflow_runs?: Array<Record<string, unknown>> }>;
      })
      .then((data) => {
        if (cancelled) return;
        const run = data.workflow_runs?.[0];
        const conclusion = String(run?.conclusion ?? '');
        const status = String(run?.status ?? '');
        setState({
          configured: true,
          loading: false,
          status: status !== 'completed'
            ? 'in_progress'
            : conclusion === 'success'
              ? 'success'
              : conclusion
                ? 'failure'
                : 'unknown',
          updatedAt: typeof run?.updated_at === 'string' ? run.updated_at : undefined,
          url: typeof run?.html_url === 'string' ? run.html_url : undefined
        });
      })
      .catch(() => {
        if (!cancelled) setState({ configured: true, loading: false, status: 'unknown' });
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return state;
}
