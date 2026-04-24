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

function PromisedOrderListItem({
  order,
}: {
  order: UpcomingPromisedOrder;
}) {
  const { month, day } = formatCalendarParts(order.date);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-4">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wide text-orange-500">
          {month}
        </span>
        <span className="text-[18px] font-bold leading-none text-slate-950">
          {day}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-slate-800">
          {order.title}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {order.units} {order.units === 1 ? "Unit" : "Units"} • #{order.orderNo}
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
    <Card
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-0 shadow-none",
        className
      )}
    >
      <CardHeader className="px-6 pb-4 pt-5">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-950">
          Upcoming Promised Orders
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="space-y-3">
          {orders.map((order) => (
            <PromisedOrderListItem key={order.id} order={order} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}