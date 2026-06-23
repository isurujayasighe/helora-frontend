import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = status?.toLowerCase() || "unknown";

  const labels: Record<string, string> = {
    processing: "Processing",
    planned: "Planned",
    invoiced: "Invoiced",
    released: "Released",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <Badge variant={s === "cancelled" ? "destructive" : "secondary"}>
      {labels[s] ?? status}
    </Badge>
  );
}
export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4 p-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-2" />
        </div>
      ))}
    </div>
  );
}
