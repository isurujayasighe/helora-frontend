"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Download,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Shirt,
  TimerReset,
  TriangleAlert,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useGetOrders } from "./api/useGetOrders";
import { OrdersTable } from "./components/order-details-table";
import { OrderDetailsDialog } from "@/components/layout/order-details-dialog";
import { CreateOrderDialog } from "@/components/layout/create-order-dialog";
import type { Order } from "@/types/orders";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

const orderStatusOptions = [
  { value: "all", label: "All status" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrdersPage() {
  const navigate = useNavigate({ from: "/app/orders/" });

  const orderSearch = useSearch({
    from: "/_authenticated/app/orders/",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderDate, setOrderDate] = useState("");
  const [promisedDate, setPromisedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isCreateOpen = Boolean(orderSearch.addOrder);

  const createOrderPrefill = useMemo(
    () => ({
      customerId: orderSearch.customerId,
      measurementId: orderSearch.measurementId,
      blockId: orderSearch.blockId,
      categoryId: orderSearch.categoryId,
    }),
    [
      orderSearch.customerId,
      orderSearch.measurementId,
      orderSearch.blockId,
      orderSearch.categoryId,
    ]
  );

  const hasCreateOrderPrefill = Boolean(
    createOrderPrefill.customerId ||
      createOrderPrefill.measurementId ||
      createOrderPrefill.blockId ||
      createOrderPrefill.categoryId
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, orderDate, promisedDate]);

  const {
    data: ordersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrders({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    orderDate: orderDate || undefined,
    promisedDate: promisedDate || undefined,
  });

  const ordersList = ordersResponse?.data.items ?? [];

  const pagination = ordersResponse?.data.pagination ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const stats = useMemo(() => {
    const pending = ordersList.filter((order) => order.status === "PENDING").length;

    const inProgress = ordersList.filter(
      (order) => order.status === "IN_PROGRESS"
    ).length;

    const completed = ordersList.filter(
      (order) => order.status === "COMPLETED"
    ).length;

    const overdue = ordersList.filter((order: any) => {
      const promised = order.promisedDate || order.expectedDeliveryDate;
      const isCompleted = order.status === "COMPLETED";

      if (!promised || isCompleted) return false;

      return new Date(promised) < new Date();
    }).length;

    return {
      total: pagination.totalItems,
      pending,
      inProgress,
      completed,
      overdue,
    };
  }, [ordersList, pagination.totalItems]);

  const clearCreateOrderSearch = () => {
    navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        addOrder: undefined,
        customerId: undefined,
        measurementId: undefined,
        blockId: undefined,
        categoryId: undefined,
      }),
    });
  };

  const handleCreateDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      navigate({
        search: (previous) => ({
          ...previous,
          addOrder: true,
        }),
      });

      return;
    }

    clearCreateOrderSearch();
  };

  const handleOpenCreateOrder = () => {
    navigate({
      search: (previous) => ({
        ...previous,
        addOrder: true,
      }),
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setOrderDate("");
    setPromisedDate("");
    setCurrentPage(1);
  };

  const hasFilters = Boolean(
    debouncedSearch || statusFilter !== "all" || orderDate || promisedDate
  );

  return (
    <PermissionGate action="read" subject="Orders">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-orders-page"
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
                  <Shirt className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Orders
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Manage tailoring orders, promised dates, customer details,
                    blocks, and measurements.
                  </p>

                  {hasCreateOrderPrefill && isCreateOpen && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      Customer, block, category, and measurement are already
                      selected from the previous flow.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading || isFetching}
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
                  variant="outline"
                  className="h-9 rounded-lg bg-white font-bold"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>

                <Button
                  onClick={handleOpenCreateOrder}
                  className="h-9 rounded-lg font-bold shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Order
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <OrderStatCard
                title="Total Orders"
                value={stats.total}
                description="All matching orders"
                icon={PackageCheck}
              />

              <OrderStatCard
                title="Pending"
                value={stats.pending}
                description="Waiting to start"
                icon={Clock}
              />

              <OrderStatCard
                title="In Progress"
                value={stats.inProgress}
                description="Currently being stitched"
                icon={TimerReset}
              />

              <OrderStatCard
                title="Overdue"
                value={stats.overdue}
                description="Promised date passed"
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
                          placeholder="Search order number, customer name, or phone..."
                          className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Status
                      </label>

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus:ring-0">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>

                        <SelectContent>
                          {orderStatusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Order Date
                      </label>

                      <Input
                        type="date"
                        value={orderDate}
                        onChange={(event) => setOrderDate(event.target.value)}
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Promised Date
                      </label>

                      <Input
                        type="date"
                        value={promisedDate}
                        onChange={(event) => setPromisedDate(event.target.value)}
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
                        Status: {formatStatus(statusFilter)}
                      </Badge>
                    )}

                    {orderDate && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Order: {orderDate}
                      </Badge>
                    )}

                    {promisedDate && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Promised: {promisedDate}
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
                      Order List
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      View orders, customer details, promised dates, and current
                      tailoring progress.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {pagination.totalItems} orders
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
                  <OrdersLoadingState />
                ) : (
                  <OrdersTable
                    orders={ordersList}
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalCount={pagination.totalItems}
                    onPageChange={setCurrentPage}
                    onViewDetails={handleViewDetails}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <OrderDetailsDialog
          order={selectedOrder}
          open={isDetailsOpen}
          onOpenChange={(open) => {
            setIsDetailsOpen(open);

            if (!open) {
              setSelectedOrder(null);
            }
          }}
        />

        <CreateOrderDialog
          open={isCreateOpen}
          onOpenChange={handleCreateDialogOpenChange}
          prefill={createOrderPrefill}
        />
      </div>
    </PermissionGate>
  );
}

type OrderStatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  danger?: boolean;
};

function OrderStatCard({
  title,
  value,
  description,
  icon: Icon,
  danger,
}: OrderStatCardProps) {
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

function OrdersLoadingState() {
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

function formatStatus(status: string) {
  const map: Record<string, string> = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return map[status] ?? status;
}