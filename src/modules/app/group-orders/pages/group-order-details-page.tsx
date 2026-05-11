"use client";

import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  PackagePlus,
  Phone,
  RefreshCcw,
  StickyNote,
  Truck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { EnterpriseLottieLoader } from "@/components/common/IntialLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useGetGroupOrderById } from "../api/useGetGroupOrderById";
import { AddOrderToGroupDialog } from "../components/add-order-to-group-order-dialog";
import { GroupOrderOrdersTable } from "../components/group-order-orders-table";

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

const getInitials = (value?: string | null) => {
  if (!value) return "?";

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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
    return <EnterpriseLottieLoader />;
  }

  if (!groupOrder) {
    return (
      <div className="min-h-screen bg-slate-50/60">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
          <Card className="rounded-lg border border-dashed border-slate-300 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <UsersRound className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-sm font-bold text-slate-900">
                Group order not found
              </h2>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                This batch may have been removed or you may not have access to
                view it.
              </p>

              <Button
                variant="outline"
                className="mt-4 rounded-lg"
                onClick={handleBack}
              >
                Back to group orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const orders = groupOrder.orders ?? [];

  const coordinatorName =
    groupOrder.coordinatorCustomer?.fullName || groupOrder.contactName || "-";

  const coordinatorPhone =
    groupOrder.contactPhone ||
    groupOrder.coordinatorCustomer?.phoneNumber ||
    "-";

  const deliveryTown =
    groupOrder.deliveryTown || groupOrder.town || groupOrder.coordinatorCustomer?.town || "-";

  return (
    <PermissionGate action="read" subject="group-orders">
      <div className="min-h-screen bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="group-order-details"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mx-auto flex w-full flex-col gap-5 px-4 py-4 pb-10 sm:px-6 lg:px-8 xl:px-10"
          >
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    className="-ml-2 mb-3 h-9 rounded-lg px-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to group orders
                  </Button>

                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                      <UsersRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                          {groupOrder.title || "Untitled group order"}
                        </h1>

                        <Badge
                          variant="outline"
                          className="rounded-lg border-blue-200 bg-blue-50 text-blue-700"
                        >
                          {groupOrder.groupOrderNumber}
                        </Badge>

                        {groupOrder.status && (
                          <Badge className="rounded-lg bg-slate-900 text-white hover:bg-slate-900">
                            {groupOrder.status.replaceAll("_", " ")}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5" />
                          {groupOrder.hospitalName || "No hospital"}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {deliveryTown}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {coordinatorPhone}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Expected {formatDate(groupOrder.expectedDeliveryDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg border-slate-200 bg-white"
                    onClick={() => refetch()}
                    disabled={isFetching}
                  >
                    <RefreshCcw
                      className={cn(
                        "mr-2 h-4 w-4",
                        isFetching && "animate-spin",
                      )}
                    />
                    Refresh
                  </Button>

                  <Button
                    type="button"
                    className="rounded-lg bg-slate-900"
                    onClick={handleOpenAddOrder}
                  >
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Add Order
                  </Button>
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={UsersRound}
                label="Total Orders"
                value={groupOrder.totalOrders ?? orders.length}
              />

              <StatCard
                icon={PackagePlus}
                label="Total Qty"
                value={groupOrder.totalQty ?? 0}
              />

              <StatCard
                icon={CircleDollarSign}
                label="Total Amount"
                value={formatCurrency(groupOrder.totalAmount)}
              />

              <StatCard
                icon={Banknote}
                label="Balance"
                value={formatCurrency(groupOrder.balanceAmount)}
                highlight={Number(groupOrder.balanceAmount ?? 0) > 0}
              />
            </section>

            <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Batch Details
                    </h2>
                    <p className="text-xs text-slate-500">
                      Coordinator, contact and delivery information.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <InfoTile
                    icon={UserRound}
                    label="Coordinator"
                    value={coordinatorName}
                    avatarText={getInitials(coordinatorName)}
                  />

                  <InfoTile
                    icon={Phone}
                    label="Phone"
                    value={coordinatorPhone}
                  />

                  <InfoTile
                    icon={MapPin}
                    label="Town"
                    value={deliveryTown}
                  />

                  <InfoTile
                    icon={CalendarDays}
                    label="Expected Delivery"
                    value={formatDate(groupOrder.expectedDeliveryDate)}
                  />
                </div>

                {(groupOrder.deliveryAddress || groupOrder.notes) && (
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    {groupOrder.deliveryAddress && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                        <div className="flex gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Delivery Address
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {groupOrder.deliveryAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {groupOrder.notes && (
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <div className="flex gap-2">
                          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                              Batch Note
                            </p>
                            <p className="mt-1 text-sm font-semibold text-blue-700">
                              {groupOrder.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Orders in this Batch
                    </h2>
                    <p className="text-xs text-slate-500">
                      Customer orders linked to this group order for shared
                      delivery.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="rounded-lg bg-slate-900"
                    onClick={handleOpenAddOrder}
                  >
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Add Order
                  </Button>
                </div>

                <div className="p-4">
                  {orders.length > 0 ? (
                    <GroupOrderOrdersTable orders={orders} />
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                        <PackagePlus className="h-6 w-6" />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-900">
                        No orders linked yet
                      </h3>

                      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                        Add customer orders under this batch to track quantity,
                        delivery and payment together.
                      </p>

                      <Button
                        type="button"
                        className="mt-4 rounded-lg bg-slate-900"
                        onClick={handleOpenAddOrder}
                      >
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Add First Order
                      </Button>
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
      </div>
    </PermissionGate>
  );
}

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  highlight?: boolean;
};

function StatCard({ icon: Icon, label, value, highlight }: StatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border bg-white shadow-sm",
        highlight ? "border-amber-200 bg-amber-50/60" : "border-slate-200",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </p>

            <p
              className={cn(
                "mt-2 text-2xl font-bold leading-none",
                highlight ? "text-amber-700" : "text-slate-900",
              )}
            >
              {value}
            </p>
          </div>

          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              highlight
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type InfoTileProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  avatarText?: string;
};

function InfoTile({ icon: Icon, label, value, avatarText }: InfoTileProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        {avatarText ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            {avatarText}
          </div>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}