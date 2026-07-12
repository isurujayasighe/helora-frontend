"use client";

import { useMemo, useState, type ElementType } from "react";
import {
  CalendarClock,
  CalendarDays,
  Grid2x2,
  PackageCheck,
  Plus,
  Search,
  Shirt,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBlockDialog } from "@/modules/app/blocks/components/create-block-dialog";
import { useGetBlocks } from "@/modules/app/blocks/api/useGetBlocks";
import { CreateCustomerDialog } from "@/modules/app/customers/components/create-customer-dialog";
import { useGetCustomers } from "@/modules/app/customers/api/useGetCustomers";
import { useGetOrders } from "@/modules/app/orders/api/useGetOrders";

import { DashboardOrdersSheet } from "./components/dashboard-orders-sheet";
import { DashboardPageHeader } from "./components/dashboard-page-header";
import { DashboardQuickFindDialog } from "./components/dashboard-quick-find-dialog";
import { DashboardStatCard } from "./components/dashboard-stat-card";
import { OrderPipelineCard } from "./components/order-pipeline-card";
import { UpcomingPromisedOrders } from "./components/promissed-orders";
import { RecentOrdersTableCard } from "./components/recent-orders-table";
import { TodaysActivityCard } from "./components/todays-activity-card";
import { useDashboardOrderMetrics } from "./hooks/use-dashboard-order-metrics";
import type {
  DashboardActivityItem,
  DashboardPipelineStage,
  DashboardSearchScope,
  DashboardStatItem,
} from "./types";
import {
  formatCompactNumber,
  formatDateParam,
  formatOrderStatus,
  getOrderQuantity,
  getOrderTitle,
} from "./utils";

const DASHBOARD_RECENT_PAGE_SIZE = 5;
const DASHBOARD_UPCOMING_PAGE_SIZE = 3;
const DASHBOARD_SHEET_PAGE_SIZE = 10;

function getDefaultPagination(page: number, pageSize: number) {
  return {
    page,
    pageSize,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

function getPercent(value: number, total: number) {
  if (!total) return 0;

  return Math.min(100, Math.round((value / total) * 100));
}

export default function Dashboard() {
  const [quickSearch, setQuickSearch] = useState("");
  const [searchScope, setSearchScope] = useState<DashboardSearchScope>("all");
  const [overdueOrdersPage, setOverdueOrdersPage] = useState(1);
  const [pendingOrdersPage, setPendingOrdersPage] = useState(1);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isCreateBlockOpen, setIsCreateBlockOpen] = useState(false);
  const [isQuickFindOpen, setIsQuickFindOpen] = useState(false);
  const [isOverdueSheetOpen, setIsOverdueSheetOpen] = useState(false);
  const [isPendingSheetOpen, setIsPendingSheetOpen] = useState(false);

  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const todayParam = useMemo(() => formatDateParam(today), [today]);
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
    data: customersCountResponse,
    isLoading: isCustomersCountLoading,
    isFetching: isCustomersCountFetching,
    refetch: refetchCustomersCount,
  } = useGetCustomers({
    page: 1,
    pageSize: 1,
  });

  const {
    data: activeBlocksResponse,
    isLoading: isActiveBlocksLoading,
    isFetching: isActiveBlocksFetching,
    refetch: refetchActiveBlocksCount,
  } = useGetBlocks({
    page: 1,
    pageSize: 1,
    status: "ACTIVE",
    includeCounts: false,
    includeTotal: true,
  });

  const {
    data: upcomingOrdersResponse,
    isLoading: isUpcomingOrdersLoading,
    isFetching: isUpcomingOrdersFetching,
  } = useGetOrders({
    page: 1,
    pageSize: DASHBOARD_UPCOMING_PAGE_SIZE,
    promisedDateFrom: todayParam,
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
    page: 1,
    pageSize: DASHBOARD_RECENT_PAGE_SIZE,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const {
    data: overdueOrdersResponse,
    isLoading: isOverdueOrdersLoading,
    isFetching: isOverdueOrdersFetching,
  } = useGetOrders({
    page: overdueOrdersPage,
    pageSize: DASHBOARD_SHEET_PAGE_SIZE,
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
    pageSize: DASHBOARD_SHEET_PAGE_SIZE,
    activeOnly: true,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const orderMetrics = useDashboardOrderMetrics(todayParam);

  const customersCount =
    customersCountResponse?.data.pagination.totalItems ?? 0;
  const activeBlocksCount =
    activeBlocksResponse?.data.pagination.totalItems ?? 0;
  const recentOrdersPagination =
    recentOrdersResponse?.data.pagination ??
    getDefaultPagination(1, DASHBOARD_RECENT_PAGE_SIZE);
  const upcomingOrdersPagination =
    upcomingOrdersResponse?.data.pagination ??
    getDefaultPagination(1, DASHBOARD_UPCOMING_PAGE_SIZE);
  const overdueOrdersPagination =
    overdueOrdersResponse?.data.pagination ??
    getDefaultPagination(overdueOrdersPage, DASHBOARD_SHEET_PAGE_SIZE);
  const pendingOrdersPagination =
    pendingOrdersResponse?.data.pagination ??
    getDefaultPagination(pendingOrdersPage, DASHBOARD_SHEET_PAGE_SIZE);

  const allOrdersCount = recentOrdersPagination.totalItems;
  const pipelineCountTotal = Math.max(
    allOrdersCount,
    orderMetrics.draftOrders +
      orderMetrics.inProgressOrders +
      orderMetrics.readyOrders +
      orderMetrics.deliveredOrders,
  );

  const orderAttentionStats: DashboardStatItem[] = [
    {
      title: "Overdue Orders",
      value: isOverdueOrdersLoading
        ? "..."
        : formatCompactNumber(overdueOrdersPagination.totalItems),
      description: "Promised date already passed",
      badge: overdueOrdersPagination.totalItems > 0 ? "Urgent" : "Clear",
      icon: TriangleAlert,
      tone: "destructive",
      supportingText: "Needs delivery follow-up",
      onClick: () => setIsOverdueSheetOpen(true),
    },
    {
      title: "Pending Orders",
      value: isPendingOrdersLoading
        ? "..."
        : formatCompactNumber(pendingOrdersPagination.totalItems),
      description: "Waiting or in production",
      badge: pendingOrdersPagination.totalItems > 0 ? "Open" : "Clear",
      icon: CalendarClock,
      supportingText: "Tap to review active work",
      onClick: () => setIsPendingSheetOpen(true),
    },
    {
      title: "Promised Next 7 Days",
      value:
        isUpcomingOrdersLoading || isUpcomingOrdersFetching
          ? "..."
          : formatCompactNumber(upcomingOrdersPagination.totalItems),
      description: "Deliveries due soon",
      badge: upcomingOrdersPagination.totalItems > 0 ? "Upcoming" : "Clear",
      icon: CalendarDays,
      supportingText: "Plan finishing and handover",
      onClick: () => navigate({ to: "/app/orders" }),
    },
    {
      title: "Orders Created Today",
      value: orderMetrics.isLoading
        ? "..."
        : formatCompactNumber(orderMetrics.todayOrders),
      description: "New orders dated today",
      badge: orderMetrics.todayOrders > 0 ? "Today" : "None",
      icon: Shirt,
      tone: "primary",
      supportingText: "Daily order intake",
      onClick: () => navigate({ to: "/app/orders" }),
    },
  ];

  const pipelineStages: DashboardPipelineStage[] = [
    {
      label: "Draft",
      value: orderMetrics.draftOrders,
      percent: getPercent(orderMetrics.draftOrders, pipelineCountTotal),
    },
    {
      label: "In Progress",
      value: orderMetrics.inProgressOrders,
      percent: getPercent(orderMetrics.inProgressOrders, pipelineCountTotal),
      tone: "primary",
    },
    {
      label: "Ready",
      value: orderMetrics.readyOrders,
      percent: getPercent(orderMetrics.readyOrders, pipelineCountTotal),
      tone: "primary",
    },
    {
      label: "Delivered",
      value: orderMetrics.deliveredOrders,
      percent: getPercent(orderMetrics.deliveredOrders, pipelineCountTotal),
    },
  ];

  const activityItems: DashboardActivityItem[] = [
    {
      label: "Orders created",
      value: orderMetrics.isLoading
        ? "..."
        : formatCompactNumber(orderMetrics.todayOrders),
      description: "Dated today",
      icon: Shirt,
      tone: "primary",
    },
    {
      label: "Promised orders",
      value:
        isUpcomingOrdersLoading || isUpcomingOrdersFetching
          ? "..."
          : formatCompactNumber(upcomingOrdersPagination.totalItems),
      description: "Due next 7 days",
      icon: CalendarDays,
    },
    {
      label: "Open orders",
      value:
        isPendingOrdersLoading || isPendingOrdersFetching
          ? "..."
          : formatCompactNumber(pendingOrdersPagination.totalItems),
      description: "Waiting or in progress",
      icon: PackageCheck,
    },
  ];

  const upcomingOrders = (upcomingOrdersResponse?.data.items ?? [])
    .filter((order) => Boolean(order.promisedDate))
    .map((order) => ({
      id: order.id,
      title: getOrderTitle(order),
      customerName: order.customer?.fullName ?? "-",
      units: getOrderQuantity(order),
      orderNo: order.orderNumber,
      date: order.promisedDate ?? order.orderDate,
    }));

  const recentOrders = (recentOrdersResponse?.data.items ?? []).map(
    (order) => ({
      id: order.id,
      orderNo: order.orderNumber,
      customerName: order.customer?.fullName ?? "-",
      itemName: getOrderTitle(order),
      quantity: getOrderQuantity(order),
      promisedDate: order.promisedDate ?? order.orderDate,
      status: formatOrderStatus(order.status, order.promisedDate),
    }),
  );

  const overdueOrders = overdueOrdersResponse?.data.items ?? [];
  const pendingOrders = pendingOrdersResponse?.data.items ?? [];
  const isOverdueLoading = isOverdueOrdersLoading || isOverdueOrdersFetching;
  const isPendingLoading = isPendingOrdersLoading || isPendingOrdersFetching;
  const updatedAtLabel = `As of today, ${new Intl.DateTimeFormat("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(today)}`;

  function navigateToOrder(orderId: string) {
    navigate({
      to: "/app/orders",
      search: {
        viewOrderId: orderId,
      },
    });
  }

  function handleQuickSearchSubmit() {
    const query = quickSearch.trim().toLowerCase();

    if (!query && searchScope === "all") return;

    if (searchScope === "customers") {
      setIsQuickFindOpen(false);
      navigate({ to: "/app/customers" });
      return;
    }

    if (searchScope === "blocks") {
      setIsQuickFindOpen(false);
      navigate({ to: "/app/blocks" });
      return;
    }

    if (searchScope === "orders") {
      setIsQuickFindOpen(false);
      navigate({ to: "/app/orders" });
      return;
    }

    if (query.startsWith("ord") || query.startsWith("#ord")) {
      setIsQuickFindOpen(false);
      navigate({ to: "/app/orders" });
      return;
    }

    if (query.startsWith("blk") || query.includes("block")) {
      setIsQuickFindOpen(false);
      navigate({ to: "/app/blocks" });
      return;
    }

    setIsQuickFindOpen(false);
    navigate({ to: "/app/customers" });
  }

  return (
    <PermissionGate action="read" subject="dashboard">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Dashboard"
              description="Monitor today's orders, upcoming deliveries, and production workload."
              actions={
                <>
                  <PermissionGate action="create" subject="orders">
                    <Button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/app/create-order-page",
                          search: {
                            orderSource: "PHYSICAL_SHOP",
                          },
                        })
                      }
                    >
                      <Plus className="size-4" />
                      Create Order
                    </Button>
                  </PermissionGate>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsQuickFindOpen(true)}
                  >
                    <Search className="size-4" />
                    Quick Find
                  </Button>

                  <PermissionGate action="create" subject="customers">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateCustomerOpen(true)}
                    >
                      <Plus className="size-4" />
                      Add Customer
                    </Button>
                  </PermissionGate>

                  <PermissionGate action="create" subject="blocks">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateBlockOpen(true)}
                    >
                      <Plus className="size-4" />
                      Add Block
                    </Button>
                  </PermissionGate>
                </>
              }
            />

            <section className="space-y-3">
             
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {orderAttentionStats.map((stat) => (
                  <DashboardStatCard key={stat.title} {...stat} />
                ))}
              </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
              <div className="grid min-w-0 gap-4">
                <UpcomingPromisedOrders
                  orders={upcomingOrders}
                  isLoading={
                    isUpcomingOrdersLoading || isUpcomingOrdersFetching
                  }
                  onViewAll={() => navigate({ to: "/app/orders" })}
                  onSelectOrder={navigateToOrder}
                />

                <RecentOrdersTableCard
                  orders={recentOrders}
                  isLoading={isRecentOrdersLoading || isRecentOrdersFetching}
                  onViewAll={() => navigate({ to: "/app/orders" })}
                  onViewOrder={navigateToOrder}
                />
              </div>

              <div className="grid min-w-0 content-start gap-4">
                <OrderPipelineCard
                  stages={pipelineStages}
                  totalOrders={allOrdersCount}
                  isLoading={orderMetrics.isLoading || isRecentOrdersLoading}
                  onViewAll={() => navigate({ to: "/app/orders" })}
                />

                <TodaysActivityCard
                  items={activityItems}
                  updatedAtLabel={updatedAtLabel}
                  onViewAll={() => navigate({ to: "/app/orders" })}
                />

                <BusinessSummaryCard
                  customersCount={
                    isCustomersCountLoading
                      ? "..."
                      : formatCompactNumber(customersCount)
                  }
                  blocksCount={
                    isActiveBlocksLoading
                      ? "..."
                      : formatCompactNumber(activeBlocksCount)
                  }
                  isUpdating={
                    isCustomersCountFetching || isActiveBlocksFetching
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <CreateCustomerDialog
          open={isCreateCustomerOpen}
          onOpenChange={setIsCreateCustomerOpen}
          onCreated={() => {
            setIsCreateCustomerOpen(false);
            void refetchCustomersCount();
            void refetchActiveBlocksCount();
          }}
        />

        <CreateBlockDialog
          open={isCreateBlockOpen}
          onOpenChange={setIsCreateBlockOpen}
          onCreated={() => {
            setIsCreateBlockOpen(false);
            void refetchActiveBlocksCount();
          }}
        />

        <DashboardQuickFindDialog
          open={isQuickFindOpen}
          value={quickSearch}
          scope={searchScope}
          onOpenChange={setIsQuickFindOpen}
          onValueChange={setQuickSearch}
          onScopeChange={setSearchScope}
          onSubmit={handleQuickSearchSubmit}
        />

        <DashboardOrdersSheet
          open={isOverdueSheetOpen}
          onOpenChange={setIsOverdueSheetOpen}
          title="Overdue Orders"
          description="Orders with promised dates before today and not yet delivered."
          countLabel="overdue"
          emptyTitle="No overdue orders"
          emptyDescription="Promised deliveries are currently clear."
          emptyIcon={TriangleAlert}
          orders={overdueOrders}
          isLoading={isOverdueLoading}
          currentPage={overdueOrdersPagination.page}
          totalPages={overdueOrdersPagination.totalPages}
          totalItems={overdueOrdersPagination.totalItems}
          tone="destructive"
          onPageChange={setOverdueOrdersPage}
          onViewAll={() => {
            setIsOverdueSheetOpen(false);
            navigate({ to: "/app/orders" });
          }}
          onViewOrder={(orderId) => {
            setIsOverdueSheetOpen(false);
            navigateToOrder(orderId);
          }}
        />

        <DashboardOrdersSheet
          open={isPendingSheetOpen}
          onOpenChange={setIsPendingSheetOpen}
          title="Pending Orders"
          description="Active orders that are not delivered or cancelled yet."
          countLabel="open"
          emptyTitle="No pending orders"
          emptyDescription="All orders are currently completed or cancelled."
          emptyIcon={CalendarClock}
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
            navigateToOrder(orderId);
          }}
        />
      </div>
    </PermissionGate>
  );
}

function BusinessSummaryCard({
  customersCount,
  blocksCount,
  isUpdating,
}: {
  customersCount: string;
  blocksCount: string;
  isUpdating: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Setup Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <SummaryRow
          icon={Users}
          label="Total Customers"
          value={customersCount}
          description="Customer records available for orders"
        />

        <SummaryRow
          icon={Grid2x2}
          label="Active Blocks"
          value={blocksCount}
          description="Reusable tailoring blocks"
        />

        {isUpdating && (
          <p className="text-xs text-muted-foreground">Updating summary...</p>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: ElementType;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-background p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
