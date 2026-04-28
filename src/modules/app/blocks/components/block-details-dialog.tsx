"use client";

import {
  Blocks,
  History,
  PackageCheck,
  UserRound,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useGetBlockById } from "../api/useGetBlockById";

type BlockDetailsDialogProps = {
  blockId: string | null;
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

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

const statusClassName = (status?: string) => {
  switch (status) {
    case "ACTIVE":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "INACTIVE":
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    case "ARCHIVED":
    case "CANCELLED":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
};

export function BlockDetailsDialog({
  blockId,
  open,
  onOpenChange,
}: BlockDetailsDialogProps) {
  const { data, isLoading, isFetching } = useGetBlockById(blockId, open);
  const block = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-3xl overflow-hidden p-0 gap-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
                <Blocks className="h-3.5 w-3.5" />
              </span>
              Block Details
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-56px)] overflow-y-auto bg-slate-50">
          {isLoading ? (
            <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">
              Loading block details...
            </div>
          ) : !block ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <Blocks className="h-9 w-9 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-900">
                Block details not found
              </p>
            </div>
          ) : (
            <div className={cn(isFetching && "opacity-70")}>
              <section className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h2 className="text-lg font-semibold tracking-tight text-blue-700">
                        {block.blockNumber}
                      </h2>

                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1",
                          statusClassName(block.status),
                        )}
                      >
                        {block.status}
                      </span>

                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                        {block.category?.name || "Block"}
                      </span>
                    </div>

                    <p className="mt-0.5 max-w-2xl truncate text-xs text-slate-500">
                      {block.sizeLabel ||
                        block.description ||
                        "Tailoring block measurement profile"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 border-b border-slate-200 bg-white px-5 py-4 lg:grid-cols-2">
                <InfoGroup title="Core Attributes">
                  <AttributeGrid>
                    <Attribute
                      label="Category"
                      value={block.category?.name || "-"}
                    />
                    <Attribute
                      label="Size / Spec"
                      value={block.readyMadeSize || "-"}
                    />
                    <Attribute label="Version" value={`V${block.versionNo}`} />
                    <Attribute
                      label="Size Label"
                      value={block.sizeLabel || "-"}
                    />
                  </AttributeGrid>
                </InfoGroup>

                <InfoGroup title="Lifecycle Data">
                  <AttributeGrid>
                    <Attribute
                      label="Created On"
                      value={formatDate(block.createdAt)}
                    />
                    <Attribute
                      label="Last Modified"
                      value={formatDate(block.updatedAt)}
                    />
                    <Attribute
                      label="Last Used"
                      value={formatDateTime(block.lastUsedAt)}
                    />
                    <Attribute
                      label="Lifetime Usage"
                      value={`${block._count?.orderItems ?? 0} order item(s)`}
                    />
                  </AttributeGrid>
                </InfoGroup>
              </section>

              <section className="space-y-3 bg-white px-2 py-4">
                <TextPanel
                  title="Description"
                  value={block.description || "No description added."}
                />

               
              </section>

              <section className="border-t border-slate-200 bg-white px-5 pb-5">
                <Tabs defaultValue="customers" className="w-full">
                  <TabsList className="h-10 justify-start gap-3 rounded-none border-b border-slate-200 bg-transparent p-0">
                    <TabsTrigger
                      value="customers"
                      className="h-10 rounded-none border-b-2 border-transparent px-0 text-xs font-semibold data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                    >
                      <UserRound className="mr-1.5 h-3.5 w-3.5" />
                      Assigned Customers
                    </TabsTrigger>

                    <TabsTrigger
                      value="versions"
                      className="h-10 rounded-none border-b-2 border-transparent px-0 text-xs font-semibold data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                    >
                      <History className="mr-1.5 h-3.5 w-3.5" />
                      Version History
                    </TabsTrigger>

                    <TabsTrigger
                      value="orders"
                      className="h-10 rounded-none border-b-2 border-transparent px-0 text-xs font-semibold data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
                    >
                      <PackageCheck className="mr-1.5 h-3.5 w-3.5" />
                      Order History
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="customers" className="mt-4">
                    <AssignedCustomersTable
                      customerBlocks={block.customerBlocks ?? []}
                    />
                  </TabsContent>

                  <TabsContent value="versions" className="mt-4">
                    <VersionHistoryTable
                      previousBlock={block.previousBlock}
                      nextVersions={block.nextVersions ?? []}
                    />
                  </TabsContent>

                  <TabsContent value="orders" className="mt-4">
                    <OrderUsageTable orderItems={block.orderItems ?? []} />
                  </TabsContent>
                </Tabs>
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


function InfoGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
          {title}
        </p>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      {children}
    </div>
  );
}

function AttributeGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>;
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function TextPanel({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function AssignedCustomersTable({
  customerBlocks,
}: {
  customerBlocks: Array<{
    customerId: string;
    blockId: string;
    isDefault: boolean;
    assignedAt: string;
    customer: {
      fullName: string;
      phoneNumber: string | null;
      town: string | null;
    };
  }>;
}) {
  if (!customerBlocks.length) {
    return <EmptyMessage message="No customers assigned to this block." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full min-w-160 text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Customer</th>
            <th className="px-3 py-2 font-semibold">Phone</th>
            <th className="px-3 py-2 font-semibold">Town</th>
            <th className="px-3 py-2 font-semibold">Assigned</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {customerBlocks.map((item) => (
            <tr key={`${item.customerId}-${item.blockId}`}>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">
                    {item.customer.fullName}
                  </span>

                  {item.isDefault && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      Default
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2.5 text-slate-700">
                {item.customer.phoneNumber || "-"}
              </td>
              <td className="px-3 py-2.5 text-slate-700">
                {item.customer.town || "-"}
              </td>
              <td className="px-3 py-2.5 text-slate-700">
                {formatDate(item.assignedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full min-w-130 text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Block No</th>
            <th className="px-3 py-2 font-semibold">Version</th>
            <th className="px-3 py-2 font-semibold">Created</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {previousBlock && (
            <tr>
              <td className="px-3 py-2.5 text-slate-700">Previous</td>
              <td className="px-3 py-2.5 font-medium text-slate-900">
                {previousBlock.blockNumber}
              </td>
              <td className="px-3 py-2.5 text-slate-700">
                V{previousBlock.versionNo}
              </td>
              <td className="px-3 py-2.5 text-slate-700">-</td>
            </tr>
          )}

          {nextVersions.map((item) => (
            <tr key={item.id}>
              <td className="px-3 py-2.5 text-slate-700">Next</td>
              <td className="px-3 py-2.5 font-medium text-slate-900">
                {item.blockNumber}
              </td>
              <td className="px-3 py-2.5 text-slate-700">V{item.versionNo}</td>
              <td className="px-3 py-2.5 text-slate-700">
                {formatDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full min-w-190 text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Order</th>
            <th className="px-3 py-2 font-semibold">Item</th>
            <th className="px-3 py-2 font-semibold">Qty</th>
            <th className="px-3 py-2 font-semibold">Unit Price</th>
            <th className="px-3 py-2 font-semibold">Line Total</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {orderItems.map((item) => (
            <tr key={item.id}>
              <td className="px-3 py-2.5">
                <p className="font-medium text-slate-900">
                  {item.order?.orderNumber || "-"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {item.order?.orderDate
                    ? formatDate(item.order.orderDate)
                    : "-"}
                </p>
              </td>
              <td className="px-3 py-2.5 text-slate-700">
                {item.itemDescription || "-"}
              </td>
              <td className="px-3 py-2.5 text-slate-700">{item.quantity}</td>
              <td className="px-3 py-2.5 text-slate-700">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="px-3 py-2.5 font-medium text-slate-900">
                {formatCurrency(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
