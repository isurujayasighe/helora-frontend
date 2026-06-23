"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function OrdersTable({
  orders,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewDetails,
}: OrdersTableProps) {
  return (
    <div className="border overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-275">
          <TableHeader>
            <TableRow className="border-b text-left">
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase">
                Order Number
              </TableHead>
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase">
                Customer Name
              </TableHead>
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase">
                Order Date
              </TableHead>
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase">
                Promised Date
              </TableHead>
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase">
                Status
              </TableHead>
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase">
                Item Count
              </TableHead>
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase">
                Total Amount
              </TableHead>
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase">
                Balance
              </TableHead>
              <TableHead className="px-4 py-4 text-right text-xs font-semibold uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="px-4 py-10 text-center text-sm"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="border-b last:border-b-0">
                  <TableCell className="px-4 py-4 text-sm font-semibold">
                    #{order.orderNumber}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm">
                    {order.customer?.fullName || "-"}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm">
                    {formatDate(order.orderDate)}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm">
                    {formatDate(order.promisedDate)}
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <Badge
                      variant={
                        order.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {order.status.replaceAll("_", "")}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm">
                    {order._count?.items ?? order.items.length}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm font-medium">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm font-medium">
                    {formatCurrency(order.balanceAmount)}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-right">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm">
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

          <div className="border px-3 py-1.5 text-sm font-medium">
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
