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
      <div className="group relative flex flex-col overflow-hidden border transition-all duration-300 active:scale-[0.99] md:active:scale-100">
        {/* Header */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          className="flex cursor-pointer select-none items-start gap-3 p-3 transition-colors md:items-center md:gap-6"
          onClick={handleInteraction}
          onKeyDown={(e) => e.key === "Enter" && handleInteraction()}
        >
          {/* Details */}
          <div className="min-w-0 flex-1">
            {/* Mobile */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:hidden">
              <div className="min-w-0">
                <span className="mb-0.5 block text-xs uppercase">Order No</span>
                <h3 className="truncate text-xs font-semibold">
                  #{order.orderNo}
                </h3>
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-xs uppercase">Status</span>
                <StatusBadge status={order.ifsState} />
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-xs uppercase">Created</span>
                <div className="flex items-center text-xs font-medium">
                  <CalendarDaysIcon className="mr-1 h-3 w-3" />
                  <span className="truncate">{formattedDate}</span>
                </div>
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-xs uppercase">
                  Total Qty
                </span>
                <div className="flex items-center text-xs">
                  <Box className="mr-1 h-3 w-3" />
                  <span className="truncate">{order.totalQuantity} Units</span>
                </div>
              </div>

              <div className="col-span-2 min-w-0">
                <span className="mb-0.5 block text-xs uppercase">
                  Delivery Address
                </span>
                <div className="flex items-start text-xs font-medium">
                  <MapPin className="mr-1 mt-0.5 h-3 w-3 shrink-0" />
                  <span className="line-clamp-2">
                    {order.shipAddrNo || "Standard Delivery Address"}
                  </span>
                </div>
              </div>

              {order.ifsState === "Invoiced" && (
                <div className="col-span-2 min-w-0 border-t pt-2">
                  <span className="mb-0.5 block text-xs uppercase">
                    Gross Total
                  </span>
                  <p className="text-xs font-semibold leading-none tabular-nums">
                    GBP {formattedTotal}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop */}
            <div className="hidden items-center gap-2 md:grid md:grid-cols-4">
              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-xs uppercase">Order No</span>
                <h3 className="truncate text-sm font-medium">
                  #{order.orderNo}
                </h3>
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-xs uppercase">Created Date</span>
                <div className="flex items-center text-xs font-medium">
                  <CalendarDaysIcon className="mr-2 h-3.5 w-3.5" />
                  {formattedDate}
                </div>
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-xs uppercase">Status</span>
                <StatusBadge status={order.ifsState} />
              </div>
              <div className="flex min-w-0 flex-col items-end">
                {order.ifsState === "Invoiced" && (
                  <>
                    <span className="text-xs uppercase">Gross Total</span>
                    <p className="mt-0.5 text-xs font-semibold leading-none tabular-nums">
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
                "flex h-7 w-7 items-center justify-center  transition-all md:h-8 md:w-8",
                isExpanded ? "rotate-180" : "",
              )}
            >
              <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
              className="hidden border-t md:block"
            >
              <div className="flex max-w-4xl flex-col gap-8 p-6">
                {/* Delivery */}
                <section className="relative pl-6">
                  <div className="absolute -bottom-8 left-1.75 top-2 w-0.5" />
                  <div className="mb-3 flex items-center gap-2">
                    <div className="absolute left-0 flex h-4 w-4 items-center justify-center border-2">
                      <MapPin className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs uppercase">Delivery Address</h4>
                  </div>

                  <div className="border p-4">
                    <p className="text-sm font-semibold leading-relaxed">
                      {order.shipAddrNo || "Standard Delivery Address"}
                    </p>
                  </div>
                </section>

                {/* Sales parts */}
                <section className="relative pl-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="absolute left-0 flex h-4 w-4 items-center justify-center border-2">
                      <Package className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs uppercase">
                      Sales Parts ({order.orderLines.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {order.orderLines
                      .slice(0, MAX_VISIBLE_PARTS)
                      .map((part, idx) => {
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between border p-3 transition-colors"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="truncate text-sm">
                                {part.salesParts}
                              </span>
                            </div>

                            <div className="ml-4 flex shrink-0 items-center gap-6">
                              {part.salesUnitMeasure?.trim() && (
                                <div className="text-right">
                                  <p className="text-xs uppercase">UOM</p>
                                  <p className="text-xs font-semibold">
                                    {part.salesUnitMeasure}
                                  </p>
                                </div>
                              )}
                              <div className="text-right">
                                <p className="text-xs uppercase">Qty</p>
                                <p className="text-xs font-semibold">
                                  {part.qty}
                                </p>
                              </div>

                              <div className="flex w-24 justify-end">
                                <Badge variant="secondary">{part.state}</Badge>
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
                        className="mt-2 h-12 w-full justify-center border-2 border-dashed text-xs transition-all"
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
