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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Customer Details
              </DialogTitle>
              <p className="mt-1 text-sm">
                View profile, blocks, orders, and tailoring history.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-80px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex min-h-96 items-center justify-center text-sm">
              Loading customer details...
            </div>
          ) : !customer ? (
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
              <UserRound className="h-10 w-10" />
              <p className="mt-3 text-sm font-medium">
                Customer details not found
              </p>
            </div>
          ) : (
            <div className={cn("space-y-5 p-5", isFetching && "opacity-70")}>
              <section className="overflow-hidden border">
                <div className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center text-lg">
                        {customer.fullName?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div>
                        <h2 className="text-2xl font-semibold">
                          {customer.fullName}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
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

                <div className="grid gap-4 border-t p-5 md:grid-cols-2">
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
                <div className="border">
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

                <div className="border">
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
    <div className="px-4 py-3">
      <p className="text-xs font-medium uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
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
    <div className="border p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="wrap-break-word text-sm font-medium leading-6">{value}</p>
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
    <div className="flex items-start justify-between gap-4 border-b p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs">{description}</p>
        </div>
      </div>

      <span className="px-2.5 py-1 text-xs font-semibold">{count}</span>
    </div>
  );
}

function OrdersTable({ orders }: { orders: CustomerOrder[] }) {
  return (
    <div className="overflow-hidden border">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-190 text-left text-sm">
          <TableHeader className="border-b text-xs uppercase">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Order No
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Source
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Order Date
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Promissed Date
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Total Amount
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y">
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-4 py-4">
                  <div>
                    <Link
                      to="/app/orders"
                      params={{ orderId: order.id }}
                      className="font-normal  hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4">
                  <span className="px-2.5 py-1 text-xs font-semibold">
                    {orderSourceLabel[order.orderSource] || order.orderSource}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-4">
                  {formatDate(order.orderDate)}
                </TableCell>

                <TableCell className="px-4 py-4">
                  {formatDate(order.promisedDate)}
                </TableCell>

                <TableCell className="px-4 py-4">
                  <Badge
                    variant={
                      order.status === "CANCELLED" ? "destructive" : "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-4 font-semibold">
                  {formatCurrency(order.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function BlocksTable({ blocks }: { blocks: CustomerBlock[] }) {
  return (
    <div className="overflow-hidden border">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-180 text-left text-sm">
          <TableHeader className="border-b text-xs uppercase">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Block No
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Category
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Created Date
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Last Used
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y">
            {blocks.map((block) => (
              <TableRow key={block.id}>
                <TableCell className="px-4 py-4">
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
                        className="inline-flex h-1.5 w-1.5 ring-4"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  {block.category?.name || "-"}
                </TableCell>

                <TableCell className="px-4 py-4">
                  {formatDate(block.lastUsedAt)}
                </TableCell>

                <TableCell className="px-4 py-4">
                  {formatDate(block.lastUsedAt)}
                </TableCell>

                <TableCell className="px-4 py-4">
                  <Badge
                    variant={
                      block.status === "CANCELLED" ? "destructive" : "secondary"
                    }
                  >
                    {block.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    <div className="flex min-h-48 flex-col items-center justify-center border border-dashed p-6 text-center">
      <Icon className="h-9 w-9" />
      <h4 className="mt-3 text-sm font-semibold">{title}</h4>
      <p className="mt-1 max-w-xs text-sm">{description}</p>
    </div>
  );
}
