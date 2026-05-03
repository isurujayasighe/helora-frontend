"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  TimerReset,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useGetGroupOrders } from "./api/useGetGroupOrders";
import { GroupOrdersTable } from "./components/group-orders-list";
import { CreateGroupOrderDialog } from "./components/create-group-order-sheet";
import type { GroupOrderStatus } from "./types/group-orders.types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

const GROUP_ORDER_STATUSES: Array<{
  value: GroupOrderStatus;
  label: string;
}> = [
  { value: "DRAFT", label: "Draft" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "READY", label: "Ready" },
  { value: "PARTIALLY_DELIVERED", label: "Partially Delivered" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

type GroupOrdersSearch = {
  create?: boolean;
};

export default function GroupOrdersPage() {
  const navigate = useNavigate();

  const routeSearch = useSearch({
    strict: false,
  }) as GroupOrdersSearch;

  const isCreateOpen = Boolean(routeSearch.create);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<GroupOrderStatus | "all">(
    "all"
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, fromDate, toDate]);

  const {
    data: groupOrdersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetGroupOrders({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const groupOrdersList = groupOrdersResponse?.data.items ?? [];

  const pagination = groupOrdersResponse?.data.pagination ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const stats = useMemo(() => {
    const draft = groupOrdersList.filter(
      (order) => order.status === "DRAFT"
    ).length;

    const inProgress = groupOrdersList.filter(
      (order) => order.status === "IN_PROGRESS"
    ).length;

    const ready = groupOrdersList.filter(
      (order) => order.status === "READY"
    ).length;

    const delivered = groupOrdersList.filter(
      (order) =>
        order.status === "DELIVERED" ||
        order.status === "PARTIALLY_DELIVERED"
    ).length;

    const overdue = groupOrdersList.filter((order: any) => {
      const deliveryDate =
        order.expectedDeliveryDate || order.promisedDate || order.deliveryDate;

      const completedStatuses = ["DELIVERED", "CANCELLED"];

      if (!deliveryDate || completedStatuses.includes(order.status)) {
        return false;
      }

      return new Date(deliveryDate) < new Date();
    }).length;

    return {
      total: pagination.totalItems,
      draft,
      inProgress,
      ready,
      delivered,
      overdue,
    };
  }, [groupOrdersList, pagination.totalItems]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleCreateGroupOrder = () => {
    navigate({
      to: "/app/group-orders",
      search: (previous) => ({
        ...previous,
        create: true,
      }),
    });
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    navigate({
      to: "/app/group-orders",
      search: (previous) => ({
        ...previous,
        create: open ? true : undefined,
      }),
      replace: true,
    });
  };

  const handleViewGroupOrder = (groupOrderId: string) => {
    navigate({
      to: "/app/group-orders/$groupOrderId",
      params: {
        groupOrderId,
      },
    });
  };

  const hasFilters = Boolean(
    debouncedSearch || statusFilter !== "all" || fromDate || toDate
  );

  return (
    <PermissionGate action="read" subject="group-orders">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-group-orders-page"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <UsersRound className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Group Orders
                  </h1>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Manage batch orders for hospitals, schools, nurses, and
                    uniform groups.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="h-9 rounded-lg bg-white font-bold"
                >
                  <RefreshCw
                    className={cn(
                      "mr-2 h-4 w-4",
                      isFetching && "animate-spin"
                    )}
                  />
                  Refresh
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg bg-white font-bold"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>

                <Button
                  type="button"
                  onClick={handleCreateGroupOrder}
                  className="h-9 rounded-lg font-bold shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group Order
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <GroupOrderStatCard
                title="Total Group Orders"
                value={stats.total}
                description="All matching group orders"
                icon={PackageCheck}
              />

              <GroupOrderStatCard
                title="In Progress"
                value={stats.inProgress}
                description="Currently being processed"
                icon={TimerReset}
              />

              <GroupOrderStatCard
                title="Ready"
                value={stats.ready}
                description="Ready for delivery or pickup"
                icon={CheckCircle2}
              />

              <GroupOrderStatCard
                title="Overdue"
                value={stats.overdue}
                description="Expected delivery date passed"
                icon={TriangleAlert}
                danger
              />
            </div>

            {/* Filters */}
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                  <div className="grid w-full gap-3 md:grid-cols-2 xl:max-w-5xl xl:grid-cols-[minmax(0,1.6fr)_180px_180px_180px]">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Search
                      </label>

                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                        <Input
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Search group no, hospital, title, contact..."
                          className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Status
                      </label>

                      <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                          setStatusFilter(value as GroupOrderStatus | "all")
                        }
                      >
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus:ring-0">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>

                          {GROUP_ORDER_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        From Date
                      </label>

                      <Input
                        type="date"
                        value={fromDate}
                        onChange={(event) => setFromDate(event.target.value)}
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        To Date
                      </label>

                      <Input
                        type="date"
                        value={toDate}
                        onChange={(event) => setToDate(event.target.value)}
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                    >
                      Page size: {PAGE_SIZE}
                    </Badge>

                    {debouncedSearch && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Search: {debouncedSearch}
                      </Badge>
                    )}

                    {statusFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Status: {formatGroupOrderStatus(statusFilter)}
                      </Badge>
                    )}

                    {fromDate && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        From: {fromDate}
                      </Badge>
                    )}

                    {toDate && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        To: {toDate}
                      </Badge>
                    )}

                    {hasFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClearFilters}
                        className="h-10 rounded-lg font-bold text-slate-500 hover:text-slate-900"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950">
                      Group Order List
                    </CardTitle>

                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      View group order batches, coordinators, delivery dates,
                      and current progress.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {pagination.totalItems} group orders
                  </Badge>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "min-h-0 flex-1 overflow-auto p-0",
                  isFetching && "opacity-70"
                )}
              >
                {isLoading ? (
                  <GroupOrdersLoadingState />
                ) : (
                  <GroupOrdersTable
                    groupOrders={groupOrdersList}
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalCount={pagination.totalItems}
                    onPageChange={setCurrentPage}
                    onViewGroupOrder={handleViewGroupOrder}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <CreateGroupOrderDialog
          open={isCreateOpen}
          onOpenChange={handleCreateDialogOpenChange}
        />
      </div>
    </PermissionGate>
  );
}

type GroupOrderStatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  danger?: boolean;
};

function GroupOrderStatCard({
  title,
  value,
  description,
  icon: Icon,
  danger,
}: GroupOrderStatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border-slate-200 bg-white shadow-sm",
        danger && "border-red-200"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">{title}</p>

            <p
              className={cn(
                "mt-2 text-2xl font-black tracking-tight text-slate-950",
                danger && "text-red-600"
              )}
            >
              {value}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              {description}
            </p>
          </div>

          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700",
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

function GroupOrdersLoadingState() {
  return (
    <div className="grid gap-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}

function formatGroupOrderStatus(status: string) {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    READY: "Ready",
    PARTIALLY_DELIVERED: "Partially Delivered",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return map[status] ?? status;
}