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
import { Loader2 } from "lucide-react";

type RecentOrder = {
  id: string;
  orderNo: string;
  customerName: string;
  itemName: string;
  quantity: number;
  promisedDate: string;
  status: string;
};

interface RecentOrdersTableCardProps {
  orders: RecentOrder[];
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
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
    case "Delivered":
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Confirmed":
    case "Cutting":
    case "Sewing":
    case "Ready":
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
  isLoading,
  className,
  onPageChange,
}: RecentOrdersTableCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border-border bg-white p-0",
        className
      )}
    >
      <CardHeader className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold text-slate-950">
            Recent Orders
          </CardTitle>

          <div className="text-xs font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-11">
                  Order No
                </TableHead>
                <TableHead className="h-11">
                  Customer
                </TableHead>
                <TableHead className="h-11">
                  Item
                </TableHead>
                <TableHead className="h-11">
                  Qty
                </TableHead>
                <TableHead className="h-11">
                  Promised Date
                </TableHead>
                <TableHead className="h-11">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-sm text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading recent orders...
                    </span>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
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
                  <TableRow key={order.id}>
                    <TableCell className="font-semibold text-slate-900">
                      #{order.orderNo}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {order.itemName}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {order.quantity}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(order.promisedDate)}
                    </TableCell>
                    <TableCell>
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
