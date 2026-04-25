import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronDown,
  CalendarDaysIcon,
  MapPin,
  Box,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./table-component";
import type { Order } from "../types/Order";

const getStatusStyles = (status: string) => {
  const s = status?.toLowerCase() || "";

  if (s.includes("delivered") || s.includes("completed")) {
    return {
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
      accent: "bg-emerald-500",
      ring: "ring-emerald-500/20",
    };
  }

  if (s.includes("processing") || s.includes("planned")) {
    return {
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
      accent: "bg-blue-500",
      ring: "ring-blue-500/20",
    };
  }

  if (s.includes("invoiced") || s.includes("released")) {
    return {
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
      accent: "bg-amber-500",
      ring: "ring-amber-500/20",
    };
  }

  if (s.includes("cancelled") || s.includes("rejected")) {
    return {
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      text: "text-rose-700",
      iconBg: "bg-rose-100",
      accent: "bg-rose-500",
      ring: "ring-rose-500/20",
    };
  }

  return {
    bg: "bg-slate-50/50",
    border: "border-slate-100",
    text: "text-slate-700",
    iconBg: "bg-slate-100",
    accent: "bg-slate-500",
    ring: "ring-slate-500/20",
  };
};

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const OrderCard = memo(
  ({ order, onViewDetails, isExpanded, onToggle }: OrderCardProps) => {
    const MAX_VISIBLE_PARTS = 3;
    const hasManyParts = order.orderLines.length > MAX_VISIBLE_PARTS;

    const styles = useMemo(
      () => getStatusStyles(order.ifsState || order.state),
      [order.ifsState, order.state],
    );

    const formattedDate = useMemo(() => {
      if (!order.dateEntered) return "N/A";

      return new Date(order.dateEntered).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }, [order.dateEntered]);

    const formattedTotal = useMemo(() => {
      return Number(order.totalAmount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
    }, [order.totalAmount]);

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
            : "shadow-sm",
        )}
      >
        {/* Header */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          className={cn(
            "flex items-start gap-3 cursor-pointer select-none p-3 transition-colors md:items-center md:gap-6",
            isExpanded ? styles.bg : "bg-white hover:bg-slate-50/30",
          )}
          onClick={handleInteraction}
          onKeyDown={(e) => e.key === "Enter" && handleInteraction()}
        >
          {/* Leading icon */}
          {/* <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border md:h-7 md:w-7 md:rounded-xl",
              styles.iconBg,
              styles.border,
              styles.text
            )}
          >
            <Package className="h-4 w-4" />
          </div> */}

          {/* Details */}
          <div className="min-w-0 flex-1">
            {/* Mobile */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:hidden">
              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Order No
                </span>
                <h3 className="truncate text-xs font-semibold tracking-tight text-slate-900">
                  #{order.orderNo}
                </h3>
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </span>
                <StatusBadge status={order.ifsState} />
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Created
                </span>
                <div className="flex items-center text-[11px] font-medium text-slate-600">
                  <CalendarDaysIcon className="mr-1 h-3 w-3 text-slate-400" />
                  <span className="truncate">{formattedDate}</span>
                </div>
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Total Qty
                </span>
                <div className="flex items-center text-[11px] font-bold text-slate-700">
                  <Box className="mr-1 h-3 w-3 text-slate-400" />
                  <span className="truncate">{order.totalQuantity} Units</span>
                </div>
              </div>

              <div className="col-span-2 min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Delivery Address
                </span>
                <div className="flex items-start text-[11px] font-medium text-slate-600">
                  <MapPin className="mr-1 mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                  <span className="line-clamp-2">
                    {order.shipAddrNo || "Standard Delivery Address"}
                  </span>
                </div>
              </div>

              {order.ifsState === "Invoiced" && (
                <div className="col-span-2 min-w-0 border-t border-slate-100 pt-2">
                  <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Gross Total
                  </span>
                  <p
                    className={cn(
                      "text-xs font-black leading-none tabular-nums",
                      styles.text,
                    )}
                  >
                    GBP {formattedTotal}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop */}
            <div className="hidden items-center gap-2 md:grid md:grid-cols-4">
              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Order No
                </span>
                <h3 className="truncate text-sm font-medium tracking-tight text-slate-900">
                  #{order.orderNo}
                </h3>
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Created Date
                </span>
                <div className="flex items-center text-xs font-medium text-slate-600">
                  <CalendarDaysIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                  {formattedDate}
                </div>
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </span>
                <StatusBadge status={order.ifsState} />
              </div>
              <div className="flex min-w-0 flex-col items-end">
                {order.ifsState === "Invoiced" && (
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Gross Total
                    </span>
                    <p
                      className={cn(
                        "mt-0.5 text-xs font-black leading-none tabular-nums",
                        styles.text,
                      )}
                    >
                      GBP {formattedTotal}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Toggle */}
          <div className="shrink-0 self-center">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full  transition-all md:h-8 md:w-8",
                isExpanded
                  ? "rotate-180 border-slate-900 bg-slate-900"
                  : "border-slate-200 bg-white",
              )}
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 md:h-4 md:w-4",
                  isExpanded ? "text-white" : "text-slate-500",
                )}
              />
            </div>
          </div>
        </div>

        {/* Expanded desktop area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="hidden border-t border-slate-100 bg-slate-50/40 md:block"
            >
              <div className="flex max-w-4xl flex-col gap-8 p-6">
                {/* Delivery */}
                <section className="relative pl-6">
                  <div className="absolute -bottom-8 left-1.75 top-2 w-0.5 bg-slate-200" />
                  <div className="mb-3 flex items-center gap-2">
                    <div className="absolute left-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-400 bg-white">
                      <MapPin className="h-2.5 w-2.5 text-slate-600" />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Delivery Address
                    </h4>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold leading-relaxed text-slate-700">
                      {order.shipAddrNo || "Standard Delivery Address"}
                    </p>
                  </div>
                </section>

                {/* Sales parts */}
                <section className="relative pl-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="absolute left-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-900">
                      <Package className="h-2.5 w-2.5 text-white" />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Sales Parts ({order.orderLines.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {order.orderLines
                      .slice(0, MAX_VISIBLE_PARTS)
                      .map((part, idx) => {
                        const lineStyles = getStatusStyles(part.state);

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={cn(
                                  "h-2 w-2 shrink-0 rounded-full",
                                  lineStyles.accent,
                                )}
                              />
                              <span className="truncate text-sm font-bold text-slate-800">
                                {part.salesParts}
                              </span>
                            </div>

                            <div className="ml-4 flex shrink-0 items-center gap-6">
                              {part.salesUnitMeasure?.trim() && (
                                <div className="text-right">
                                  <p className="text-[9px] font-bold uppercase text-slate-400">
                                    UOM
                                  </p>
                                  <p className="text-xs font-black text-slate-700">
                                    {part.salesUnitMeasure}
                                  </p>
                                </div>
                              )}
                              <div className="text-right">
                                <p className="text-[9px] font-bold uppercase text-slate-400">
                                  Qty
                                </p>
                                <p className="text-xs font-black text-slate-700">
                                  {part.qty}
                                </p>
                              </div>

                              <div className="flex w-24 justify-end">
                                <Badge
                                  className={cn(
                                    "border-none px-2 py-0.5 text-[9px] font-bold uppercase",
                                    lineStyles.bg,
                                    lineStyles.text,
                                  )}
                                >
                                  {part.state}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {hasManyParts && (
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails();
                        }}
                        className="mt-2 h-12 w-full justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs font-bold text-slate-500 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Show All {order.orderLines.length} Items
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
  (p, n) => p.isExpanded === n.isExpanded && p.order === n.order,
);
