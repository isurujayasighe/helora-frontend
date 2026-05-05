// src/modules/app/customers/index.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  Download,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useGetCustomers } from "./api/useGetCustomers";
import { CustomersTable } from "./components/customer-details-table";
import { CreateCustomerDialog } from "./components/create-customer-dialog";
import { CustomerDetailsDialog } from "./components/customer-details-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const navigate = useNavigate({
    from: "/app/customers/",
  });

  const customerSearch = useSearch({
    from: "/_authenticated/app/customers/",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [townFilter, setTownFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);

  const isCustomerDetailsOpen = Boolean(
    customerSearch.customerDetails && customerSearch.customerId,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, townFilter]);

  const {
    data: customersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetCustomers({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    town: townFilter || undefined,
  });

  const customersList = customersResponse?.data.items ?? [];

  const pagination = customersResponse?.data.pagination ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const stats = useMemo(() => {
    const totalBlocks = customersList.reduce(
      (sum, customer) => sum + (customer._count?.blocks ?? 0),
      0,
    );

    const totalOrders = customersList.reduce(
      (sum, customer) => sum + (customer._count?.orders ?? 0),
      0,
    );

    const activeCustomers = customersList.filter(
      (customer) =>
        (customer._count?.orders ?? 0) > 0 ||
        (customer._count?.blocks ?? 0) > 0,
    ).length;

    return {
      totalCustomers: pagination.totalItems,
      activeCustomers,
      totalBlocks,
      totalOrders,
    };
  }, [customersList, pagination.totalItems]);

  const handleViewCustomer = (customerId: string) => {
    navigate({
      search: (previous) => ({
        ...previous,
        customerDetails: true,
        customerId,
      }),
    });
  };

  const handleCloseCustomerDetails = () => {
    navigate({
      search: (previous) => ({
        ...previous,
        customerDetails: undefined,
        customerId: undefined,
      }),
      replace: true,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setTownFilter("");
    setCurrentPage(1);
  };

  const hasFilters = Boolean(debouncedSearch || townFilter);

  return (
    <PermissionGate action="read" subject="customers">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-customers-page"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <UsersRound className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Customers
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Manage customer details, phone numbers, towns, blocks, and
                    order history.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading || isFetching}
                  className="h-9 rounded-lg bg-white font-bold"
                >
                  <RefreshCw
                    className={cn(
                      "mr-2 h-4 w-4",
                      isFetching && "animate-spin",
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

                <PermissionGate action="create" subject="customers">
                  <Button
                    type="button"
                    onClick={() => setCreateCustomerOpen(true)}
                    className="h-9 rounded-lg bg-slate-900 font-bold shadow-sm hover:bg-slate-800"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                </PermissionGate>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CustomerStatCard
                title="Total Customers"
                value={stats.totalCustomers}
                description="All customers saved"
                icon={UsersRound}
              />

              <CustomerStatCard
                title="Active Customers"
                value={stats.activeCustomers}
                description="Customers with orders or blocks"
                icon={UserRound}
              />

              <CustomerStatCard
                title="Total Blocks"
                value={stats.totalBlocks}
                description="Reusable customer blocks"
                icon={Blocks}
              />

              <CustomerStatCard
                title="Total Orders"
                value={stats.totalOrders}
                description="Orders linked to customers"
                icon={PackageCheck}
              />
            </div>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                  <div className="grid w-full gap-3 md:grid-cols-[minmax(0,1fr)_240px] xl:max-w-4xl">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Search
                      </label>

                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                        <Input
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
                          placeholder="Search by name, phone, town, or address..."
                          className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Town
                      </label>

                      <Input
                        value={townFilter}
                        onChange={(event) => setTownFilter(event.target.value)}
                        placeholder="Filter by town"
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

                    {townFilter && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Town: {townFilter}
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

            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950">
                      Customer Directory
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      View customer profiles, saved blocks, and order history.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {pagination.totalItems} customers
                  </Badge>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "min-h-0 flex-1 overflow-auto p-0",
                  isFetching && "opacity-70",
                )}
              >
                {isLoading ? (
                  <CustomersLoadingState />
                ) : (
                  <CustomersTable
                    customers={customersList}
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalCount={pagination.totalItems}
                    onPageChange={setCurrentPage}
                    onViewCustomer={handleViewCustomer}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <CustomerDetailsDialog
          open={isCustomerDetailsOpen}
          customerId={customerSearch.customerId}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseCustomerDetails();
            }
          }}
        />

        <CreateCustomerDialog
          open={createCustomerOpen}
          onOpenChange={setCreateCustomerOpen}
        />
      </div>
    </PermissionGate>
  );
}

type CustomerStatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
};

function CustomerStatCard({
  title,
  value,
  description,
  icon: Icon,
}: CustomerStatCardProps) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomersLoadingState() {
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