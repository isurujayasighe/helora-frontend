"use client";

import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import type { Order } from "@/types/orders";

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
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "IN_PROGRESS":
    case "CONFIRMED":
    case "CUTTING":
    case "SEWING":
    case "READY":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
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
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-275">
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-200 hover:bg-slate-50">
              <TableHead className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Order Number
              </TableHead>

              <TableHead className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Customer Name
              </TableHead>

              <TableHead className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Order Date
              </TableHead>

              <TableHead className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Promised Date
              </TableHead>

              <TableHead className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>

              <TableHead className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Item Count
              </TableHead>

              <TableHead className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Total Amount
              </TableHead>

              <TableHead className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Balance
              </TableHead>

              <TableHead className="px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 px-4 py-10 text-center text-sm text-slate-500"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/70"
                >
                  <TableCell className="px-4 py-4 text-xs font-semibold text-blue-600">
                    #{order.orderNumber}
                  </TableCell>

                  <TableCell className="px-4 py-4  text-slate-700">
                    {order.customer?.fullName || "-"}
                  </TableCell>

                  <TableCell className="px-4 py-4  text-slate-600">
                    {formatDate(order.orderDate)}
                  </TableCell>

                  <TableCell className="px-4 py-4  text-slate-600">
                    {formatDate(order.promisedDate)}
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[10px] font-semibold",
                        statusClass(order.status),
                      )}
                    >
                      {order.status.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-4  text-slate-700">
                    {order._count?.items ?? order.items.length}
                  </TableCell>

                  <TableCell className="px-4 py-4  font-medium text-slate-800">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>

                  <TableCell className="px-4 py-4 font-medium text-slate-800">
                    {formatCurrency(order.balanceAmount)}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                        >
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
            className="rounded-lg"
          >
            Previous
          </Button>

          <div className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">
            {currentPage} / {safeTotalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= safeTotalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-lg"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}