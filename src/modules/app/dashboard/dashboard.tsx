"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Grid2x2,
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
import { useGetOrders } from "@/modules/app/orders/api/useGetOrders";
import type { Order } from "@/types/orders";

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const sevenDaysFromToday = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 7);
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
        value: "156",
        description: "Orders waiting or in progress",
        badge: "8 New",
        icon: CalendarClock,
      },
      {
        title: "Overdue Orders",
        value: "23",
        description: "Promised date already passed",
        badge: "Urgent",
        icon: TriangleAlert,
        danger: true,
      },
    ],
    []
  );

  return (
    <PermissionGate action="read" subject="dashboard">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
          <div className={cn("flex h-full flex-col gap-4 p-4 md:p-5")}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                  <Shirt className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
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
                  className="h-10 rounded-lg bg-white"
                  onClick={() => navigate({ to: "/app/customers" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>

                <Button
                  className="h-10 rounded-md"
                  onClick={() => setIsCreateOrderOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Order
                </Button>

                <Button
                  variant="outline"
                  className="h-10 rounded-lg bg-white"
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
}: {
  title: string;
  value: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  danger?: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-md border-border bg-white",
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
                "mt-2 text-2xl font-semibold tracking-tight text-slate-950",
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
