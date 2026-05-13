"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UpcomingPromisedOrder = {
  id: string;
  title: string;
  units: number;
  orderNo: string;
  date: string;
};

interface UpcomingPromisedOrdersProps {
  orders: UpcomingPromisedOrder[];
  className?: string;
}

function formatCalendarParts(dateString: string) {
  const date = new Date(dateString);

  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString().padStart(2, "0"),
  };
}

function PromisedOrderListItem({ order }: { order: UpcomingPromisedOrder }) {
  const { month, day } = formatCalendarParts(order.date);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-white px-4 py-3 transition hover:border-slate-300">
      <div className="flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-slate-50">
        <span className="text-[10px] font-semibold uppercase text-amber-600">
          {month}
        </span>
        <span className="text-lg font-semibold leading-none text-slate-950">
          {day}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {order.title}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {order.units} {order.units === 1 ? "Unit" : "Units"} / #
          {order.orderNo}
        </p>
      </div>
    </div>
  );
}

export function UpcomingPromisedOrders({
  orders,
  className,
}: UpcomingPromisedOrdersProps) {
  return (
    <Card className={cn("rounded-lg border-border bg-white p-0", className)}>
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle className="text-base font-semibold text-slate-950">
          Upcoming Promised Orders
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {orders.map((order) => (
            <PromisedOrderListItem key={order.id} order={order} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
