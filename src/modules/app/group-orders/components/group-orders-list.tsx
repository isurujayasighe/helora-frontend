import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Hospital,
  Phone,
  UsersRound,
} from "lucide-react";
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

const formatCurrency = (value?: string | number | null) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Group Order</th>
              <th className="px-4 py-3 font-semibold">Coordinator</th>
              <th className="px-4 py-3 font-semibold">Hospital</th>
              <th className="px-4 py-3 font-semibold">Expected Date</th>
              <th className="px-4 py-3 text-center font-semibold">Orders</th>
              <th className="px-4 py-3 text-center font-semibold">Qty</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-right font-semibold">Advance</th>
              <th className="px-4 py-3 text-right font-semibold">Balance</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
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

              const balanceAmount = Number(groupOrder.balanceAmount ?? 0);

              return (
                <tr
                  key={groupOrder.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onViewGroupOrder(groupOrder.id)}
                        className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                      >
                        {groupOrder.groupOrderNumber}
                      </button>

                      <p className="mt-0.5 max-w-[280px] truncate font-medium text-slate-900">
                        {groupOrder.title || "Untitled group order"}
                      </p>

                      {groupOrder.notes && (
                        <p className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500">
                          {groupOrder.notes}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="max-w-[180px] truncate font-medium text-slate-900">
                        {coordinatorName}
                      </p>

                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5" />
                        {coordinatorPhone}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="inline-flex max-w-[190px] items-center gap-1.5 truncate font-medium text-slate-800">
                        <Hospital className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {groupOrder.hospitalName || "-"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {groupOrder.deliveryTown ||
                          groupOrder.town ||
                          groupOrder.coordinatorCustomer?.town ||
                          "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(groupOrder.expectedDeliveryDate)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex min-w-9 justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {totalOrders}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex min-w-9 justify-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {groupOrder.totalQty ?? 0}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(groupOrder.totalAmount)}
                  </td>

                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatCurrency(groupOrder.advanceAmount)}
                  </td>

                  <td
                    className={cn(
                      "px-4 py-4 text-right font-semibold",
                      balanceAmount > 0 ? "text-amber-700" : "text-emerald-700"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                        balanceAmount > 0
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      {formatCurrency(groupOrder.balanceAmount)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        statusClassName(groupOrder.status)
                      )}
                    >
                      {readableStatus(groupOrder.status)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => onViewGroupOrder(groupOrder.id)}
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
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