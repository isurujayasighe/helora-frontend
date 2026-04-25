"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  Download,
  PackageCheck,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useGetCustomers } from "./api/useGetCustomers";
import { CustomersTable } from "./components/customer-details-table";
import { CustomerDetailsDialog } from "./components/customer-details-dialog";
import { CreateCustomerDialog } from "./components/create-customer-dialog";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [townFilter, setTownFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
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

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDetailsOpen(true);
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
      activeCustomers,
      totalBlocks,
      totalOrders,
    };
  }, [customersList]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setTownFilter("");
    setCurrentPage(1);
  };

  return (
    <PermissionGate action="read" subject="Customers">
      <AnimatePresence mode="wait">
        <motion.div
          key="customers-page"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="mx-auto flex w-full flex-col gap-6 px-4 py-4 pb-10 sm:px-6 sm:py-6 lg:px-8 xl:px-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Customers
              </h1>
              <p className="text-sm text-slate-500">
                Manage customer details, phone numbers, towns, blocks, and order
                history in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                className="gap-2"
                onClick={() => setCreateCustomerOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Active Customers"
              value={stats.activeCustomers}
              icon={UserRound}
            />

            <StatCard
              label="Total Blocks"
              value={stats.totalBlocks}
              icon={Blocks}
            />

            <StatCard
              label="Total Orders"
              value={stats.totalOrders}
              icon={PackageCheck}
            />
          </div>

          <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="flex flex-col xl:col-span-3">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Search
                </label>

                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search customer name, phone, town, or address"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col xl:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Town
                </label>

                <Input
                  value={townFilter}
                  onChange={(event) => setTownFilter(event.target.value)}
                  placeholder="Filter by town"
                />
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

              {townFilter && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  Town: {townFilter}
                </span>
              )}

              <button
                type="button"
                className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-700"
                onClick={handleClearFilters}
              >
                Clear all filters
              </button>
            </div>
          </div>

          <div className={cn(isFetching && "opacity-70")}>
            {isLoading ? (
              <div className="flex min-h-80 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500">
                Loading customers...
              </div>
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

            <CustomerDetailsDialog
              customerId={selectedCustomerId}
              open={detailsOpen}
              onOpenChange={(open) => {
                setDetailsOpen(open);

                if (!open) {
                  setSelectedCustomerId(null);
                }
              }}
            />
            <CreateCustomerDialog
              open={createCustomerOpen}
              onOpenChange={setCreateCustomerOpen}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ElementType;
};

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
