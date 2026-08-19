import { DashboardHero } from '../components/dashboard/DashboardHero';
import { RefreshBanner } from '../components/dashboard/RefreshBanner';
import { ErrorBanner } from '../components/ErrorBanner';
import { WeatherLoadingSkeleton } from '../components/LoadingSkeleton';
import { AppLayout } from '../components/layout/AppLayout';
import { useDashboardController } from '../hooks/useDashboardController';
import { WeatherPage } from './WeatherPage';
import { WelcomePage } from './WelcomePage';

export function DashboardPage() {
  const dashboard = useDashboardController();
  const {
    location,
    units,
    days,
    searchMeta,
    payload,
    weather,
    result,
    loading,
    error,
    metrics,
    hourlyPreview,
    hasAlerts,
    setLocation,
    setUnits,
    setDays,
    handleSearchMeta,
    useBrowserLocation,
    retry,
    setError,
  } = dashboard;

  return (
    <AppLayout>
      <DashboardHero
        location={location}
        days={days}
        units={units}
        searchMeta={searchMeta}
        onLocationChange={setLocation}
        onDaysChange={setDays}
        onUnitsChange={setUnits}
        onUseBrowserLocation={useBrowserLocation}
        onSearchMeta={handleSearchMeta}
      />

      {loading && weather && <RefreshBanner />}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={location ? retry : undefined}
          onDismiss={() => setError('')}
        />
      )}

      {!location ? (
        <WelcomePage />
      ) : loading && !weather ? (
        <WeatherLoadingSkeleton />
      ) : weather && result ? (
        <WeatherPage
          location={location}
          units={units}
          weather={weather}
          result={result}
          payload={payload}
          metrics={metrics}
          hourlyPreview={hourlyPreview}
          hasAlerts={hasAlerts}
        />
      ) : (
        <WelcomePage />
      )}
    </AppLayout>
  );
}
