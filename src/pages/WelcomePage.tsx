import { AutomationPanel } from '../components/AutomationPanel';
import { EmptyState } from '../components/EmptyState';

export function WelcomePage() {
  return (
    <div className="space-y-6">
      <EmptyState />
      <AutomationPanel />
    </div>
  );
}
