"use client";

import { useEffect,  useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Download,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <PermissionGate action="read" subject="Orders">
      <AnimatePresence mode="wait">
        <motion.div
          key="group-orders-page"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="mx-auto flex w-full flex-col gap-6 px-4 py-4 sm:w:max-w-7xl pb-10 sm:px-6 sm:py-6 lg:px-8 xl:px-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-1">
             
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Group Orders
              </h1>

              <p className="max-w-3xl text-sm text-slate-500">
                Manage batch orders placed by one coordinator for multiple
                customers, nurses, or hospital uniforms.
              </p>
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

              <Button type="button" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                type="button"
                className="gap-2"
                onClick={handleCreateGroupOrder}
              >
                <Plus className="h-4 w-4" />
                Create Group Order
              </Button>
            </div>
          </div>

          <Card className="rounded-lg border-slate-200 bg-white shadow-none">
            <CardContent className="p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="flex flex-col xl:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-slate-500">
                    Search
                  </label>

                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search group no, title, hospital, contact..."
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 block text-xs font-medium text-slate-500">
                    Status
                  </label>

                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as GroupOrderStatus | "all")
                    }
                  >
                    <SelectTrigger className="w-full ">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>

                      {GROUP_ORDER_STATUSES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 block text-xs font-medium text-slate-500">
                    From Date
                  </label>

                  <div className="relative flex items-center">
                    <CalendarDays className="absolute left-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 block text-xs font-medium text-slate-500">
                    To Date
                  </label>

                  <div className="relative flex items-center">
                    <CalendarDays className="absolute left-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  Page Size: {PAGE_SIZE}
                </span>

                {debouncedSearch && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Search: {debouncedSearch}
                  </span>
                )}

                {statusFilter !== "all" && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    Status: {statusFilter}
                  </span>
                )}

                {fromDate && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    From: {fromDate}
                  </span>
                )}

                {toDate && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    To: {toDate}
                  </span>
                )}

                <Button
                  type="button"
                  variant="link"
                  className="ml-auto inline-flex items-center text-xs text-blue-600 hover:text-blue-700"
                  onClick={handleClearFilters}
                >
                 
                  Clear all filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className={cn(isFetching && "opacity-70")}>
            {isLoading ? (
              <GroupOrdersSkeleton />
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
          </div>

          <CreateGroupOrderDialog
            open={isCreateOpen}
            onOpenChange={handleCreateDialogOpenChange}
            onCreated={() => refetch()}
            onSubmit={async (payload: any) => {
              console.log("CREATE_GROUP_ORDER_PAYLOAD", payload);

              /**
               * Replace this with your mutation:
               *
               * await createGroupOrderMutation.mutateAsync(payload);
               */
            }}
          />
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}


function GroupOrdersSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="border-b border-slate-100 p-4 last:border-b-0"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-80 max-w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="h-12 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-12 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-12 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-12 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}