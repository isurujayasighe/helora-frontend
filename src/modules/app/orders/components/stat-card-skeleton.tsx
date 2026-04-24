import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          {/* Title Placeholder */}
          <Skeleton className="h-3 w-20 bg-slate-200" />
          {/* Value Placeholder */}
          <Skeleton className="h-8 w-12 bg-slate-200" />
          {/* Subtitle Placeholder */}
          <Skeleton className="h-3 w-28 bg-slate-200" />
        </div>
        {/* Icon Placeholder */}
        <Skeleton className="h-14 w-14 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}