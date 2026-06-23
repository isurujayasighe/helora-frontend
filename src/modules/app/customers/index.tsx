// src/modules/app/customers/index.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Blocks,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { CustomerStatCard } from "@/components/common/customer-stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useGetCustomers } from "./api/useGetCustomers";
import { CustomersTable } from "./components/customer-details-table";
import { CreateCustomerDialog } from "./components/create-customer-dialog";
import {
  AssignCustomerBlockDialog,
  CustomerDetailsDialog,
} from "./components/customer-details-dialog";
import { EditCustomerSheet } from "./components/edit-customer-sheet";
import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const [townFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null,
  );
  const [assigningCustomerId, setAssigningCustomerId] = useState<string | null>(
    null,
  );

  const isCustomerDetailsOpen = Boolean(
    customerSearch.customerDetails && customerSearch.customerId,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const customersList = useMemo(
    () => customersResponse?.data.items ?? [],
    [customersResponse?.data.items],
  );

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

  return (
    <PermissionGate action="read" subject="customers">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Customers"
              description="Manage customer details, phone numbers, towns, blocks, and order history."
              actions={
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => refetch()}
                    disabled={isLoading || isFetching}
                  >
                    <RefreshCw
                      className={cn("size-4", isFetching && "animate-spin")}
                    />
                    Refresh
                  </Button>

                  <PermissionGate action="create" subject="customers">
                    <Button
                      type="button"
                      onClick={() => setCreateCustomerOpen(true)}
                    >
                      <Plus className="size-4" />
                      Add Customer
                    </Button>
                  </PermissionGate>
                </>
              }
            />

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

            <Card className="gap-0">
              <CardHeader className="border-b gap-0">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Customer Directory</CardTitle>
                    <CardDescription>
                      View customer profiles, saved blocks, and order history.
                    </CardDescription>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search customers..."
                        className="h-10 bg-background pl-9"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "min-h-0 overflow-auto p-0",
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
                    onEditCustomer={setEditingCustomerId}
                    onAssignBlocks={setAssigningCustomerId}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
          onViewCustomer={handleViewCustomer}
        />

        <EditCustomerSheet
          customerId={editingCustomerId}
          open={Boolean(editingCustomerId)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCustomerId(null);
            }
          }}
          onUpdated={async () => {
            await refetch();
          }}
        />

        <AssignCustomerBlockDialog
          customerId={assigningCustomerId}
          open={Boolean(assigningCustomerId)}
          onOpenChange={(open) => {
            if (!open) {
              setAssigningCustomerId(null);
            }
          }}
          onAssigned={async () => {
            await refetch();
          }}
        />
      </div>
    </PermissionGate>
  );
}

function CustomersLoadingState() {
  return (
    <div className="grid gap-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
