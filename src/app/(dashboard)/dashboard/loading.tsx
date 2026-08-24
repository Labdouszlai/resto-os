export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[120px] bg-card rounded-xl border animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[120px] bg-card rounded-xl border animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[360px] bg-card rounded-xl border animate-pulse" />
        <div className="h-[360px] bg-card rounded-xl border animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[360px] bg-card rounded-xl border animate-pulse" />
        <div className="h-[360px] bg-card rounded-xl border animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[360px] bg-card rounded-xl border animate-pulse" />
        <div className="h-[360px] bg-card rounded-xl border animate-pulse" />
      </div>
    </div>
  );
}
