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
import type { Order } from "@/types/orders";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

const orderStatusOptions = [
  { value: "all", label: "All status" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CUTTING", label: "Cutting" },
  { value: "SEWING", label: "Sewing" },
  { value: "READY", label: "Ready" },
  { value: "DELIVERED", label: "Delivered" },
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

  /**
   * Backward compatibility:
   * Old flow opened create-order dialog using:
   * /app/orders?addOrder=true&customerId=...
   *
   * New flow redirects that same URL state to:
   * /app/order-create?customerId=...
   */
  useEffect(() => {
    if (!orderSearch.addOrder) return;

    navigate({
      to: "/app/create-order-page",
      replace: true,
      search: {
        customerId: orderSearch.customerId,
        orderSource: "PHYSICAL_SHOP",
      },
    });
  }, [
    navigate,
    orderSearch.addOrder,
    orderSearch.customerId,
  ]);

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
    const pending = ordersList.filter(
      (order) => order.status === "PENDING",
    ).length;

    const inProgress = ordersList.filter((order) =>
      ["CONFIRMED", "CUTTING", "SEWING", "READY"].includes(order.status),
    ).length;

    const completed = ordersList.filter(
      (order) => order.status === "COMPLETED",
    ).length;

    const overdue = ordersList.filter((order: any) => {
      const promised = order.promisedDate || order.expectedDeliveryDate;
      const isCompleted =
        order.status === "DELIVERED" || order.status === "CANCELLED";

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

  const handleOpenCreateOrder = () => {
    navigate({
      to: "/app/create-order-page",
      search: {
        orderSource: "PHYSICAL_SHOP",
      },
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
    debouncedSearch || statusFilter !== "all" || orderDate || promisedDate,
  );

  return (
    <PermissionGate action="read" subject="orders">
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
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Shirt className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl font-bold text-slate-900">
                      My Orders
                    </h1>

                    {isFetching && !isLoading && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-blue-50 text-blue-700"
                      >
                        Updating
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    View, filter and manage customer garment orders.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="rounded-lg"
                >
                  <RefreshCw
                    className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")}
                  />
                  Refresh
                </Button>

                <Button type="button" variant="outline" className="rounded-lg">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>

                <PermissionGate action="create" subject="orders">
                  <Button
                    type="button"
                    onClick={handleOpenCreateOrder}
                    className="rounded-lg bg-slate-900 hover:bg-slate-800"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
                </PermissionGate>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Orders"
                value={stats.total}
                icon={PackageCheck}
                description="All matching records"
              />

              <StatCard
                title="Pending"
                value={stats.pending}
                icon={Clock}
                description="Waiting to start"
              />

              <StatCard
                title="In Progress"
                value={stats.inProgress}
                icon={TimerReset}
                description="Confirmed, cutting or sewing"
              />

              <StatCard
                title="Overdue"
                value={stats.overdue}
                icon={TriangleAlert}
                description="Past promised date"
                danger={stats.overdue > 0}
              />
            </div>

            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-4 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Order List
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Search by customer, order number, phone number or town.
                    </CardDescription>
                  </div>

                  {hasFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClearFilters}
                      className="w-fit rounded-lg text-slate-600"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search orders..."
                      className="rounded-lg border-slate-200 bg-white pl-9"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="rounded-lg border-slate-200 bg-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>

                    <SelectContent>
                      {orderStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={orderDate}
                    onChange={(event) => setOrderDate(event.target.value)}
                    className="rounded-lg border-slate-200 bg-white"
                    aria-label="Order date"
                  />

                  <Input
                    type="date"
                    value={promisedDate}
                    onChange={(event) => setPromisedDate(event.target.value)}
                    className="rounded-lg border-slate-200 bg-white"
                    aria-label="Promised date"
                  />
                </div>

                <OrdersTable
                  orders={ordersList}
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalCount={pagination.totalItems}
                  onPageChange={setCurrentPage}
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <OrderDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          order={selectedOrder}
        />
      </div>
    </PermissionGate>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  danger,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  danger?: boolean;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            danger ? "bg-red-50 text-red-600" : "bg-slate-900 text-white",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
