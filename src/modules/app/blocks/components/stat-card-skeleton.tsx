import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden border p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          {/* Title Placeholder */}
          <Skeleton className="h-3 w-20" />
          {/* Value Placeholder */}
          <Skeleton className="h-8 w-12" />
          {/* Subtitle Placeholder */}
          <Skeleton className="h-3 w-28" />
        </div>
        {/* Icon Placeholder */}
        <Skeleton className="h-14 w-14" />
      </div>
    </div>
  );
}
