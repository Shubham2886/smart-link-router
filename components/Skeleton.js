export function SkeletonLine({ className = "" }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-ink-100">
      <SkeletonLine className="h-4 w-28" />
      <SkeletonLine className="h-4 w-40" />
      <SkeletonLine className="h-4 w-20 ml-auto" />
      <SkeletonLine className="h-4 w-16" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-paper-100 p-5">
      <SkeletonLine className="h-3 w-20 mb-3" />
      <SkeletonLine className="h-7 w-24" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-paper-100 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
