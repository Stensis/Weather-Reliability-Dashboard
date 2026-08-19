export function WeatherLoadingSkeleton() {
  return (
    <div className="space-y-6" data-testid="weather-loader">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div className="panel overflow-hidden p-6 sm:p-8">
          <div className="shimmer h-4 w-32 rounded-full" />
          <div className="mt-6 flex items-end gap-6">
            <div className="shimmer h-28 w-28 rounded-[2rem]" />
            <div className="flex-1 space-y-3">
              <div className="shimmer h-12 w-40 rounded-xl" />
              <div className="shimmer h-5 w-52 rounded-lg" />
              <div className="shimmer h-4 w-36 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => <div key={item} className="shimmer min-h-32 rounded-2xl" />)}
        </div>
      </section>
      <section className="panel p-6">
        <div className="shimmer h-5 w-36 rounded-lg" />
        <div className="mt-5 h-52 rounded-2xl bg-white/[0.025] p-4">
          <div className="shimmer h-full rounded-xl" />
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {[0, 1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="shimmer h-40 rounded-2xl" />)}
      </section>
    </div>
  );
}
