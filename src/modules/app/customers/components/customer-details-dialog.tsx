// src/modules/app/customers/components/customer-details-dialog.tsx

"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Blocks,
  CalendarDays,
  ClipboardList,
  MapPin,
  Phone,
  Plus,
  Shirt,
  UserRound,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CreateBlockDialog } from "@/modules/app/blocks/components/create-block-dialog";
import { customersQueryKeys } from "@/modules/app/customers/api/useGetCustomers";

import {
  customerDetailsQueryKeys,
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

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

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

function statusBadgeVariant(status?: string | null): BadgeVariant {
  switch (status) {
    case "ACTIVE":
    case "VERIFIED_OK":
    case "PAID":
    case "DELIVERED":
    case "READY":
      return "default";

    case "INACTIVE":
    case "ARCHIVED":
    case "REJECTED":
    case "CANCELLED":
      return "destructive";

    case "PENDING":
    case "ADVANCE_PAID":
    case "PARTIALLY_PAID":
    case "CUTTING":
    case "SEWING":
    case "CONFIRMED":
    case "NEEDS_UPDATE":
      return "secondary";

    default:
      return "outline";
  }
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-foreground/10">
          <Icon className="size-3.5" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {value}
          </p>
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
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-background px-4 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>

      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function CustomerHeader({ customer }: { customer: CustomerDetails }) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              {customer.fullName?.charAt(0)?.toUpperCase() || "C"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="truncate text-base">
                  {customer.fullName}
                </CardTitle>
                <Badge variant="secondary">Customer</Badge>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {customer.phoneNumber && (
                  <span className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5">
                    <Phone className="size-3.5" />
                    {customer.phoneNumber}
                  </span>
                )}

                {customer.town && (
                  <span className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5">
                    <MapPin className="size-3.5" />
                    {customer.town}
                  </span>
                )}

                {customer.hospitalName && (
                  <span className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5">
                    <BadgeCheck className="size-3.5" />
                    {customer.hospitalName}
                  </span>
                )}
              </div>

              {(customer.address || customer.notes) && (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {customer.address && (
                    <p className="line-clamp-1 leading-5">
                      {customer.address}
                    </p>
                  )}

                  {customer.notes && (
                    <p className="line-clamp-1 rounded-md bg-muted/50 px-2 py-1 leading-5">
                      {customer.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SummaryCard
              title="Orders"
              value={customer._count?.orders ?? customer.orders.length}
              icon={ClipboardList}
            />

            <SummaryCard
              title="Blocks"
              value={
                customer._count?.customerBlocks ??
                customer.customerBlocks.length
              }
              icon={Blocks}
            />
          </div>
        </div>
      </CardContent>
    </Card>
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
        <Card key={order.id} size="sm">
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    #{order.orderNumber}
                  </p>

                  <Badge variant={statusBadgeVariant(order.status)}>
                    {readableStatus(order.status)}
                  </Badge>

                  <Badge variant={statusBadgeVariant(order.paymentStatus)}>
                    {readableStatus(order.paymentStatus)}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    Order: {formatDate(order.orderDate)}
                  </span>

                  <span>Promised: {formatDate(order.promisedDate)}</span>
                  <span>Qty: {order.totalQty}</span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/40 px-3 py-2 text-right">
                <p className="text-xs font-medium text-muted-foreground">
                  Balance
                </p>
                <p className="text-sm font-semibold text-foreground">
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
                      className="flex flex-col gap-1 rounded-lg bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {item.itemDescription ||
                            item.category?.name ||
                            "Order item"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.category?.name || "-"} - Qty {item.quantity}
                        </p>
                      </div>

                      <p className="text-xs font-medium text-foreground">
                        {formatMoney(item.lineTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
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
      <div className="rounded-lg border border-dashed bg-background px-3 py-4 text-center text-xs text-muted-foreground">
        No measurement values found.
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {measurement.values.map((item) => {
        const displayValue = item.value ?? item.numericValue ?? "-";

        return (
          <div key={item.id} className="rounded-lg border bg-background px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">
              {item.field.label}
            </p>

            <p className="mt-1 text-sm font-semibold text-foreground">
              {displayValue}
              {item.field.unit ? (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {item.field.unit}
                </span>
              ) : null}
            </p>

            {item.note && (
              <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
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
    <Accordion type="multiple" className="gap-2">
      {customerBlocks.map((assignment) => {
        const block = assignment.block;
        const measurement = assignment.measurement;

        return (
          <AccordionItem
            key={assignment.id}
            value={assignment.id}
            className="rounded-lg border px-3"
          >
            <AccordionTrigger>
              <div className="flex min-w-0 flex-1 flex-col gap-2 pr-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Shirt className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {block.blockNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {block.category?.name || "-"}
                      {block.sizeLabel ? ` - ${block.sizeLabel}` : ""}
                      {block.readyMadeSize ? ` - ${block.readyMadeSize}` : ""}
                    </p>
                  </div>

                  {assignment.isDefault && <Badge>Default</Badge>}

                  <Badge variant={statusBadgeVariant(block.status)}>
                    {readableStatus(block.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-normal text-muted-foreground">
                  <span>Orders: {block._count?.orderItems ?? 0}</span>
                  <span>Assigned: {formatDate(assignment.assignedAt)}</span>
                  <span>
                    Measurement:{" "}
                    {measurement ? measurement.measurementNumber : "Not linked"}
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-4">
                <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Fit Notes
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {block.fitNotes || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Description
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {block.description || "-"}
                    </p>
                  </div>

                  {block.remarks && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Remarks
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {block.remarks}
                      </p>
                    </div>
                  )}
                </div>

                {measurement ? (
                  <Card size="sm">
                    <CardHeader>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle>{measurement.measurementNumber}</CardTitle>

                          <CardDescription>
                            Created {formatDate(measurement.createdAt)}
                          </CardDescription>
                        </div>

                        <Badge
                          variant={statusBadgeVariant(
                            measurement.verificationStatus,
                          )}
                        >
                          {readableStatus(measurement.verificationStatus)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {measurement.notes && (
                        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                          {measurement.notes}
                        </div>
                      )}

                      <MeasurementValuesGrid measurement={measurement} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="rounded-lg border border-dashed bg-background px-3 py-4 text-sm text-muted-foreground">
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

function TabPanelHeader({
  title,
  description,
  icon: Icon,
  count,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  count: number;
}) {
  return (
    <div className="mb-3 flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10">
          <Icon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <Badge variant="outline" className="w-fit">
        {count}
      </Badge>
    </div>
  );
}

function CustomerDetailsLoading() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function CustomerDetailsDialog({
  open,
  customerId,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  const queryClient = useQueryClient();
  const [assignBlockOpen, setAssignBlockOpen] = React.useState(false);
  const {
    data: customer,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCustomerById(customerId, open);

  const initialBlockCustomer = React.useMemo(() => {
    if (!customer) return null;

    return {
      id: customer.id,
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      alternatePhone: customer.alternatePhone,
      town: customer.town,
      hospitalName: customer.hospitalName,
      address: customer.address,
    };
  }, [customer]);

  const handleBlockCreated = async () => {
    await Promise.all([
      refetch(),
      queryClient.invalidateQueries({
        queryKey: customerDetailsQueryKeys.detail(customerId),
      }),
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.all,
      }),
    ]);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-4xl"
        >
          <SheetHeader className="border-b p-4 pr-14">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <SheetTitle>Customer Details</SheetTitle>
                <SheetDescription className="mt-1">
                  View customer summary, recent orders, assigned blocks, and
                  linked measurements.
                </SheetDescription>
              </div>

              {customer && (
                <Button
                  type="button"
                  onClick={() => setAssignBlockOpen(true)}
                  className="w-fit shrink-0"
                >
                  <Plus className="size-4" />
                  Assign Block
                </Button>
              )}
            </div>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1">
            {isLoading ? (
              <CustomerDetailsLoading />
            ) : isError ? (
              <div className="p-5">
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  Customer details could not be loaded. Please try again.
                </div>
              </div>
            ) : customer ? (
              <div className={cn("space-y-3 p-4", isFetching && "opacity-70")}>
                <CustomerHeader customer={customer} />

                <Tabs defaultValue="orders">
                  <div className="sticky top-0 z-10 border-b bg-popover ">
                    <TabsList className="grid w-full grid-cols-2" variant="line">
                      <TabsTrigger value="orders">
                        <ClipboardList className="size-4" />
                        Recent Orders
                        <Badge variant="secondary" className="ml-1">
                          {customer.orders.length}
                        </Badge>
                      </TabsTrigger>

                      <TabsTrigger value="blocks">
                        <WalletCards className="size-4" />
                        Blocks
                        <Badge variant="secondary" className="ml-1">
                          {customer.customerBlocks.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="orders" className="mt-2">
                    <TabPanelHeader
                      title="Recent Orders"
                      description="Summary only. Full order details can be opened from the order page."
                      icon={ClipboardList}
                      count={customer.orders.length}
                    />
                    <OrderSummaryList orders={customer.orders} />
                  </TabsContent>

                  <TabsContent value="blocks" className="mt-2">
                    <TabPanelHeader
                      title="Blocks & Measurements"
                      description="Expand a block to view linked measurements and values."
                      icon={WalletCards}
                      count={customer.customerBlocks.length}
                    />
                    <BlocksAndMeasurementsList
                      customerBlocks={customer.customerBlocks}
                    />
                  </TabsContent>
                </Tabs>
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
        </SheetContent>
      </Sheet>

      <CreateBlockDialog
        open={assignBlockOpen}
        onOpenChange={setAssignBlockOpen}
        initialCustomer={initialBlockCustomer}
        onCreated={handleBlockCreated}
      />
    </>
  );
}
