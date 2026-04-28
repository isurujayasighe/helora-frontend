"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  Download,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useGetBlocks } from "./api/useGetBlocks";
import { BlocksTable } from "./components/blocks-table";
import { BlockDetailsDialog } from "./components/block-details-dialog";


const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

export default function BlocksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blockDetailsOpen, setBlockDetailsOpen] = useState(false);
  const [_addBlockOpen, setAddBlockOpen] = useState(false);
  const [_selectedEditBlockId, setSelectedEditBlockId] = useState<string | null>(
    null,
  );
  const [_editBlockOpen, setEditBlockOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryId, customerId, status]);

  const {
    data: blocksResponse,
    isLoading,
    isFetching,
  } = useGetBlocks({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    customerId: customerId || undefined,
    status: status || undefined,
  });

  const blocksList = blocksResponse?.data.items ?? [];

  const pagination = blocksResponse?.data.pagination ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const stats = useMemo(() => {
    const activeBlocks = blocksList.filter(
      (block) => block.status === "ACTIVE",
    ).length;

    const defaultBlocks = blocksList.filter((block) =>
      block.customerBlocks?.some((item) => item.isDefault),
    ).length;

    const totalOrderUses = blocksList.reduce(
      (sum, block) => sum + (block._count?.orderItems ?? 0),
      0,
    );

    return {
      totalBlocks: blocksList.length,
      activeBlocks,
      defaultBlocks,
      totalOrderUses,
    };
  }, [blocksList]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCategoryId("");
    setCustomerId("");
    setStatus("");
    setCurrentPage(1);
  };

  return (
    <PermissionGate action="read" subject="Blocks">
      <AnimatePresence mode="wait">
        <motion.div
          key="blocks-page"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="mx-auto flex w-full flex-col gap-6 px-4 py-4 pb-10 sm:px-6 sm:py-6 lg:px-8 xl:px-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Blocks
              </h1>
              <p className="text-sm text-slate-500">
                Manage customer tailoring blocks, categories, usage, and active
                status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button className="gap-2" onClick={() => setAddBlockOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Block
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Blocks"
              value={stats.totalBlocks}
              icon={Blocks}
            />
            <StatCard
              label="Active Blocks"
              value={stats.activeBlocks}
              icon={ShieldCheck}
            />
            <StatCard
              label="Default Blocks"
              value={stats.defaultBlocks}
              icon={Blocks}
            />
            <StatCard
              label="Order Uses"
              value={stats.totalOrderUses}
              icon={PackageCheck}
            />
          </div>

          <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
              <div className="flex flex-col xl:col-span-3">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Search
                </label>

                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search block no, customer, phone, size..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col xl:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Category ID
                </label>

                <Input
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  placeholder="categoryId"
                />
              </div>

              <div className="flex flex-col xl:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Customer ID
                </label>

                <Input
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  placeholder="customerId"
                />
              </div>

              <div className="flex flex-col xl:col-span-1">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
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

              {categoryId && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  Category: {categoryId}
                </span>
              )}

              {customerId && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  Customer: {customerId}
                </span>
              )}

              {status && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  Status: {status}
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
                Loading blocks...
              </div>
            ) : (
              <div className="space-y-4">
                <BlocksTable
                  blocks={blocksList}
                  onViewBlock={(blockId) => {
                    setSelectedBlockId(blockId);
                    setBlockDetailsOpen(true);
                  }}
                  onEditBlock={(blockId) => {
                    setSelectedEditBlockId(blockId);
                    setEditBlockOpen(true);
                  }}
                />

                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing page{" "}
                    <span className="font-medium text-slate-900">
                      {pagination.page}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-slate-900">
                      {pagination.totalPages}
                    </span>{" "}
                    —{" "}
                    <span className="font-medium text-slate-900">
                      {pagination.totalItems}
                    </span>{" "}
                    blocks
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPreviousPage}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      Previous
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <BlockDetailsDialog
              blockId={selectedBlockId}
              open={blockDetailsOpen}
              onOpenChange={(open) => {
                setBlockDetailsOpen(open);

                if (!open) {
                  setSelectedBlockId(null);
                }
              }}
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
