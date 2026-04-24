"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RecentOrder = {
  id: string;
  orderNo: string;
  customerName: string;
  itemName: string;
  quantity: number;
  promisedDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
};

interface RecentOrdersTableCardProps {
  orders: RecentOrder[];
  currentPage: number;
  totalPages: number;
  className?: string;
  onPageChange?: (page: number) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadgeVariant(status: RecentOrder["status"]) {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Overdue":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export function RecentOrdersTableCard({
  orders,
  currentPage,
  totalPages,
  className,
  onPageChange,
}: RecentOrdersTableCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border p-0 border-slate-200 bg-white shadow-none",
        className
      )}
    >
      <CardHeader className="px-6 pb-4 pt-5">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold tracking-tight text-slate-950">
            Recent Orders
          </CardTitle>

          <div className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order No
                </TableHead>
                <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </TableHead>
                <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Item
                </TableHead>
                <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Qty
                </TableHead>
                <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Promised Date
                </TableHead>
                <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-sm text-slate-500"
                  >
                    No recent orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50">
                    <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                      #{order.orderNo}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-600">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-600">
                      {order.itemName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-600">
                      {order.quantity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-600">
                      {formatDate(order.promisedDate)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full font-medium",
                          getStatusBadgeVariant(order.status)
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing recent production orders
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="rounded-lg"
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}