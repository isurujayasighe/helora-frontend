// @/components/layout/profile-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileButtonSkeleton() {
  return (
    <div className="flex items-center gap-2 h-10 px-2 rounded-lg border border-transparent">
      {/* Avatar Skeleton */}
      <Skeleton className="h-7 w-7 rounded-full bg-slate-200" />
      
      {/* Text Skeletons */}
      <div className="hidden md:flex flex-col gap-1.5 items-start">
        <Skeleton className="h-3 w-20 bg-slate-200" />
        <Skeleton className="h-2 w-24 bg-slate-200" />
      </div>
      
      {/* Chevron Skeleton */}
      <Skeleton className="hidden md:block h-3 w-3 rounded-full bg-slate-100" />
    </div>
  );
}