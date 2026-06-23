// src/modules/app/customers/components/customer-details-dialog.tsx

"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Blocks,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  Shirt,
  UserRound,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getLatestMeasurement } from "@/api/useGetLatestMeasurement";
import { getApiErrorMessage } from "@/errors/api-error-response";
import { getBlockById } from "@/modules/app/blocks/api/useGetBlockById";
import { useGetBlocks } from "@/modules/app/blocks/api/useGetBlocks";
import { useUpdateBlockCustomers } from "@/modules/app/blocks/api/useUpdateBlockCustomers";
import { customersQueryKeys } from "@/modules/app/customers/api/useGetCustomers";
import { toast } from "sonner";

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

function CustomerHeader({
  customer,
  onAssignBlocks,
}: {
  customer: CustomerDetails;
  onAssignBlocks: () => void;
}) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
              {customer.fullName?.charAt(0)?.toUpperCase() || "C"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {customer.fullName}
                </h2>
                <Badge variant="outline">Customer</Badge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {customer.phoneNumber || "No phone number"}
                <span className="mx-1.5">-</span>
                {customer.town || "No town added"}
              </p>
            </div>
          </div>

          <Button type="button" size="sm" onClick={onAssignBlocks}>
            <Plus className="size-4" />
            Assign Blocks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerInformation({
  customer,
  open,
  onOpenChange,
}: {
  customer: CustomerDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card size="sm">
        <CardHeader className="grid grid-cols-[1fr_auto] gap-3">
          <div>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>
              Contact, location, and profile lifecycle information.
            </CardDescription>
          </div>

          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={
                open
                  ? "Collapse customer information"
                  : "Expand customer information"
              }
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  open && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent className="overflow-hidden">
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
              <div className="space-y-1">
                <CustomerDetailRow
                  icon={Phone}
                  label="Phone Number"
                  value={customer.phoneNumber || "-"}
                />
                <Separator />
                <CustomerDetailRow
                  icon={Phone}
                  label="Alternative Phone"
                  value={customer.alternatePhone || "-"}
                />
                <Separator />
                <CustomerDetailRow
                  icon={MapPin}
                  label="Town"
                  value={customer.town || "-"}
                />
              </div>

              <div className="space-y-1">
                <CustomerDetailRow
                  icon={BadgeCheck}
                  label="Hospital"
                  value={customer.hospitalName || "-"}
                />
                <Separator />
                <CustomerDetailRow
                  icon={CalendarDays}
                  label="Created On"
                  value={formatDate(customer.createdAt)}
                />
                <Separator />
                <CustomerDetailRow
                  icon={CalendarDays}
                  label="Last Modified"
                  value={formatDate(customer.updatedAt)}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function CustomerDetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function CustomerAddressAndNotes({ customer }: { customer: CustomerDetails }) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <MapPin className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Address
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {customer.address || "No address added."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {customer.notes || "No notes added."}
              </p>
            </div>
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
          <div
            key={item.id}
            className="rounded-lg border bg-background px-3 py-2"
          >
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
  const [informationOpen, setInformationOpen] = React.useState(true);
  const {
    data: customer,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCustomerById(customerId, open);

  const handleBlockAssigned = async () => {
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
            <SheetTitle>Customer Details</SheetTitle>
            <SheetDescription >
              View customer profile, contact information, assigned blocks, and
              order history.
            </SheetDescription>
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
              <div className={cn("space-y-4 p-4", isFetching && "opacity-70")}>
                <CustomerHeader
                  customer={customer}
                  onAssignBlocks={() => setAssignBlockOpen(true)}
                />

                <CustomerInformation
                  customer={customer}
                  open={informationOpen}
                  onOpenChange={setInformationOpen}
                />

                <CustomerAddressAndNotes customer={customer} />

                <Tabs defaultValue="orders">
                  <div className="sticky top-0 z-10 border-b bg-popover ">
                    <TabsList
                      className="grid w-full grid-cols-2"
                      variant="line"
                    >
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

      <AssignCustomerBlockDialog
        customerId={customerId}
        open={assignBlockOpen}
        onOpenChange={setAssignBlockOpen}
        onAssigned={handleBlockAssigned}
      />
    </>
  );
}

type AssignCustomerBlockDialogProps = {
  customerId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void | Promise<void>;
};

export function AssignCustomerBlockDialog({
  customerId,
  open,
  onOpenChange,
  onAssigned,
}: AssignCustomerBlockDialogProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [selectedBlockIds, setSelectedBlockIds] = React.useState<string[]>([]);
  const [makeDefault, setMakeDefault] = React.useState(true);
  const { data: customer, isLoading: isCustomerLoading } = useGetCustomerById(
    customerId,
    open,
  );
  const { data: blocksResponse, isLoading: areBlocksLoading } = useGetBlocks({
    page: 1,
    pageSize: 50,
    search: search.trim() || undefined,
    status: "ACTIVE",
    includeCounts: true,
    includeTotal: false,
    enabled: open,
  });
  const updateBlockCustomers = useUpdateBlockCustomers();

  const blocks = blocksResponse?.data.items ?? [];
  const assignedBlockIds = React.useMemo(
    () => new Set(customer?.customerBlocks.map((item) => item.block.id) ?? []),
    [customer?.customerBlocks],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (updateBlockCustomers.isPending) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setSearch("");
      setSelectedBlockIds([]);
      setMakeDefault(true);
    }
  };

  const toggleBlock = (blockId: string) => {
    const selectedBlock = blocks.find((block) => block.id === blockId);

    setSelectedBlockIds((current) => {
      if (current.includes(blockId)) {
        return current.filter((id) => id !== blockId);
      }

      if (!selectedBlock) return current;

      const otherCategories = current.filter((id) => {
        const currentBlock = blocks.find((block) => block.id === id);
        return currentBlock?.categoryId !== selectedBlock.categoryId;
      });

      return [...otherCategories, blockId];
    });
  };

  const handleAssign = async () => {
    if (!customerId || !selectedBlockIds.length) return;

    try {
      const selectedBlocks = await Promise.all(
        selectedBlockIds.map(async (blockId) => {
          const response = await getBlockById(blockId);
          const measurement = await getLatestMeasurement({
            customerId,
            categoryId: response.data.categoryId,
          }).catch(() => null);

          return { block: response.data, measurement };
        }),
      );

      for (const { block, measurement } of selectedBlocks) {
        if (
          block.customerBlocks.some(
            (assignment) => assignment.customerId === customerId,
          )
        ) {
          continue;
        }

        await updateBlockCustomers.mutateAsync({
          blockId: block.id,
          payload: {
            customers: [
              ...block.customerBlocks.map((assignment) => ({
                customerId: assignment.customerId,
                measurementId: assignment.measurementId ?? undefined,
                isDefault: assignment.isDefault,
              })),
              {
                customerId,
                measurementId: measurement?.id,
                isDefault: makeDefault,
              },
            ],
          },
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: customerDetailsQueryKeys.detail(customerId),
        }),
        queryClient.invalidateQueries({ queryKey: customersQueryKeys.all }),
        onAssigned?.(),
      ]);

      toast.success(
        `${selectedBlockIds.length} block${selectedBlockIds.length === 1 ? "" : "s"} assigned successfully`,
      );
      handleOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to assign the blocks."));
    }
  };

  const isLoading = isCustomerLoading || areBlocksLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Blocks className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg">Assign Blocks</DialogTitle>
              <DialogDescription className="mt-1">
                Select one or more block numbers across the uniform set. The
                latest matching measurements are linked automatically.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {customer && (
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {customer.fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {customer.phoneNumber || "No phone number"}
                  {customer.town ? ` - ${customer.town}` : ""}
                </p>
              </div>
              <Badge variant="outline">
                {customer.customerBlocks.length} assigned
              </Badge>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <div className="mb-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Select Blocks</p>
                <Badge variant="outline">
                  {selectedBlockIds.length} selected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Select every item needed for the uniform set, one block number
                per item category.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                className="pl-9"
                placeholder="Search active blocks..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {isLoading ? (
                <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading blocks...
                </div>
              ) : blocks.length ? (
                blocks.map((block) => {
                  const isAssigned = assignedBlockIds.has(block.id);
                  const isSelected = selectedBlockIds.includes(block.id);

                  return (
                    <button
                      key={block.id}
                      type="button"
                      disabled={isAssigned}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
                        isSelected && "border-primary bg-primary/5",
                        isAssigned &&
                          "cursor-not-allowed bg-muted/50 opacity-70",
                        !isAssigned && !isSelected && "hover:bg-muted/50",
                      )}
                      onClick={() => toggleBlock(block.id)}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{block.blockNumber}</p>
                          <Badge variant="secondary">
                            {block.category?.name || "Uncategorized"}
                          </Badge>
                          {isAssigned && (
                            <Badge variant="outline">Assigned</Badge>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {block.readyMadeSize || block.sizeLabel || "No size"}
                          {block.description ? ` - ${block.description}` : ""}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="min-h-32 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No active blocks match this search.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">
                Make selected blocks default
              </p>
              <p className="text-xs text-muted-foreground">
                Each selected block becomes the customer&apos;s default for its
                own item category.
              </p>
            </div>
            <Switch checked={makeDefault} onCheckedChange={setMakeDefault} />
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={updateBlockCustomers.isPending}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              !selectedBlockIds.length || updateBlockCustomers.isPending
            }
            onClick={handleAssign}
          >
            {updateBlockCustomers.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Assign {selectedBlockIds.length || ""} Block
            {selectedBlockIds.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
