import { Skeleton } from "@/components/ui/skeleton";

export default function UserSheetSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
