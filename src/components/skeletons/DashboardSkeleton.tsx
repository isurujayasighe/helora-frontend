import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <Card>
        <CardContent className="p-8 space-y-4">
          <SkeletonBox className="h-6 w-40" />
          <SkeletonBox className="h-10 w-3/4" />
          <SkeletonBox className="h-4 w-2/3" />
          <div className="flex gap-3 pt-4">
            <SkeletonBox className="h-10 w-32" />
            <SkeletonBox className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <SkeletonBox className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-8 w-20" />
              <SkeletonBox className="h-3 w-28 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-3">
              <SkeletonBox className="h-12 w-12" />
              <SkeletonBox className="h-5 w-40" />
              <SkeletonBox className="h-3 w-full" />
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
