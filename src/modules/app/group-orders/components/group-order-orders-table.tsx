import {
  CalendarDays,
  CreditCard,
  PackageCheck,
  Ruler,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { GroupOrderDetailOrder } from "../api/useGetGroupOrderById";
import { useState } from "react";
import { GroupOrderOrderDetailsDialog } from "./group-order-order-details-dialog";

type GroupOrderOrdersTableProps = {
  orders: GroupOrderDetailOrder[];
};

function readableStatus(value?: string | null) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getOrderStatusClassName(status: string) {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "IN_PROGRESS":
    case "CUTTING":
    case "SEWING":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "PENDING":
    case "DRAFT":
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getPaymentStatusClassName(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PARTIALLY_PAID":
    case "ADVANCE_PAID":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "UNPAID":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

export function GroupOrderOrdersTable({ orders }: GroupOrderOrdersTableProps) {
  const [selectedOrder, setSelectedOrder] =
    useState<GroupOrderDetailOrder | null>(null);

  const isDetailsDialogOpen = Boolean(selectedOrder);

  if (!orders.length) {
    return (
      <Card className="rounded-2xl border-dashed border-slate-200 shadow-none">
        <CardContent className="flex min-h-40 flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <PackageCheck className="h-5 w-5" />
          </div>

          <h3 className="text-sm font-semibold text-slate-900">
            No orders added yet
          </h3>

          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Orders linked to this group order will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden rounded-lg border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-290">
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
                  <TableHead>Order</TableHead>

                  <TableHead>Customer</TableHead>

                  <TableHead>Phone</TableHead>

                  <TableHead>Category</TableHead>

                  <TableHead>Qty</TableHead>

                  <TableHead>Total</TableHead>

                  <TableHead>Advance</TableHead>

                  <TableHead>Balance</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead>Payment</TableHead>

                  <TableHead>Delivery Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => {
                  const balanceAmount = Number(order.balanceAmount ?? 0);
            
                  const categoryNames = Array.from(
                    new Set(
                      order.items
                        ?.map((item) => item.category?.name)
                        .filter(Boolean),
                    ),
                  );

                  const categoryLabel =
                    categoryNames.length > 0 ? categoryNames.join(", ") : "-";

                  return (
                    <TableRow
                      key={order.id}
                      className="border-slate-100 transition-colors hover:bg-slate-50/70"
                    >
                      <TableCell className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-2 rounded-lg text-left transition-colors hover:text-slate-800 "
                        >
                          <div>
                            <p className="font-semibold underline-offset-4 hover:underline">
                              {order.orderNumber}
                            </p>
                          </div>
                        </button>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                            {order.customer?.fullName || "-"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                            {order.customer?.phoneNumber || "-"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <span className="inline-flex max-w-40 items-center gap-1.5 truncate ">
                          <span className="truncate uppercase">
                            {categoryLabel}
                          </span>
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center">
                        <span className="inline-flex min-w-9 justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {order.totalQty}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-right text-slate-700">
                        {formatCurrency(order.advanceAmount)}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-right">
                        <span
                          className={
                            balanceAmount > 0
                              ? "font-semibold text-amber-700"
                              : "font-semibold text-emerald-700"
                          }
                        >
                          {formatCurrency(order.balanceAmount)}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${getOrderStatusClassName(
                            order.status,
                          )}`}
                        >
                          {readableStatus(order.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${getPaymentStatusClassName(
                            order.paymentStatus,
                          )}`}
                        >
                          <CreditCard className="mr-1 h-3 w-3" />
                          {readableStatus(order.paymentStatus)}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(order.promisedDate)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Ruler className="h-3.5 w-3.5" />
              Click an order number to view full order, item, block, and
              measurement details.
            </div>
          </div>
        </CardContent>
      </Card>

      <GroupOrderOrderDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null);
          }
        }}
        order={selectedOrder}
      />
    </>
  );
}
const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const formatCurrency = (value?: string | number | null) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
};
