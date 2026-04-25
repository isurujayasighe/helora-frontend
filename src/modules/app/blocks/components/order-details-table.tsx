"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Order } from "@/types/orders";
import { cn } from "@/lib/utils";

type OrdersTableProps = {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewDetails: (order: Order) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function statusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export function OrdersTable({
  orders,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewDetails,
}: OrdersTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-275">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-left">
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Order Number</th>
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Customer Name</th>
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Order Date</th>
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Promised Date</th>
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Item Count</th>
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Amount</th>
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Balance</th>
              <th className="px-4 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-4 text-sm font-semibold text-blue-600">
                    #{order.orderNumber}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {order.customer?.fullName || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {formatDate(order.orderDate)}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {formatDate(order.promisedDate)}
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full text-[10px]", statusClass(order.status))}
                    >
                      {order.status.replaceAll("_", " ")}
                    </Badge>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {order._count?.items ?? order.items.length}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-slate-800">
                    {formatCurrency(order.totalAmount)}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-slate-800">
                    {formatCurrency(order.balanceAmount)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onViewDetails(order)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit order</DropdownMenuItem>
                        <DropdownMenuItem>Mark complete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-500">
          Showing {orders.length} of {totalCount} orders
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>

          <div className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">
            {currentPage} / {Math.max(totalPages, 1)}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}