"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types/orders";
import { cn } from "@/lib/utils";

type OrderDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
};

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Order #{order.orderNumber}
              </DialogTitle>
              <p className="mt-1 text-sm text-slate-500">
                Created on {formatDate(order.orderDate)}
              </p>
            </div>

            <Badge
              variant="outline"
              className={cn("rounded-full", statusClass(order.status))}
            >
              {order.status.replaceAll("_", " ")}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Amount
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Advance
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {formatCurrency(order.advanceAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Balance
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {formatCurrency(order.balanceAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Item Count
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {order._count?.items ?? order.items.length}
              </p>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Customer Details
              </h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-800">Name:</span> {order.customer.fullName}</p>
                <p><span className="font-medium text-slate-800">Phone:</span> {order.customer.phoneNumber}</p>
                <p><span className="font-medium text-slate-800">Alt Phone:</span> {order.customer.alternatePhone || "-"}</p>
                <p><span className="font-medium text-slate-800">Town:</span> {order.customer.town || "-"}</p>
                <p><span className="font-medium text-slate-800">Address:</span> {order.customer.address || "-"}</p>
                <p><span className="font-medium text-slate-800">Notes:</span> {order.customer.notes || "-"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Order Details
              </h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-800">Order Date:</span> {formatDate(order.orderDate)}</p>
                <p><span className="font-medium text-slate-800">Promised Date:</span> {formatDate(order.promisedDate)}</p>
                <p><span className="font-medium text-slate-800">Status:</span> {order.status}</p>
                <p><span className="font-medium text-slate-800">Notes:</span> {order.notes || "-"}</p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Order Items</h3>

            <div className="mt-4 space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Item {index + 1}
                    </h4>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.lineTotal)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-800">Description:</span> {item.itemDescription}</p>
                    <p><span className="font-medium text-slate-800">Quantity:</span> {item.quantity}</p>
                    <p><span className="font-medium text-slate-800">Unit Price:</span> {formatCurrency(item.unitPrice)}</p>
                    <p><span className="font-medium text-slate-800">Category:</span> {item.category?.name || "-"}</p>
                    <p><span className="font-medium text-slate-800">Item Notes:</span> {item.notes || "-"}</p>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Related Block
                    </h5>

                    {item.block ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3 text-sm text-slate-600">
                        <p><span className="font-medium text-slate-800">Block No:</span> {item.block.blockNumber}</p>
                        <p><span className="font-medium text-slate-800">Version:</span> {item.block.versionNo ?? "-"}</p>
                        <p><span className="font-medium text-slate-800">Status:</span> {item.block.status || "-"}</p>
                        <p><span className="font-medium text-slate-800">Size Label:</span> {item.block.sizeLabel || "-"}</p>
                        <p><span className="font-medium text-slate-800">Ready Made Size:</span> {item.block.readyMadeSize || "-"}</p>
                        <p><span className="font-medium text-slate-800">Default:</span> {item.block.isDefault ? "Yes" : "No"}</p>
                        <p className="md:col-span-2 xl:col-span-3">
                          <span className="font-medium text-slate-800">Description:</span> {item.block.description || "-"}
                        </p>
                        <p className="md:col-span-2 xl:col-span-3">
                          <span className="font-medium text-slate-800">Fit Notes:</span> {item.block.fitNotes || "-"}
                        </p>
                        <p className="md:col-span-2 xl:col-span-3">
                          <span className="font-medium text-slate-800">Remarks:</span> {item.block.remarks || "-"}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No block linked to this item.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}