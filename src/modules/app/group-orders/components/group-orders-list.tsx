import { CalendarDays, ChevronRight, Hospital, UsersRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GroupOrder, GroupOrderStatus } from "../types/group-orders.types";

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const statusClassName = (status: GroupOrderStatus) => {
  switch (status) {
    case "DRAFT":
      return "border-slate-200 bg-slate-50 text-slate-600";
    case "CONFIRMED":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "IN_PROGRESS":
      return "border-amber-100 bg-amber-50 text-amber-700";
    case "READY":
      return "border-violet-100 bg-violet-50 text-violet-700";
    case "PARTIALLY_DELIVERED":
      return "border-orange-100 bg-orange-50 text-orange-700";
    case "DELIVERED":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "border-red-100 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const readableStatus = (status: string) => status.replaceAll("_", " ");

type GroupOrdersTableProps = {
  groupOrders: GroupOrder[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewGroupOrder: (groupOrderId: string) => void;
};

export function GroupOrdersTable({
  groupOrders,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewGroupOrder,
}: GroupOrdersTableProps) {
  if (!groupOrders.length) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <UsersRound className="h-10 w-10 text-slate-400" />

        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No group orders found
        </h3>

        <p className="mt-1 max-w-md text-sm text-slate-500">
          Create a group order when one customer coordinates multiple nurse
          uniforms or batch orders.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-295">
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Order ID
              </TableHead>

              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Coordinator
              </TableHead>

              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Hospital
              </TableHead>

              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </TableHead>

              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Delivery Date
              </TableHead>

              <TableHead className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Orders
              </TableHead>

              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>

              <TableHead className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {groupOrders.map((groupOrder) => {
              const coordinatorName =
                groupOrder.coordinatorCustomer?.fullName ||
                groupOrder.contactName ||
                "-";

              const coordinatorPhone =
                groupOrder.contactPhone ||
                groupOrder.coordinatorCustomer?.phoneNumber ||
                "-";

              const totalOrders =
                groupOrder.totalOrders ?? groupOrder._count?.orders ?? 0;

              return (
                <TableRow
                  key={groupOrder.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/70"
                >
                  <TableCell className="px-4 py-4">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onViewGroupOrder(groupOrder.id)}
                        className="text-xs font-normal text-slate-700 hover:text-slate-800 hover:underline"
                      >
                        {groupOrder.groupOrderNumber}
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="max-w-45 truncate text-xs text-slate-900">
                        {coordinatorName}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="inline-flex max-w-47.5 items-center gap-1.5 truncate text-xs text-slate-800">
                        <Hospital className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {groupOrder.hospitalName || "-"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="max-w-45 truncate text-xs font-medium text-slate-900">
                        {coordinatorPhone}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 text-xs">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400 " />
                      {formatDate(groupOrder.expectedDeliveryDate)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-center">
                    <span className="inline-flex min-w-9 justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {totalOrders}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        statusClassName(groupOrder.status),
                      )}
                    >
                      {readableStatus(groupOrder.status)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewGroupOrder(groupOrder.id)}
                      className="h-8 w-8 rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
                      aria-label={`View group order ${groupOrder.groupOrderNumber}`}
                      title="View details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs">
        <p className="text-sm text-slate-500 text-xs">
          Showing page{" "}
          <span className="font-medium text-slate-900">{currentPage}</span> of{" "}
          <span className="font-medium text-slate-900">
            {Math.max(totalPages, 1)}
          </span>{" "}
          — <span className="font-medium text-slate-900">{totalCount}</span>{" "}
          group orders
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
