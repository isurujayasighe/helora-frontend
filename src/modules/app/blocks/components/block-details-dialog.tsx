"use client";

import {
  BarChart3,
  Blocks,
  CalendarDays,
  ChevronDown,
  FileText,
  History,
  Link2,
  Loader2,
  MapPin,
  PackageCheck,
  Pencil,
  Phone,
  Ruler,
  Shirt,
  Tags,
  type LucideIcon,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  getLatestMeasurement,
  useGetBlockMeasurements,
} from "@/api/useGetLatestMeasurement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/errors/api-error-response";
import { cn } from "@/lib/utils";
import {
  useGetBlockById,
  type BlockDetailsCustomerAssignment,
} from "../api/useGetBlockById";
import { useLinkMeasurementToBlock } from "../api/useLinkMeasurementToBlock";

type BlockDetailsDialogProps = {
  blockId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManageAssignments?: (blockId: string) => void;
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

export function BlockDetailsDialog({
  blockId,
  open,
  onOpenChange,
  onManageAssignments,
}: BlockDetailsDialogProps) {
  const { data, isLoading, isFetching } = useGetBlockById(blockId, open);
  const linkMeasurementToBlock = useLinkMeasurementToBlock();
  const [activeTab, setActiveTab] = useState("customers");
  const [specificationsOpen, setSpecificationsOpen] = useState(true);
  const [linkingCustomerId, setLinkingCustomerId] = useState<string | null>(
    null,
  );
  const block = data?.data;
  const {
    data: measurements = [],
    isLoading: isMeasurementsLoading,
    isFetching: isMeasurementsFetching,
  } = useGetBlockMeasurements({
    blockId,
    enabled: open && activeTab === "measurements",
  });

  const handleLinkLatestMeasurement = async (customerId: string) => {
    if (!blockId || !block?.categoryId) return;

    setLinkingCustomerId(customerId);

    try {
      const measurement = await getLatestMeasurement({
        customerId,
        categoryId: block.categoryId,
      });

      if (!measurement) {
        toast.error("No matching measurement found for this customer.");
        return;
      }

      await linkMeasurementToBlock.mutateAsync({
        blockId,
        payload: {
          measurementId: measurement.id,
          makeDefaultForCustomer: true,
          updateOrderItems: false,
        },
      });

      toast.success("Measurement linked to block");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to link measurement to block."),
      );
    } finally {
      setLinkingCustomerId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-4xl"
      >
        <SheetHeader className="border-b p-4 pr-14">
          <SheetTitle>Block Details</SheetTitle>
          <SheetDescription>
            View block details, customer assignments, measurements, versions,
            and order history.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          {isLoading ? (
            <BlockDetailsLoading />
          ) : !block ? (
            <Empty className="min-h-80">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Blocks />
                </EmptyMedia>
                <EmptyTitle>Block details not found</EmptyTitle>
                <EmptyDescription>
                  The selected block may have been removed or is unavailable.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className={cn("space-y-4 p-4", isFetching && "opacity-70")}>
              <Card size="sm">
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Shirt className="size-6" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            {block.blockNumber}
                          </h2>
                          <Badge
                            variant={
                              block.status === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {block.status.replaceAll("_", " ")}
                          </Badge>
                          <Badge variant="outline">
                            {block.category?.name || "Block"}
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {block.readyMadeSize || block.sizeLabel || "No size"}
                          <span className="mx-1.5">·</span>
                          Version V{block.versionNo}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onManageAssignments && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onManageAssignments(block.id)}
                        >
                          <Pencil className="size-4" />
                          Assign Customers
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setActiveTab("measurements")}
                      >
                        <Link2 className="size-4" />
                        Measurements
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Collapsible
                open={specificationsOpen}
                onOpenChange={setSpecificationsOpen}
              >
                <Card size="sm">
                  <CardHeader className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                      <CardTitle>Block Specifications</CardTitle>
                      <CardDescription>
                        Core sizing and lifecycle information for this block.
                      </CardDescription>
                    </div>

                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={
                          specificationsOpen
                            ? "Collapse block specifications"
                            : "Expand block specifications"
                        }
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform",
                            specificationsOpen && "rotate-180",
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  </CardHeader>

                  <CollapsibleContent className="overflow-hidden">
                    <CardContent>
                      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                        <div className="space-y-1">
                          <DetailRow
                            icon={Tags}
                            label="Category"
                            value={block.category?.name || "-"}
                          />
                          <Separator />
                          <DetailRow
                            icon={Ruler}
                            label="Size / Spec"
                            value={block.readyMadeSize || "-"}
                          />
                          <Separator />
                          <DetailRow
                            icon={Shirt}
                            label="Size Label"
                            value={block.sizeLabel || "-"}
                          />
                        </div>

                        <div className="space-y-1">
                          <DetailRow
                            icon={CalendarDays}
                            label="Created On"
                            value={formatDate(block.createdAt)}
                          />
                          <Separator />
                          <DetailRow
                            icon={CalendarDays}
                            label="Last Modified"
                            value={formatDate(block.updatedAt)}
                          />
                          <Separator />
                          <DetailRow
                            icon={BarChart3}
                            label="Lifetime Usage"
                            value={`${block._count?.orderItems ?? 0} order item(s)`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Card size="sm">
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Description
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {block.description || "No description added."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <section>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="sticky top-0 z-10 border-b bg-popover">
                    <TabsList
                      className="grid w-full grid-cols-4"
                      variant="line"
                    >
                      <TabsTrigger value="customers">
                        <UserRound className="size-4" />
                        Customers
                        <Badge variant="secondary" className="ml-1">
                          {block.customerBlocks?.length ?? 0}
                        </Badge>
                      </TabsTrigger>

                      <TabsTrigger value="measurements">
                        <Ruler className="size-4" />
                        Measurements
                        <Badge variant="secondary" className="ml-1">
                          {block._count?.measurements ?? measurements.length}
                        </Badge>
                      </TabsTrigger>

                      <TabsTrigger value="versions">
                        <History className="size-4" />
                        Versions
                        <Badge variant="secondary" className="ml-1">
                          {(block.previousBlock ? 1 : 0) +
                            (block.nextVersions?.length ?? 0)}
                        </Badge>
                      </TabsTrigger>

                      <TabsTrigger value="orders">
                        <PackageCheck className="size-4" />
                        Orders
                        <Badge variant="secondary" className="ml-1">
                          {block._count?.orderItems ?? 0}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="customers" className="mt-2">
                    <AssignedCustomersTable
                      customerBlocks={block.customerBlocks ?? []}
                      linkingCustomerId={linkingCustomerId}
                      onLinkLatestMeasurement={handleLinkLatestMeasurement}
                    />
                  </TabsContent>

                  <TabsContent value="measurements" className="mt-2">
                    <MeasurementsTable
                      measurements={measurements}
                      isLoading={
                        isMeasurementsLoading || isMeasurementsFetching
                      }
                    />
                  </TabsContent>

                  <TabsContent value="versions" className="mt-2">
                    <VersionHistoryTable
                      previousBlock={block.previousBlock}
                      nextVersions={block.nextVersions ?? []}
                    />
                  </TabsContent>

                  <TabsContent value="orders" className="mt-2">
                    <OrderUsageTable orderItems={block.orderItems ?? []} />
                  </TabsContent>
                </Tabs>
              </section>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function BlockDetailsLoading() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function DetailRow({
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

function AssignedCustomersTable({
  customerBlocks,
  linkingCustomerId,
  onLinkLatestMeasurement,
}: {
  customerBlocks: BlockDetailsCustomerAssignment[];
  linkingCustomerId: string | null;
  onLinkLatestMeasurement: (customerId: string) => void;
}) {
  if (!customerBlocks.length) {
    return <EmptyMessage message="No customers assigned to this block." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Assigned Customers
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Customers who can use this block and their linked measurements.
          </p>
        </div>
        <Badge variant="secondary">{customerBlocks.length}</Badge>
      </div>

      {customerBlocks.map((item) => (
        <Card key={`${item.customerId}-${item.blockId}`} size="sm">
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                  {item.customer.fullName?.charAt(0)?.toUpperCase() || "C"}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.customer.fullName}
                    </p>
                    {item.isDefault && <Badge>Default</Badge>}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" />
                      {item.customer.phoneNumber || "No phone"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {item.customer.town || "No town"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      Assigned {formatDate(item.assignedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-44 rounded-lg border bg-muted/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Measurement</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Ruler className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {item.measurement?.measurementNumber ||
                        (item.measurementId ? "Linked" : "Not linked")}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={linkingCustomerId === item.customerId}
                  onClick={() => onLinkLatestMeasurement(item.customerId)}
                >
                  {linkingCustomerId === item.customerId ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Link2 className="size-4" />
                  )}
                  {item.measurementId ? "Relink latest" : "Link latest"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MeasurementsTable({
  measurements,
  isLoading,
}: {
  measurements: Array<{
    id: string;
    measurementNumber: string | null;
    verificationStatus: string;
    isActive: boolean;
    versionNo: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    customer?: {
      fullName: string;
      phoneNumber: string | null;
      town: string | null;
    };
  }>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center border text-sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading measurements...
      </div>
    );
  }

  if (!measurements.length) {
    return <EmptyMessage message="No measurements are linked to this block." />;
  }

  return (
    <div className="overflow-hidden border">
      <Table className="w-full min-w-180 text-left text-sm">
        <TableHeader className="text-xs uppercase">
          <TableRow>
            <TableHead className="px-3 py-2 font-semibold">
              Measurement
            </TableHead>
            <TableHead className="px-3 py-2 font-semibold">Customer</TableHead>
            <TableHead className="px-3 py-2 font-semibold">Status</TableHead>
            <TableHead className="px-3 py-2 font-semibold">Version</TableHead>
            <TableHead className="px-3 py-2 font-semibold">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {measurements.map((measurement) => (
            <TableRow key={measurement.id}>
              <TableCell className="px-3 py-2.5">
                <p className="font-medium">
                  {measurement.measurementNumber || measurement.id}
                </p>
                {measurement.notes && (
                  <p className="mt-0.5 truncate text-xs">{measurement.notes}</p>
                )}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <p className="font-medium">
                  {measurement.customer?.fullName || "-"}
                </p>
                <p className="text-xs">
                  {measurement.customer?.phoneNumber || "-"}
                  {measurement.customer?.town
                    ? ` - ${measurement.customer.town}`
                    : ""}
                </p>
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <Badge variant="secondary">
                  {measurement.verificationStatus.replaceAll("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="px-3 py-2.5">
                V{measurement.versionNo}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                {formatDate(measurement.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function VersionHistoryTable({
  previousBlock,
  nextVersions,
}: {
  previousBlock: {
    id: string;
    blockNumber: string;
    versionNo: number;
  } | null;
  nextVersions: Array<{
    id: string;
    blockNumber: string;
    versionNo: number;
    createdAt: string;
  }>;
}) {
  const hasData = Boolean(previousBlock) || nextVersions.length > 0;

  if (!hasData) {
    return <EmptyMessage message="No version history available." />;
  }

  return (
    <div className="overflow-hidden border">
      <Table className="w-full min-w-130 text-left text-sm">
        <TableHeader className="text-xs uppercase">
          <TableRow>
            <TableHead className="px-3 py-2 font-semibold">Type</TableHead>
            <TableHead className="px-3 py-2 font-semibold">Block No</TableHead>
            <TableHead className="px-3 py-2 font-semibold">Version</TableHead>
            <TableHead className="px-3 py-2 font-semibold">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {previousBlock && (
            <TableRow>
              <TableCell className="px-3 py-2.5">Previous</TableCell>
              <TableCell className="px-3 py-2.5 font-medium">
                {previousBlock.blockNumber}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                V{previousBlock.versionNo}
              </TableCell>
              <TableCell className="px-3 py-2.5">-</TableCell>
            </TableRow>
          )}

          {nextVersions.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="px-3 py-2.5">Next</TableCell>
              <TableCell className="px-3 py-2.5 font-medium">
                {item.blockNumber}
              </TableCell>
              <TableCell className="px-3 py-2.5">V{item.versionNo}</TableCell>
              <TableCell className="px-3 py-2.5">
                {formatDate(item.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function OrderUsageTable({
  orderItems,
}: {
  orderItems: Array<{
    id: string;
    itemDescription: string | null;
    quantity: number;
    unitPrice: string | number | null;
    lineTotal: string | number | null;
    order?: {
      orderNumber: string;
      orderDate: string;
      status: string;
    };
  }>;
}) {
  if (!orderItems.length) {
    return (
      <EmptyMessage message="This block has not been used in any orders yet." />
    );
  }

  return (
    <div className="overflow-hidden border">
      <Table className="w-full min-w-190 text-left text-sm">
        <TableHeader className="text-xs uppercase">
          <TableRow>
            <TableHead className="px-3 py-2 font-semibold">Order</TableHead>
            <TableHead className="px-3 py-2 font-semibold">Item</TableHead>
            <TableHead className="px-3 py-2 font-semibold">Qty</TableHead>
            <TableHead className="px-3 py-2 font-semibold">
              Unit Price
            </TableHead>
            <TableHead className="px-3 py-2 font-semibold">
              Line Total
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {orderItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="px-3 py-2.5">
                <p className="font-medium">{item.order?.orderNumber || "-"}</p>
                <p className="text-xs">
                  {item.order?.orderDate
                    ? formatDate(item.order.orderDate)
                    : "-"}
                </p>
              </TableCell>
              <TableCell className="px-3 py-2.5">
                {item.itemDescription || "-"}
              </TableCell>
              <TableCell className="px-3 py-2.5">{item.quantity}</TableCell>
              <TableCell className="px-3 py-2.5">
                {formatCurrency(item.unitPrice)}
              </TableCell>
              <TableCell className="px-3 py-2.5 font-medium">
                {formatCurrency(item.lineTotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Blocks />
        </EmptyMedia>
        <EmptyTitle>Nothing to show</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
