"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Plus, Search } from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    ],
  );

  const hasCreateOrderPrefill = Boolean(
    createOrderPrefill.customerId ||
      createOrderPrefill.measurementId ||
      createOrderPrefill.blockId ||
      createOrderPrefill.categoryId,
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
    const pending = ordersList.filter((o) => o.status === "PENDING").length;
    const inProgress = ordersList.filter(
      (o) => o.status === "IN_PROGRESS",
    ).length;
    const completed = ordersList.filter((o) => o.status === "COMPLETED").length;

    return {
      pending,
      inProgress,
      completed,
    };
  }, [ordersList]);

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

  return (
    <PermissionGate action="read" subject="Orders">
      <AnimatePresence mode="wait">
        <motion.div
          key="orders-page"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="mx-auto flex w-full flex-col gap-6 px-4 py-4 pb-10 sm:px-6 sm:py-6 lg:px-8 xl:px-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Orders
              </h1>
              <p className="text-sm text-slate-500">
                Manage tailoring orders, inspect item details, and review linked
                customer and block information.
              </p>

              {hasCreateOrderPrefill && isCreateOpen && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  Customer, block, category, and measurement are loaded from the
                  dashboard flow.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button className="gap-2" onClick={handleOpenCreateOrder}>
                <Plus className="h-4 w-4" />
                Create Order
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pending Orders
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {stats.pending}
              </p>
            </div>

            <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                In Progress
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {stats.inProgress}
              </p>
            </div>

            <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Completed
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {stats.completed}
              </p>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="flex flex-col xl:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Search
                </label>

                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search order number, customer name, or phone"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Order Date
                </label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Promised Date
                </label>
                <Input
                  type="date"
                  value={promisedDate}
                  onChange={(e) => setPromisedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Page Size: {PAGE_SIZE}
              </span>

              {statusFilter !== "all" && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  Status: {statusFilter}
                </span>
              )}

              {orderDate && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  Order Date: {orderDate}
                </span>
              )}

              {promisedDate && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  Promised Date: {promisedDate}
                </span>
              )}

              <button
                type="button"
                className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                onClick={handleClearFilters}
              >
                Clear all filters
              </button>
            </div>
          </div>

          <div className={cn(isFetching && "opacity-70")}>
            {isLoading ? (
              <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">
                Loading orders...
              </div>
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
          </div>

          <OrderDetailsDialog
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            order={selectedOrder}
          />

          <CreateOrderDialog
            open={isCreateOpen}
            onOpenChange={handleCreateDialogOpenChange}
            prefill={createOrderPrefill}
            onSubmit={async (payload) => {
              console.log("create order payload", payload);

              await refetch();
              clearCreateOrderSearch();
            }}
          />
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}