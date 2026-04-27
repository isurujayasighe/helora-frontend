"use client";

import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  PackagePlus,
  Phone,
  RefreshCcw,
  UsersRound,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useGetGroupOrderById } from "../api/useGetGroupOrderById";
import { AddOrderToGroupDialog } from "../components/add-order-to-group-order-dialog";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
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
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
};

export function GroupOrderDetailsPage() {
  const navigate = useNavigate();

  const { groupOrderId } = useParams({
    from: "/_authenticated/app/group-orders/$groupOrderId",
  });

  const search = useSearch({
    from: "/_authenticated/app/group-orders/$groupOrderId",
  });

  const isAddOrderOpen = search.addOrder === true;

  const { data, isLoading, isFetching, refetch } =
    useGetGroupOrderById(groupOrderId);

  const groupOrder = data?.data;

  const handleBack = () => {
    navigate({
      to: "/app/group-orders",
    });
  };

  const handleOpenAddOrder = () => {
    navigate({
      to: "/app/group-orders/$groupOrderId",
      params: {
        groupOrderId,
      },
      search: (previous) => ({
        ...previous,
        addOrder: true,
      }),
    });
  };

  const handleAddOrderOpenChange = (open: boolean) => {
    navigate({
      to: "/app/group-orders/$groupOrderId",
      params: {
        groupOrderId,
      },
      search: (previous) => ({
        ...previous,
        addOrder: open ? true : undefined,
      }),
      replace: true,
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!groupOrder) {
    return (
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-sm font-semibold text-slate-900">
            Group order not found
          </h2>

          <Button variant="outline" className="mt-4" onClick={handleBack}>
            Back to group orders
          </Button>
        </div>
      </div>
    );
  }

  const orders = groupOrder.orders ?? [];

  return (
    <PermissionGate action="read" subject="Orders">
      <AnimatePresence mode="wait">
        <motion.div
          key="group-order-details"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="mx-auto flex w-full flex-col gap-6 px-4 py-4 pb-10 sm:px-6 sm:py-6 lg:px-8 xl:px-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Button
                type="button"
                variant="ghost"
                className="-ml-2 mb-2 gap-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                <UsersRound className="h-3.5 w-3.5" />
                {groupOrder.groupOrderNumber}
              </div>

              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                {groupOrder.title || "Untitled group order"}
              </h1>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                <span>{groupOrder.hospitalName || "-"}</span>
                <span>{groupOrder.town || groupOrder.deliveryTown || "-"}</span>

                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {groupOrder.contactPhone ||
                    groupOrder.coordinatorCustomer?.phoneNumber ||
                    "-"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Expected {formatDate(groupOrder.expectedDeliveryDate)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCcw
                  className={cn("h-4 w-4", isFetching && "animate-spin")}
                />
                Refresh
              </Button>

              <Button
                type="button"
                className="gap-2"
                onClick={handleOpenAddOrder}
              >
                <PackagePlus className="h-4 w-4" />
                Add Order
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Orders" value={groupOrder.totalOrders ?? 0} />
            <StatCard label="Total Qty" value={groupOrder.totalQty ?? 0} />
            <StatCard
              label="Total Amount"
              value={formatCurrency(groupOrder.totalAmount)}
            />
            <StatCard
              label="Balance"
              value={formatCurrency(groupOrder.balanceAmount)}
              highlight={Number(groupOrder.balanceAmount ?? 0) > 0}
            />
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold text-slate-950">
                  Coordinator
                </h2>
                <p className="text-sm text-slate-600">
                  {groupOrder.coordinatorCustomer?.fullName ||
                    groupOrder.contactName ||
                    "-"}
                </p>
                <p className="text-xs text-slate-500">
                  {groupOrder.contactPhone ||
                    groupOrder.coordinatorCustomer?.phoneNumber ||
                    "-"}{" "}
                  · {groupOrder.coordinatorCustomer?.town || "-"}
                </p>
              </div>

              {groupOrder.deliveryAddress && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Delivery Address
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {groupOrder.deliveryAddress}
                  </p>
                </div>
              )}

              {groupOrder.notes && (
                <div className="mt-4 rounded-xl bg-blue-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Notes
                  </p>
                  <p className="mt-1 text-sm text-blue-800">
                    {groupOrder.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Orders in this group
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Customer orders linked to this batch.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="gap-2"
                  onClick={handleOpenAddOrder}
                >
                  <PackagePlus className="h-4 w-4" />
                  Add Order
                </Button>
              </div>

              <div className="mt-5">
                {orders.length > 0 ? (
                  <GroupOrderOrdersTable orders={orders} />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <CircleDollarSign className="mx-auto h-8 w-8 text-slate-400" />
                    <h3 className="mt-3 text-sm font-semibold text-slate-900">
                      No orders linked yet
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Add customer orders under this group to track delivery
                      together.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <AddOrderToGroupDialog
            open={isAddOrderOpen}
            onOpenChange={handleAddOrderOpenChange}
            groupOrder={{
              id: groupOrder.id,
              groupOrderNumber: groupOrder.groupOrderNumber,
              title: groupOrder.title,
              hospitalName: groupOrder.hospitalName,
              town: groupOrder.town,
              deliveryAddress: groupOrder.deliveryAddress,
              deliveryTown: groupOrder.deliveryTown,
              expectedDeliveryDate: groupOrder.expectedDeliveryDate,
            }}
            onCreated={() => refetch()}
          />
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  highlight?: boolean;
};

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-white p-5",
        highlight ? "border-amber-200" : "border-slate-200"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={cn(
          "mt-2 text-2xl font-semibold",
          highlight ? "text-amber-700" : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

type GroupOrderOrdersTableProps = {
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalQty: number;
    totalAmount: string | number;
    advanceAmount: string | number;
    balanceAmount: string | number;
    promisedDate: string | null;
    customer?: {
      fullName: string;
      phoneNumber: string | null;
    };
  }>;
};

function GroupOrderOrdersTable({ orders }: GroupOrderOrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 text-center font-semibold">Qty</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-right font-semibold">Advance</th>
              <th className="px-4 py-3 text-right font-semibold">Balance</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Promised</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-blue-700">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">
                    {order.customer?.fullName || "-"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.customer?.phoneNumber || "-"}
                  </p>
                </td>
                <td className="px-4 py-3 text-center">{order.totalQty}</td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(order.advanceAmount)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-amber-700">
                  {formatCurrency(order.balanceAmount)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {order.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {order.paymentStatus.replaceAll("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(order.promisedDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}