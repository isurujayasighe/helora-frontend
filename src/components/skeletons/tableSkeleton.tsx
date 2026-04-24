import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function UsersTableSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-70" />
          <Skeleton className="h-10 w-30" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[40px_1fr_1fr_120px_80px] gap-4"
          >
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
