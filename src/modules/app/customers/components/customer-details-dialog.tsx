// src/modules/app/customers/components/customer-details-dialog.tsx

"use client";

import * as React from "react";
import {
  BadgeCheck,
  Blocks,
  CalendarDays,
  ClipboardList,
  Loader2,
  MapPin,
  Phone,
  Ruler,
  Shirt,
  UserRound,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  useGetCustomerById,
  type CustomerBlockAssignment,
  type CustomerDetails,
  type CustomerMeasurementSummary,
  type CustomerOrderSummary,
} from "@/modules/app/customers/api/useGetCustomerbyId";

type CustomerDetailsDialogProps = {
  open: boolean;
  customerId?: string | null;
  onOpenChange: (open: boolean) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value?: string | number | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number.isNaN(amount) ? 0 : amount);
}

function readableStatus(value?: string | null) {
  if (!value) return "-";
  return value.replaceAll("_", " ");
}

function statusBadgeClass(status?: string | null) {
  switch (status) {
    case "ACTIVE":
    case "VERIFIED_OK":
    case "PAID":
    case "DELIVERED":
    case "READY":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PENDING":
    case "ADVANCE_PAID":
    case "PARTIALLY_PAID":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "CUTTING":
    case "SEWING":
    case "CONFIRMED":
    case "NEEDS_UPDATE":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "INACTIVE":
    case "ARCHIVED":
    case "REJECTED":
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-0.5 text-lg font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-3 text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function CustomerHeader({ customer }: { customer: CustomerDetails }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <UserRound className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-slate-950">
              {customer.fullName}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
              {customer.phoneNumber && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {customer.phoneNumber}
                </span>
              )}

              {customer.town && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {customer.town}
                </span>
              )}

              {customer.hospitalName && (
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {customer.hospitalName}
                </span>
              )}
            </div>

            {customer.address && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {customer.address}
              </p>
            )}

            {customer.notes && (
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                {customer.notes}
              </p>
            )}
          </div>
        </div>

        <Badge
          variant="outline"
          className="w-fit rounded-full border-slate-200 bg-slate-50 text-slate-700"
        >
          Customer
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          title="Orders"
          value={customer._count?.orders ?? customer.orders.length}
          icon={ClipboardList}
        />

        <SummaryCard
          title="Blocks"
          value={customer._count?.customerBlocks ?? customer.customerBlocks.length}
          icon={Blocks}
        />

        <SummaryCard
          title="Measurements"
          value={customer._count?.measurements ?? 0}
          icon={Ruler}
        />
      </div>
    </div>
  );
}

function OrderSummaryList({ orders }: { orders: CustomerOrderSummary[] }) {
  if (!orders.length) {
    return (
      <EmptyState
        title="No orders found"
        description="This customer does not have any orders yet."
        icon={ClipboardList}
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black text-slate-950">
                  #{order.orderNumber}
                </p>

                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full text-[10px] font-bold",
                    statusBadgeClass(order.status),
                  )}
                >
                  {readableStatus(order.status)}
                </Badge>

                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full text-[10px] font-bold",
                    statusBadgeClass(order.paymentStatus),
                  )}
                >
                  {readableStatus(order.paymentStatus)}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Order: {formatDate(order.orderDate)}
                </span>

                <span>Promised: {formatDate(order.promisedDate)}</span>
                <span>Qty: {order.totalQty}</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 px-3 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Balance
              </p>
              <p className="text-sm font-black text-slate-950">
                {formatMoney(order.balanceAmount)}
              </p>
            </div>
          </div>

          {order.items.length > 0 && (
            <>
              <Separator className="my-3" />

              <div className="grid gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {item.itemDescription ||
                          item.category?.name ||
                          "Order item"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {item.category?.name || "-"} • Qty {item.quantity}
                      </p>
                    </div>

                    <p className="text-xs font-bold text-slate-900">
                      {formatMoney(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function MeasurementValuesGrid({
  measurement,
}: {
  measurement: CustomerMeasurementSummary;
}) {
  if (!measurement.values.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
        No measurement values found.
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {measurement.values.map((item) => {
        const displayValue = item.value ?? item.numericValue ?? "-";

        return (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {item.field.label}
            </p>

            <p className="mt-1 text-sm font-black text-slate-950">
              {displayValue}
              {item.field.unit ? (
                <span className="ml-1 text-xs font-semibold text-slate-500">
                  {item.field.unit}
                </span>
              ) : null}
            </p>

            {item.note && (
              <p className="mt-1 text-[11px] text-slate-500">{item.note}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BlocksAndMeasurementsList({
  customerBlocks,
}: {
  customerBlocks: CustomerBlockAssignment[];
}) {
  if (!customerBlocks.length) {
    return (
      <EmptyState
        title="No blocks assigned"
        description="This customer does not have any assigned blocks yet."
        icon={Blocks}
      />
    );
  }

  return (
    <Accordion type="multiple" className="space-y-3">
      {customerBlocks.map((assignment) => {
        const block = assignment.block;
        const measurement = assignment.measurement;

        return (
          <AccordionItem
            key={assignment.id}
            value={assignment.id}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white px-0 shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex min-w-0 flex-1 flex-col gap-2 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Shirt className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">
                      {block.blockNumber}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                      {block.category?.name || "-"}
                      {block.sizeLabel ? ` • ${block.sizeLabel}` : ""}
                      {block.readyMadeSize ? ` • ${block.readyMadeSize}` : ""}
                    </p>
                  </div>

                  {assignment.isDefault && (
                    <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">
                      Default
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-[10px] font-bold",
                      statusBadgeClass(block.status),
                    )}
                  >
                    {readableStatus(block.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>Orders: {block._count?.orderItems ?? 0}</span>
                  <span>Assigned: {formatDate(assignment.assignedAt)}</span>
                  <span>
                    Measurement:{" "}
                    {measurement ? measurement.measurementNumber : "Not linked"}
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Fit Notes
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {block.fitNotes || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {block.description || "-"}
                    </p>
                  </div>

                  {block.remarks && (
                    <div className="sm:col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Remarks
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {block.remarks}
                      </p>
                    </div>
                  )}
                </div>

                {measurement ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-blue-950">
                          {measurement.measurementNumber}
                        </p>

                        <p className="mt-1 text-xs text-blue-700">
                          Created {formatDate(measurement.createdAt)}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "w-fit rounded-full text-[10px] font-bold",
                          statusBadgeClass(measurement.verificationStatus),
                        )}
                      >
                        {readableStatus(measurement.verificationStatus)}
                      </Badge>
                    </div>

                    {measurement.notes && (
                      <p className="mb-3 rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                        {measurement.notes}
                      </p>
                    )}

                    <MeasurementValuesGrid measurement={measurement} />
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-4 text-sm text-amber-800">
                    No measurement is linked to this block assignment.
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function CustomerDetailsLoading() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}

export function CustomerDetailsDialog({
  open,
  customerId,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  const {
    data: customer,
    isLoading,
    isFetching,
    isError,
  } = useGetCustomerById(customerId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg border-slate-200 bg-slate-50 p-0 gap-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <UserRound className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg font-black text-slate-950">
                Customer Details
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm text-slate-500">
                View customer summary, recent orders, assigned blocks, and linked
                measurements.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(92vh-88px)]">
          {isLoading ? (
            <CustomerDetailsLoading />
          ) : isError ? (
            <div className="p-5">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                Customer details could not be loaded. Please try again.
              </div>
            </div>
          ) : customer ? (
            <div className={cn("space-y-5 p-5", isFetching && "opacity-70")}>
              <CustomerHeader customer={customer} />

              <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <ClipboardList className="h-4 w-4" />
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-950">
                        Recent Orders
                      </h4>
                      <p className="text-xs text-slate-500">
                        Summary only. Full order details can be opened from the
                        order page.
                      </p>
                    </div>
                  </div>

                  <OrderSummaryList orders={customer.orders} />
                </CardContent>
              </Card>

              <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <WalletCards className="h-4 w-4" />
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-950">
                        Blocks & Measurements
                      </h4>
                      <p className="text-xs text-slate-500">
                        Expand a block to view the linked measurement values.
                      </p>
                    </div>
                  </div>

                  <BlocksAndMeasurementsList
                    customerBlocks={customer.customerBlocks}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                title="Customer not found"
                description="The selected customer could not be found."
                icon={UserRound}
              />
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}