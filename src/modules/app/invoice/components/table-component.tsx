import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = status?.toLowerCase() || "unknown";

  // Map backend status to UI configuration
  const config: Record<string, { label: string; classes: string; dot: string }> = {
    processing: {
      label: "Processing",
      classes: "bg-blue-50 text-blue-700 border-blue-200/60",
      dot: "bg-blue-500",
    },
    planned: {
      label: "Planned",
      classes: "bg-blue-50 text-blue-700 border-blue-200/60",
      dot: "bg-blue-500",
    },
    invoiced: {
      label: "Invoiced",
      classes: "bg-amber-50 text-amber-700 border-amber-200/60",
      dot: "bg-amber-500",
    },
    released: {
      label: "Released",
      classes: "bg-amber-50 text-amber-700 border-amber-200/60",
      dot: "bg-amber-500",
    },
    delivered: {
      label: "Delivered",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      dot: "bg-emerald-500",
    },
    completed: {
      label: "Completed",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      dot: "bg-emerald-500",
    },
    cancelled: {
      label: "Cancelled",
      classes: "bg-rose-50 text-rose-700 border-rose-200/60",
      dot: "bg-rose-500",
    },
    unknown: {
      label: status,
      classes: "bg-slate-50 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
  };

  // Select the style, falling back to 'unknown' if status isn't mapped
  const current = config[s] || config.unknown;

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-bold  tracking-wider shadow-none transition-none",
        current.classes
      )}
    >
      {/* The Status Dot Indicator */}
      <span className={cn("h-1.5 w-1.5 rounded-full", current.dot)} />
      {current.label}
    </Badge>
  );
}
export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
          <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-5 w-16" /></div>
          <div className="grid grid-cols-2 gap-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          <Skeleton className="h-10 w-full mt-2" />
        </div>
      ))}
    </div>
  );
}