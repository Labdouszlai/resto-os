export default function MenuLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-36 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 bg-card rounded-xl border animate-pulse" />
        ))}
      </div>
    </div>
  );
}
