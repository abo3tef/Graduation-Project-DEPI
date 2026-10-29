export default function AppLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-7 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    </div>
  );
}
