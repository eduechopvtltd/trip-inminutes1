// src/components/ui/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-pkg skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
        <div className="flex justify-between pt-2">
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-6 w-12 rounded" />
        </div>
        <div className="skeleton h-8 w-full rounded-xl" />
      </div>
    </div>
  );
}
