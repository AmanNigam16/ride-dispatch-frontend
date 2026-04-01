export function PageLoader({ message = "Loading dispatch workspace..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-[28px] border border-line bg-surface-1 p-8 text-center shadow-panel">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-brand-100 p-3">
          <div className="h-full w-full animate-pulse rounded-full bg-brand-500" />
        </div>
        <p className="font-display text-lg font-semibold">{message}</p>
        <p className="mt-2 text-sm text-muted">
          Preparing live routes, ride history, and socket channels.
        </p>
      </div>
    </div>
  );
}
