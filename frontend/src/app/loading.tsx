export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="h-10 w-48 bg-surface rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-28 glass-card rounded-2xl" />
        <div className="h-28 glass-card rounded-2xl" />
        <div className="h-28 glass-card rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 glass-panel rounded-2xl" />
        <div className="h-64 glass-panel rounded-2xl" />
      </div>
    </div>
  );
}
