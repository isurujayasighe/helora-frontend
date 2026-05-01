import type { ReactNode } from "react";

import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPin,
  PackageCheck,
  Phone,
  Ruler,
  Scissors,
  Shirt,
  StickyNote,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { GroupOrderDetailOrder } from "../api/useGetGroupOrderById";
import { formatCurrency, formatDate } from "@/utils/formatters";

type GroupOrderOrderDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: GroupOrderDetailOrder | null;
};

type InfoItemProps = {
  label: string;
  value?: ReactNode;
};

function readableStatus(value?: string | null) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClassName(status?: string | null) {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
    case "PAID":
    case "VERIFIED_OK":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "IN_PROGRESS":
    case "CUTTING":
    case "SEWING":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "ADVANCE_PAID":
    case "PARTIALLY_PAID":
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "CANCELLED":
    case "UNPAID":
    case "REJECTED":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-1 truncate text-xs font-semibold text-slate-800">
        {value || "-"}
      </div>
    </div>
  );
}

function NoteBox({
  icon,
  label,
  value,
  tone = "slate",
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
  tone?: "slate" | "blue" | "amber" | "emerald";
}) {
  if (!value) return null;

  const toneClassName = {
    slate: "bg-slate-50 text-slate-700 [&_p:first-child]:text-slate-600",
    blue: "bg-blue-50 text-blue-700 [&_p:first-child]:text-blue-600",
    amber: "bg-amber-50 text-amber-700 [&_p:first-child]:text-amber-600",
    emerald:
      "bg-emerald-50 text-emerald-700 [&_p:first-child]:text-emerald-600",
  }[tone];

  return (
    <div
      className={`flex min-w-55 flex-1 gap-2 rounded-lg px-3 py-2 text-xs ${toneClassName}`}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>

      <div className="min-w-0">
        <p className="font-semibold">{label}</p>
        <p className="mt-0.5 line-clamp-2 font-medium">{value}</p>
      </div>
    </div>
  );
}

export function GroupOrderOrderDetailsDialog({
  open,
  onOpenChange,
  order,
}: GroupOrderOrderDetailsDialogProps) {
  if (!order) return null;

  const itemCount = order.items?.length ?? 0;

  const categoryNames = Array.from(
    new Set(order.items?.map((item) => item.category?.name).filter(Boolean)),
  );

  const categoryLabel =
    categoryNames.length > 0 ? categoryNames.join(", ") : "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold text-slate-950">
                <PackageCheck className="h-4 w-4 text-blue-600" />
                Order Details
              </DialogTitle>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-blue-700">
                  {order.orderNumber}
                </span>

                <Badge
                  variant="outline"
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${statusClassName(
                    order.status,
                  )}`}
                >
                  {readableStatus(order.status)}
                </Badge>

                <Badge
                  variant="outline"
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${statusClassName(
                    order.paymentStatus,
                  )}`}
                >
                  <CreditCard className="mr-1 h-3 w-3" />
                  {readableStatus(order.paymentStatus)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[320px]">
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </p>
                <p className="text-sm font-bold text-slate-950">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                  Advance
                </p>
                <p className="text-sm font-bold text-blue-700">
                  {formatCurrency(order.advanceAmount)}
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                  Balance
                </p>
                <p className="text-sm font-bold text-amber-700">
                  {formatCurrency(order.balanceAmount)}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(90vh-96px)] space-y-4 overflow-y-auto p-5">
          <Card className="rounded-xl border-slate-200 shadow-none">
            <CardContent className="p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem
                  label="Customer"
                  value={
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {order.customer?.fullName || "-"}
                      </span>
                    </span>
                  }
                />

                <InfoItem
                  label="Phone"
                  value={
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {order.customer?.phoneNumber || "-"}
                      </span>
                    </span>
                  }
                />

                <InfoItem
                  label="Town"
                  value={
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {order.customer?.town || order.town || "-"}
                      </span>
                    </span>
                  }
                />

                <InfoItem
                  label="Category"
                  value={
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Shirt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{categoryLabel}</span>
                    </span>
                  }
                />

                <InfoItem
                  label="Order Date"
                  value={
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {formatDate(order.orderDate)}
                      </span>
                    </span>
                  }
                />

                <InfoItem
                  label="Promised Date"
                  value={
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {formatDate(order.promisedDate)}
                      </span>
                    </span>
                  }
                />

                <InfoItem label="Total Qty" value={order.totalQty} />
                <InfoItem label="Items" value={itemCount} />
              </div>

              {(order.customerAddress || order.notes || order.specialNotes) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <NoteBox
                    icon={
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    }
                    label="Customer Address"
                    value={order.customerAddress}
                    tone="slate"
                  />

                  <NoteBox
                    icon={
                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    }
                    label="Order Note"
                    value={order.notes}
                    tone="blue"
                  />

                  <NoteBox
                    icon={
                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    }
                    label="Special Note"
                    value={order.specialNotes}
                    tone="amber"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100 px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Scissors className="h-4 w-4 text-slate-500" />
                Order Items
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {order.items?.length ? (
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, index) => {
                    const measurementValues =
                      item.measurement?.values
                        ?.slice()
                        .sort(
                          (a, b) =>
                            (a.field?.sortOrder ?? 0) -
                            (b.field?.sortOrder ?? 0),
                        ) ?? [];

                    return (
                      <div key={item.id} className="p-4">
                        <div className="rounded-xl border border-slate-100 bg-white">
                          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                                  {index + 1}
                                </span>

                                <h3 className="text-sm font-semibold text-slate-950">
                                  {item.itemDescription || "Order Item"}
                                </h3>

                                <Badge
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-white text-[11px] font-semibold text-slate-700"
                                >
                                  <Shirt className="mr-1 h-3 w-3" />
                                  {item.category?.name || "-"}
                                </Badge>

                                <Badge
                                  variant="outline"
                                  className={`rounded-full text-[11px] font-semibold ${statusClassName(
                                    item.status,
                                  )}`}
                                >
                                  {readableStatus(item.status)}
                                </Badge>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span>
                                  Qty:{" "}
                                  <span className="font-semibold text-slate-800">
                                    {item.quantity}
                                  </span>
                                </span>

                                <span>
                                  Unit:{" "}
                                  <span className="font-semibold text-slate-800">
                                    {formatCurrency(item.unitPrice)}
                                  </span>
                                </span>

                                <span>
                                  Line Total:{" "}
                                  <span className="font-semibold text-slate-800">
                                    {formatCurrency(item.lineTotal)}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {item.block && (
                              <div className="min-w-45 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs">
                                <p className="font-semibold text-slate-500">
                                  Block
                                </p>

                                <p className="mt-0.5 font-bold text-slate-900">
                                  {item.block.blockNumber}
                                </p>

                                {(item.block.readyMadeSize ||
                                  item.block.sizeLabel) && (
                                  <p className="mt-0.5 text-slate-500">
                                    {item.block.readyMadeSize || "-"} ·{" "}
                                    {item.block.sizeLabel || "-"}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {(item.notes || item.tailorNote) && (
                            <div className="flex flex-wrap gap-2 px-4 py-3">
                              <NoteBox
                                icon={
                                  <StickyNote className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                                }
                                label="Item Note"
                                value={item.notes}
                                tone="blue"
                              />

                              <NoteBox
                                icon={
                                  <StickyNote className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                }
                                label="Tailor Note"
                                value={item.tailorNote}
                                tone="amber"
                              />
                            </div>
                          )}

                          {item.measurement ? (
                            <div className="border-t border-slate-100">
                              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                    <Ruler className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900">
                                      {item.measurement.measurementNumber}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                      Version {item.measurement.versionNo ?? 1}
                                    </p>
                                  </div>
                                </div>

                                <Badge
                                  variant="outline"
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${statusClassName(
                                    item.measurement.verificationStatus,
                                  )}`}
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  {readableStatus(
                                    item.measurement.verificationStatus,
                                  )}
                                </Badge>
                              </div>

                              {measurementValues.length > 0 ? (
                                <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
                                  {measurementValues.map((value) => {
                                    const isTextArea =
                                      value.field?.inputType === "TEXTAREA";

                                    return (
                                      <div
                                        key={value.id}
                                        className={
                                          isTextArea
                                            ? "min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 sm:col-span-2 lg:col-span-3"
                                            : "flex min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                                        }
                                      >
                                        <div className="min-w-0">
                                          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            {value.field?.label || "-"}
                                          </p>

                                          {value.note && (
                                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                                              {value.note}
                                            </p>
                                          )}
                                        </div>

                                        {isTextArea ? (
                                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-800">
                                            {value.value || "-"}
                                          </p>
                                        ) : (
                                          <div className="shrink-0 text-right">
                                            <span className="text-sm font-bold text-slate-950">
                                              {value.value || "-"}
                                            </span>

                                            {value.field?.unit && (
                                              <span className="ml-1 text-[11px] font-medium text-slate-500">
                                                {value.field.unit}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="px-4 pb-4 text-xs text-slate-500">
                                  No measurement values found.
                                </div>
                              )}

                              {(item.measurement.notes ||
                                item.measurement.verificationNote) && (
                                <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
                                  <NoteBox
                                    icon={
                                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    }
                                    label="Measurement Notes"
                                    value={item.measurement.notes}
                                    tone="slate"
                                  />

                                  <NoteBox
                                    icon={
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                    }
                                    label="Verification"
                                    value={item.measurement.verificationNote}
                                    tone="emerald"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                              No measurement linked to this item.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-32 items-center justify-center p-6 text-center">
                  <div>
                    <PackageCheck className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      No items found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      This order does not have any item records.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}