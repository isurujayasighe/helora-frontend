"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Grid2x2,
  Loader2,
  Plus,
  Shirt,
  TriangleAlert,
  Users,
} from "lucide-react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { cn } from "@/lib/utils";
import { UpcomingPromisedOrders } from "./components/promissed-orders";
import { RecentOrdersTableCard } from "./components/recent-orders-table";
import { Button } from "@/components/ui/button";
import { CreateOrderDialog } from "@/components/layout/create-order-dialog";
import { useNavigate } from "@tanstack/react-router";
import { DashboardCustomerSearchCard } from "./components/dashboard-customer-search";
import { DashboardBlockLookupCard } from "./components/dashboard-block-lookup";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetOrders } from "@/modules/app/orders/api/useGetOrders";
import type { Order } from "@/types/orders";

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: string | number) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getOrderQuantity(order: Order) {
  if (typeof order.totalQty === "number") return order.totalQty;

  return order.items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
}

function getOrderTitle(order: Order) {
  const firstItem = order.items[0];

  return (
    firstItem?.itemDescription ||
    firstItem?.category?.name ||
    order.customer?.fullName ||
    order.orderNumber
  );
}

function formatOrderStatus(status: string, promisedDate?: string | null) {
  const isOverdue =
    promisedDate &&
    !["DELIVERED", "CANCELLED"].includes(status) &&
    new Date(promisedDate).getTime() < new Date().setHours(0, 0, 0, 0);

  if (isOverdue) return "Overdue";

  const labels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CUTTING: "Cutting",
    SEWING: "Sewing",
    READY: "Ready",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return labels[status] ?? status;
}

export default function Dashboard() {
  const [recentOrdersPage, setRecentOrdersPage] = useState(1);
  const [overdueOrdersPage, setOverdueOrdersPage] = useState(1);
  const [pendingOrdersPage, setPendingOrdersPage] = useState(1);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isOverdueSheetOpen, setIsOverdueSheetOpen] = useState(false);
  const [isPendingSheetOpen, setIsPendingSheetOpen] = useState(false);

  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const sevenDaysFromToday = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 7);
    return date;
  }, [today]);
  const yesterday = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    return date;
  }, [today]);

  const {
    data: upcomingOrdersResponse,
    isLoading: isUpcomingOrdersLoading,
    isFetching: isUpcomingOrdersFetching,
  } = useGetOrders({
    page: 1,
    pageSize: 7,
    promisedDateFrom: formatDateParam(today),
    promisedDateTo: formatDateParam(sevenDaysFromToday),
    activeOnly: true,
    sortBy: "promisedDate",
    sortDirection: "asc",
  });

  const {
    data: recentOrdersResponse,
    isLoading: isRecentOrdersLoading,
    isFetching: isRecentOrdersFetching,
  } = useGetOrders({
    page: recentOrdersPage,
    pageSize: 5,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const {
    data: overdueOrdersResponse,
    isLoading: isOverdueOrdersLoading,
    isFetching: isOverdueOrdersFetching,
  } = useGetOrders({
    page: overdueOrdersPage,
    pageSize: 10,
    promisedDateTo: formatDateParam(yesterday),
    activeOnly: true,
    sortBy: "promisedDate",
    sortDirection: "asc",
  });

  const {
    data: pendingOrdersResponse,
    isLoading: isPendingOrdersLoading,
    isFetching: isPendingOrdersFetching,
  } = useGetOrders({
    page: pendingOrdersPage,
    pageSize: 10,
    activeOnly: true,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const upcomingOrders = useMemo(
    () =>
      (upcomingOrdersResponse?.data.items ?? [])
        .filter((order) => Boolean(order.promisedDate))
        .map((order) => ({
          id: order.id,
          title: getOrderTitle(order),
          units: getOrderQuantity(order),
          orderNo: order.orderNumber,
          date: order.promisedDate ?? order.orderDate,
        })),
    [upcomingOrdersResponse],
  );

  const recentOrders = useMemo(
    () =>
      (recentOrdersResponse?.data.items ?? []).map((order) => ({
        id: order.id,
        orderNo: order.orderNumber,
        customerName: order.customer?.fullName ?? "-",
        itemName: getOrderTitle(order),
        quantity: getOrderQuantity(order),
        promisedDate: order.promisedDate ?? order.orderDate,
        status: formatOrderStatus(order.status, order.promisedDate),
      })),
    [recentOrdersResponse],
  );

  const recentOrdersPagination = recentOrdersResponse?.data.pagination ?? {
    page: recentOrdersPage,
    pageSize: 5,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const overdueOrders = overdueOrdersResponse?.data.items ?? [];
  const overdueOrdersPagination = overdueOrdersResponse?.data.pagination ?? {
    page: overdueOrdersPage,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const isOverdueLoading = isOverdueOrdersLoading || isOverdueOrdersFetching;

  const pendingOrders = pendingOrdersResponse?.data.items ?? [];
  const pendingOrdersPagination = pendingOrdersResponse?.data.pagination ?? {
    page: pendingOrdersPage,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const isPendingLoading = isPendingOrdersLoading || isPendingOrdersFetching;

  const dashboardStats = useMemo(
    () => [
      {
        title: "Total Customers",
        value: "1,284",
        description: "Customers saved in Helora",
        badge: "+12%",
        icon: Users,
      },
      {
        title: "Active Blocks",
        value: "42",
        description: "Reusable tailoring blocks",
        badge: "Stable",
        icon: Grid2x2,
      },
      {
        title: "Pending Orders",
        value: isPendingOrdersLoading
          ? "..."
          : pendingOrdersPagination.totalItems.toString(),
        description: "Orders waiting or in progress",
        badge: pendingOrdersPagination.totalItems > 0 ? "Open" : "Clear",
        icon: CalendarClock,
        onClick: () => setIsPendingSheetOpen(true),
      },
      {
        title: "Overdue Orders",
        value: isOverdueOrdersLoading
          ? "..."
          : overdueOrdersPagination.totalItems.toString(),
        description: "Promised date already passed",
        badge: overdueOrdersPagination.totalItems > 0 ? "Urgent" : "Clear",
        icon: TriangleAlert,
        danger: true,
        onClick: () => setIsOverdueSheetOpen(true),
      },
    ],
    [
      isOverdueOrdersLoading,
      isPendingOrdersLoading,
      overdueOrdersPagination.totalItems,
      pendingOrdersPagination.totalItems,
    ]
  );

  return (
    <PermissionGate action="read" subject="dashboard">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
          <div className={cn("flex h-full flex-col gap-4 p-4 md:p-5 xl:p-6")}>
            <div className="flex flex-col gap-4 border-b border-border/80 pb-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/10 bg-primary/10 text-primary">
                  <Shirt className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-slate-950 md:text-2xl">
                    Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Track customers, orders, production blocks, and promised deliveries.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  className="h-9 bg-white"
                  onClick={() => navigate({ to: "/app/customers" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>

                <Button
                  className="h-9 rounded-md"
                  onClick={() => setIsCreateOrderOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Order
                </Button>

                <Button
                  variant="outline"
                  className="h-9 bg-white"
                  onClick={() => navigate({ to: "/app/blocks" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Block
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardStats.map((stat) => (
                <DashboardStatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  badge={stat.badge}
                  icon={stat.icon}
                  danger={stat.danger}
                  onClick={stat.onClick}
                />
              ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              <DashboardCustomerSearchCard />
              <DashboardBlockLookupCard />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
              <UpcomingPromisedOrders
                orders={upcomingOrders}
                isLoading={isUpcomingOrdersLoading || isUpcomingOrdersFetching}
              />

              <RecentOrdersTableCard
                orders={recentOrders}
                currentPage={recentOrdersPagination.page}
                totalPages={recentOrdersPagination.totalPages}
                isLoading={isRecentOrdersLoading || isRecentOrdersFetching}
                onPageChange={setRecentOrdersPage}
              />
            </div>
          </div>

        <CreateOrderDialog
          open={isCreateOrderOpen}
          onOpenChange={setIsCreateOrderOpen}
          onSubmit={async (payload) => {
            console.log("Create order payload", payload);
            // await createOrderMutation.mutateAsync(payload);
          }}
        />

        <OverdueOrdersSheet
          open={isOverdueSheetOpen}
          onOpenChange={setIsOverdueSheetOpen}
          orders={overdueOrders}
          isLoading={isOverdueLoading}
          currentPage={overdueOrdersPagination.page}
          totalPages={overdueOrdersPagination.totalPages}
          totalItems={overdueOrdersPagination.totalItems}
          onPageChange={setOverdueOrdersPage}
          onViewAll={() => {
            setIsOverdueSheetOpen(false);
            navigate({ to: "/app/orders" });
          }}
          onViewOrder={(orderId) => {
            setIsOverdueSheetOpen(false);
            navigate({
              to: "/app/orders",
              search: {
                viewOrderId: orderId,
              },
            });
          }}
        />

        <PendingOrdersSheet
          open={isPendingSheetOpen}
          onOpenChange={setIsPendingSheetOpen}
          orders={pendingOrders}
          isLoading={isPendingLoading}
          currentPage={pendingOrdersPagination.page}
          totalPages={pendingOrdersPagination.totalPages}
          totalItems={pendingOrdersPagination.totalItems}
          onPageChange={setPendingOrdersPage}
          onViewAll={() => {
            setIsPendingSheetOpen(false);
            navigate({ to: "/app/orders" });
          }}
          onViewOrder={(orderId) => {
            setIsPendingSheetOpen(false);
            navigate({
              to: "/app/orders",
              search: {
                viewOrderId: orderId,
              },
            });
          }}
        />
      </div>
    </PermissionGate>
  );
}

function DashboardStatCard({
  title,
  value,
  description,
  badge,
  icon: Icon,
  danger,
  onClick,
}: {
  title: string;
  value: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "rounded-md border-border/90 bg-white shadow-sm transition-colors",
        onClick && !danger && "cursor-pointer hover:border-primary/25 hover:bg-[#f8fbff]",
        onClick && danger && "cursor-pointer hover:border-red-200 hover:bg-red-50/30",
        danger && "border-red-200"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-normal text-slate-500">{title}</p>

              <Badge
                variant="secondary"
                className={cn(
                  "px-2 py-0.5 text-xs font-semibold",
                  danger
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {badge}
              </Badge>
            </div>

            <p
              className={cn(
                "mt-2 text-2xl font-semibold text-slate-950",
                danger && "text-red-600"
              )}
            >
              {value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>

          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700",
              danger && "bg-red-50 text-red-600"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverdueOrdersSheet({
  open,
  onOpenChange,
  orders,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewAll,
  onViewOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewAll: () => void;
  onViewOrder: (orderId: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              <SheetTitle className="text-lg font-semibold text-slate-950">
                Overdue Orders
              </SheetTitle>
              <SheetDescription>
                Orders with promised dates before today and not yet delivered.
              </SheetDescription>
            </div>

            <Badge
              variant="outline"
              className="rounded-full border-red-200 bg-red-50 text-red-700"
            >
              {totalItems} overdue
            </Badge>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading overdue orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
              <TriangleAlert className="h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-800">
                No overdue orders
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Promised deliveries are currently clear.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">
                          #{order.orderNumber}
                        </p>
                        <Badge className="rounded-full bg-red-50 text-red-700 hover:bg-red-50">
                          {formatOrderStatus(order.status, order.promisedDate)}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {order.customer?.fullName ?? "-"}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {getOrderTitle(order)}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-semibold text-slate-950">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs text-red-600">
                        Promised {formatDisplayDate(order.promisedDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:grid-cols-3">
                    <div>
                      <span className="font-medium text-slate-700">Qty:</span>{" "}
                      {getOrderQuantity(order)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Order date:
                      </span>{" "}
                      {formatDisplayDate(order.orderDate)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Balance:
                      </span>{" "}
                      {formatCurrency(order.balanceAmount)}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewOrder(order.id)}
                      className="rounded-lg"
                    >
                      View details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              className="rounded-lg"
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              className="rounded-lg"
            >
              Next
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onViewAll}
              className="rounded-lg"
            >
              View all
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PendingOrdersSheet({
  open,
  onOpenChange,
  orders,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewAll,
  onViewOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewAll: () => void;
  onViewOrder: (orderId: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              <SheetTitle className="text-lg font-semibold text-slate-950">
                Pending Orders
              </SheetTitle>
              <SheetDescription>
                Active orders that are not delivered or cancelled yet.
              </SheetDescription>
            </div>

            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 text-blue-700"
            >
              {totalItems} open
            </Badge>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading pending orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
              <CalendarClock className="h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-800">
                No pending orders
              </p>
              <p className="mt-1 text-xs text-slate-500">
                All orders are currently completed or cancelled.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">
                          #{order.orderNumber}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full",
                            order.status === "PENDING"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-blue-200 bg-blue-50 text-blue-700",
                          )}
                        >
                          {formatOrderStatus(order.status, order.promisedDate)}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {order.customer?.fullName ?? "-"}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {getOrderTitle(order)}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-semibold text-slate-950">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Promised {formatDisplayDate(order.promisedDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:grid-cols-3">
                    <div>
                      <span className="font-medium text-slate-700">Qty:</span>{" "}
                      {getOrderQuantity(order)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Order date:
                      </span>{" "}
                      {formatDisplayDate(order.orderDate)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Balance:
                      </span>{" "}
                      {formatCurrency(order.balanceAmount)}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewOrder(order.id)}
                      className="rounded-lg"
                    >
                      View details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              className="rounded-lg"
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              className="rounded-lg"
            >
              Next
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onViewAll}
              className="rounded-lg"
            >
              View all
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
