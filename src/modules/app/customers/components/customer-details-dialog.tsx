"use client";

import {
  Blocks,
  CalendarDays,
  MapPin,
  NotebookText,
  Phone,
  ReceiptText,
  UserRound,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  useGetCustomerById,
  type CustomerBlock,
  type CustomerOrder,
} from "../api/useGetCustomerbyId";
import { Link } from "@tanstack/react-router";

type CustomerDetailsDialogProps = {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const formatCurrency = (value?: string | number | null) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const orderSourceLabel: Record<string, string> = {
  DREZAURA: "Drezaura",
  PHYSICAL_SHOP: "Physical Shop",
};

const statusClassName = (status?: string) => {
  switch (status) {
    case "ACTIVE":
    case "COMPLETED":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "border-amber-100 bg-amber-50 text-amber-700";
    case "IN_PROGRESS":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "CANCELLED":
      return "border-red-100 bg-red-50 text-red-700";
    default:
      return "border-slate-100 bg-slate-50 text-slate-700";
  }
};

export function CustomerDetailsDialog({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  const { data, isLoading, isFetching } = useGetCustomerById(customerId, open);

  const customer = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-7xl overflow-hidden p-0 gap-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Customer Details
              </DialogTitle>
              <p className="mt-1 text-sm text-slate-500">
                View profile, blocks, orders, and tailoring history.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-80px)] overflow-y-auto bg-slate-50/70">
          {isLoading ? (
            <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">
              Loading customer details...
            </div>
          ) : !customer ? (
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
              <UserRound className="h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-900">
                Customer details not found
              </p>
            </div>
          ) : (
            <div className={cn("space-y-5 p-5", isFetching && "opacity-70")}>
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="bg-linear-to-r from-slate-900 to-slate-700 p-5 text-white">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">
                        {customer.fullName?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div>
                        <h2 className="text-2xl font-semibold">
                          {customer.fullName}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            {customer.phoneNumber}
                          </span>

                          {customer.alternatePhone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-4 w-4" />
                              Alt: {customer.alternatePhone}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {customer.town || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                      <HeroMetric
                        label="Blocks"
                        value={customer._count?.blocks ?? 0}
                      />
                      <HeroMetric
                        label="Orders"
                        value={customer._count?.orders ?? 0}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard
                    icon={Phone}
                    label="Primary Phone"
                    value={customer.phoneNumber}
                  />
                  <InfoCard
                    icon={Phone}
                    label="Alternative Phone"
                    value={customer.alternatePhone || "-"}
                  />
                  <InfoCard
                    icon={MapPin}
                    label="Town"
                    value={customer.town || "-"}
                  />
                  <InfoCard
                    icon={CalendarDays}
                    label="Created Date"
                    value={formatDate(customer.createdAt)}
                  />
                </div>

                <div className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-2">
                  <InfoCard
                    icon={MapPin}
                    label="Address"
                    value={customer.address || "-"}
                  />
                  <InfoCard
                    icon={NotebookText}
                    label="Customer Notes"
                    value={customer.notes || "-"}
                  />
                </div>
              </section>

              <section className="space-y-5">
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <SectionHeader
                    icon={Blocks}
                    title="Customer Blocks"
                    description="All tailoring blocks maintained for this customer."
                    count={customer.blocks?.length ?? 0}
                  />

                  <div className="p-4">
                    {customer.blocks?.length ? (
                      <BlocksTable blocks={customer.blocks} />
                    ) : (
                      <EmptyState
                        icon={Blocks}
                        title="No blocks found"
                        description="This customer does not have any saved blocks yet."
                      />
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <SectionHeader
                    icon={ReceiptText}
                    title="Customer Orders"
                    description="Recent orders and item-level tailoring details."
                    count={customer.orders?.length ?? 0}
                  />

                  <div className="p-4">
                    {customer.orders?.length ? (
                      <OrdersTable orders={customer.orders} />
                    ) : (
                      <EmptyState
                        icon={ReceiptText}
                        title="No orders found"
                        description="This customer does not have any orders yet."
                      />
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type HeroMetricProps = {
  label: string;
  value: string | number;
};

function HeroMetric({ label, value }: HeroMetricProps) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

type InfoCardProps = {
  icon: React.ElementType;
  label: string;
  value: string;
};

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="wrap-break-word text-sm font-medium leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

type SectionHeaderProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  count: number;
};

function SectionHeader({
  icon: Icon,
  title,
  description,
  count,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
        {count}
      </span>
    </div>
  );
}

function OrdersTable({ orders }: { orders: CustomerOrder[] }) {
  return (
    <div className="overflow-hidden rounded-sm border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold text-[10px]">Order No</th>
              <th className="px-4 py-3 font-semibold text-[10px]">Source</th>
              <th className="px-4 py-3 font-semibold text-[10px]">Order Date</th>
              <th className="px-4 py-3 font-semibold text-[10px]">Promissed Date</th>
              <th className="px-4 py-3 font-semibold text-[10px]">Status</th>
               <th className="px-4 py-3 font-semibold text-[10px]">Total Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-4">
                  <div>
                    <Link
                      to="/app/orders"
                      params={{ orderId: order.id }}
                      className="font-normal  hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </div>
                </td>

                 <td className="px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {orderSourceLabel[order.orderSource] || order.orderSource}
                  </span>
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {formatDate(order.orderDate)}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {formatDate(order.promisedDate)}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold",
                      statusClassName(order.status)
                    )}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-4 py-4 font-semibold text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BlocksTable({ blocks }: { blocks: CustomerBlock[] }) {
  return (
    <div className="overflow-hidden rounded-sm border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold text-[10px]">Block No</th>
              <th className="px-4 py-3 font-semibold text-[10px]">Category</th>
              <th className="px-4 py-3 font-semibold text-[10px]">Created Date</th>
              <th className="px-4 py-3 font-semibold text-[10px]">Last Used</th>
              <th className="px-4 py-3 font-semibold text-[10px]">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {blocks.map((block) => (
              <tr key={block.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-4">
  <div className="flex items-center gap-2">
    <Link
      to="/app/blocks"
      params={{ blockId: block.id }}
     className="font-normal  hover:underline"
    >
      {block.blockNumber}
    </Link>

    {block.isDefault && (
      <span
        title="Default block"
        className="inline-flex h-1.5 w-1.5 rounded-full bg-green-600 ring-4 ring-green-100"
      />
    )}
  </div>
</td>
                <td className="px-4 py-4 text-slate-700">
                  {block.category?.name || "-"}
                </td>

                  <td className="px-4 py-4 text-slate-700">
                  {formatDate(block.lastUsedAt)}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {formatDate(block.lastUsedAt)}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold",
                      statusClassName(block.status)
                    )}
                  >
                    {block.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <Icon className="h-9 w-9 text-slate-400" />
      <h4 className="mt-3 text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
    </div>
  );
}