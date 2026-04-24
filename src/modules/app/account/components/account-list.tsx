import { memo, useMemo } from "react";
import { CalendarDaysIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./table-component";
import type { Invoice } from "../types/Account";

const getStatusStyles = (status: string) => {
  const s = status?.toLowerCase() || "";

  if (
    s.includes("overdue") ||
    s.includes("rejected") ||
    s.includes("cancelled")
  ) {
    return {
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      text: "text-rose-700",
      iconBg: "bg-rose-100",
      accent: "bg-rose-500",
      ring: "ring-rose-500/20",
    };
  }

  if (s.includes("paid") || s.includes("completed")) {
    return {
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
      accent: "bg-emerald-500",
      ring: "ring-emerald-500/20",
    };
  }

  if (s.includes("processing") || s.includes("pending")) {
    return {
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
      accent: "bg-blue-500",
      ring: "ring-blue-500/20",
    };
  }

  return {
    bg: "bg-amber-50/50",
    border: "border-amber-100",
    text: "text-amber-700",
    iconBg: "bg-amber-100",
    accent: "bg-amber-500",
    ring: "ring-amber-500/20",
  };
};

interface InvoiceCardProps {
  order: Invoice;
  onViewDetails: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const InvoiceCard = memo(
  ({ order, onViewDetails, isExpanded, onToggle }: InvoiceCardProps) => {
    const primaryStatus =
      order.portalStatus ||
      order.ifsStatus ||
      order.accountStatus?.[0] ||
      "Unknown";

    const styles = useMemo(() => getStatusStyles(primaryStatus), [primaryStatus]);

    const formattedDueDate = useMemo(() => {
      if (!order.dueDate) return "N/A";
      return new Date(order.dueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }, [order.dueDate]);

    const formattedAmount = useMemo(() => {
      return Number(order.openAmount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }, [order.openAmount]);

    const handleInteraction = () => {
      if (window.innerWidth < 768) {
        onViewDetails();
      } else {
        onToggle();
      }
    };

    return (
      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300",
          "hover:border-slate-300 hover:shadow-lg active:scale-[0.99] md:active:scale-100",
          isExpanded
            ? cn("border-transparent shadow-xl ring-4", styles.ring)
            : "shadow-sm"
        )}
      >
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          className={cn(
            "flex cursor-pointer items-start gap-3 select-none p-3 transition-colors md:items-center md:gap-6",
            isExpanded ? styles.bg : "bg-white hover:bg-slate-50/30"
          )}
          onClick={handleInteraction}
          onKeyDown={(e) => e.key === "Enter" && handleInteraction()}
        >
          <div className="min-w-0 flex-1">
            {/* Mobile */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:hidden">
              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Invoice No
                </span>
                <h3 className="truncate text-xs font-bold tracking-tight text-slate-900">
                  #{order.invoiceNo}
                </h3>
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Due Date
                </span>
                <div
                  className={cn(
                    "flex items-center text-[11px] font-medium",
                    order.isOverdue ? "text-rose-600" : "text-slate-600"
                  )}
                >
                  <CalendarDaysIcon className="mr-1 h-3 w-3 text-slate-400" />
                  <span className="truncate">{formattedDueDate}</span>
                </div>
              </div>

              <div className="col-span-2 min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </span>

                <div className="flex flex-wrap gap-1">
                  {order.accountStatus?.length ? (
                    order.accountStatus.map((status) => (
                      <StatusBadge key={status} status={status} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">N/A</span>
                  )}
                </div>
              </div>

              <div className="col-span-2 min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Total
                </span>
                <p
                  className={cn(
                    "text-sm font-bold leading-none tabular-nums tracking-tight",
                    styles.text
                  )}
                >
                  <span className="mr-1 text-xs font-medium opacity-75">
                    {order.currencyCode}
                  </span>
                  {formattedAmount}
                </p>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden items-center gap-6 md:grid md:grid-cols-4">
              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Invoice No
                </span>
                <h3 className="truncate text-sm font-bold tracking-tight text-slate-900">
                  #{order.invoiceNo}
                </h3>
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Due Date
                </span>
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    order.isOverdue ? "text-rose-600" : "text-slate-600"
                  )}
                >
                  {formattedDueDate}
                </div>
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </span>
                <div className="flex flex-wrap gap-1">
                  {order.accountStatus?.length ? (
                    order.accountStatus.map((status) => (
                      <StatusBadge key={status} status={status} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">N/A</span>
                  )}
                </div>
              </div>

              <div className="flex min-w-0 flex-col items-end justify-center gap-0.5 md:items-start">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </span>

                <p
                  className={cn(
                    "text-sm font-bold tabular-nums tracking-tight",
                    styles.text
                  )}
                >
                  <span className="mr-1 text-xs font-medium opacity-75">
                    {order.currencyCode}
                  </span>
                  {formattedAmount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable area can stay here if you add account detail section later */}
      </div>
    );
  },
  (p, n) => p.isExpanded === n.isExpanded && p.order === n.order
);