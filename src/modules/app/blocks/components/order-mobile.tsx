"use client";
import { Badge } from "@/components/ui/badge";

export function OrderCard({
  order,
  onClick,
}: {
  order: any;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-4 border p-5 active:scale-[0.98] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase">Order Ref</span>
          <span className="text-base font-semibold">#{order.orderNo}</span>
        </div>

        <Badge variant="secondary">{order.state}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase">Date</span>
          <span className="text-xs font-semibold">
            {new Date(order.dateEntered).toLocaleDateString("en-GB")}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs uppercase">Gross Total</span>
          <span className="text-sm font-semibold">
            £{Number(order.totalAmount).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
