"use client";

import { CalendarDays, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { DashboardPromisedOrder } from "../types";
import {
  formatDueLabel,
  formatMonthDayParts,
} from "../utils";
import { DashboardSectionCard } from "./dashboard-section-card";

interface UpcomingPromisedOrdersProps {
  orders: DashboardPromisedOrder[];
  isLoading?: boolean;
  className?: string;
  onViewAll?: () => void;
  onSelectOrder?: (orderId: string) => void;
}

function getDueBadgeVariant(date: string) {
  const label = formatDueLabel(date);

  if (label === "Overdue") return "destructive";
  if (label === "Due today" || label === "Due tomorrow") return "secondary";

  return "outline";
}

function PromisedOrderListItem({
  order,
  onSelectOrder,
}: {
  order: DashboardPromisedOrder;
  onSelectOrder?: (orderId: string) => void;
}) {
  const { month, day } = formatMonthDayParts(order.date);
  const content = (
    <>
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border bg-muted">
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
          {month}
        </span>
        <span className="text-lg font-semibold leading-none text-foreground">
          {day}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {order.orderNo}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {order.customerName}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {order.title}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <Badge variant={getDueBadgeVariant(order.date)}>
              {formatDueLabel(order.date)}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              {order.units} pcs
            </p>
          </div>
        </div>
      </div>
    </>
  );

  if (!onSelectOrder) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-3">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
        "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
      )}
      onClick={() => onSelectOrder(order.id)}
    >
      {content}
    </button>
  );
}

export function UpcomingPromisedOrders({
  orders,
  isLoading,
  className,
  onViewAll,
  onSelectOrder,
}: UpcomingPromisedOrdersProps) {
  return (
    <DashboardSectionCard
      title="Upcoming Promised Orders"
      icon={CalendarDays}
      actionLabel="View all"
      onAction={onViewAll}
      className={className}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading promised orders...
          </div>
        ) : orders.length === 0 ? (
          <Empty className="h-40 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarDays />
              </EmptyMedia>
              <EmptyTitle>No promised orders due</EmptyTitle>
              <EmptyDescription>
                Nothing is due in the next seven days.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          orders.map((order) => (
            <PromisedOrderListItem
              key={order.id}
              order={order}
              onSelectOrder={onSelectOrder}
            />
          ))
        )}
      </div>
    </DashboardSectionCard>
  );
}
