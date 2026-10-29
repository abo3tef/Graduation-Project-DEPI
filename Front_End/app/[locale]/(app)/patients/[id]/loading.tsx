export default function PatientDetailLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
      <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    </div>
  );
}
