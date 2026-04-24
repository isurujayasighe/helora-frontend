import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrendDirection = "up" | "down" | "neutral";

export interface StatTrend {
  value: number;
  direction: TrendDirection;
}

export interface StatCardProps {
  title: string;
  value?: number | string;
  helper?: string;
  icon: LucideIcon;
  bgColor?: string;
  subtitle?: string;
  variant?:
    | "processing"
    | "invoiced"
    | "delivered"
    | "cancelled"
    | "default"
    | "outstanding"
    | "paid"
    | "overdue";
  className?: string;
  loading?: boolean;
  trend?: StatTrend;
  canView?: boolean;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  variant = "default",
  className,
}: StatCardProps) {
  const variants = {
    processing:
      "bg-blue-50 border-blue-100 text-blue-700 icon-bg-blue-100 icon-text-blue-600 shadow-blue-50",
    invoiced:
      "bg-amber-50 border-amber-100 text-amber-700 icon-bg-amber-100 icon-text-amber-600 shadow-amber-50",
    delivered:
      "bg-emerald-50 border-emerald-100 text-emerald-700 icon-bg-emerald-100 icon-text-emerald-600 shadow-emerald-50",
    cancelled:
      "bg-rose-50 border-rose-100 text-rose-700 icon-bg-rose-100 icon-text-rose-600 shadow-rose-50",
    default:
      "bg-slate-50 border-slate-100 text-slate-700 icon-bg-slate-100 icon-text-slate-600 shadow-slate-50",
    outstanding:
      "bg-yellow-50 border-yellow-100 text-yellow-700 icon-bg-yellow-100 icon-text-yellow-600 shadow-yellow-50",
    paid: "bg-green-50 border-green-100 text-green-700 icon-bg-green-100 icon-text-green-600 shadow-green-50",
    overdue:
      "bg-red-50 border-red-100 text-red-700 icon-bg-red-100 icon-text-red-600 shadow-red-50",
  };

  const currentVariant = variants[variant];
  const classList = currentVariant.split(" ");

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border transition-all hover:shadow-md",
        "p-2.5 sm:p-4",
        classList[0],
        classList[1],
        classList[5],
        className,
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="min-w-0 space-y-2">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide  sm:text-[11px]">
            {title}
          </p>

          <h3 className="truncate text-sm font-black leading-none tracking-tight sm:text-lg">
            {value ?? 0}
          </h3>

          {subtitle ? (
            <p className="hidden truncate text-[12px] leading-tight sm:block">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "flex shrink-0 rounded-lg p-1.5 transition-transform group-hover:scale-105 sm:rounded-xl sm:p-2.5",
            classList[3],
          )}
        >
          <Icon className={cn("h-3.5 w-3.5 sm:h-5 sm:w-5", classList[4])} />
        </div>
      </div>
    </div>
  );
}
