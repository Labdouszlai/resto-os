export default function InventoryLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-28 bg-muted rounded animate-pulse" />
          <div className="h-4 w-44 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="border rounded-xl overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 border-b last:border-0 animate-pulse bg-card" />
        ))}
      </div>
    </div>
  );
}
