export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-40 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-9 w-32 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="border rounded-xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 border-b last:border-0 animate-pulse bg-card" />
        ))}
      </div>
    </div>
  );
}
