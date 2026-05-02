"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  Download,
  Grid2x2,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
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

import { useGetBlocks } from "./api/useGetBlocks";
import { BlocksTable } from "./components/blocks-table";
import { BlockDetailsDialog } from "./components/block-details-dialog";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

const blockStatusOptions = [
  { value: "all", label: "All status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function BlocksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blockDetailsOpen, setBlockDetailsOpen] = useState(false);

  const [_addBlockOpen, setAddBlockOpen] = useState(false);
  const [_selectedEditBlockId, setSelectedEditBlockId] = useState<string | null>(
    null
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
    refetch,
  } = useGetBlocks({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    customerId: customerId || undefined,
    status: status === "all" ? undefined : status,
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
      (block: any) => block.status === "ACTIVE"
    ).length;

    const defaultBlocks = blocksList.filter((block: any) =>
      block.customerBlocks?.some((item: any) => item.isDefault)
    ).length;

    const totalOrderUses = blocksList.reduce(
      (sum: number, block: any) => sum + (block._count?.orderItems ?? 0),
      0
    );

    return {
      totalBlocks: pagination.totalItems,
      activeBlocks,
      defaultBlocks,
      totalOrderUses,
    };
  }, [blocksList, pagination.totalItems]);

  const handleViewBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    setBlockDetailsOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCategoryId("");
    setCustomerId("");
    setStatus("all");
    setCurrentPage(1);
  };

  const hasFilters = Boolean(
    debouncedSearch || categoryId || customerId || status !== "all"
  );

  return (
    <PermissionGate action="read" subject="Blocks">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-blocks-page"
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
                  <Grid2x2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Blocks
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Manage reusable tailoring blocks, customer fits, categories,
                    and order usage.
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
                  onClick={() => setAddBlockOpen(true)}
                  className="h-9 rounded-lg font-bold shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Block
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <BlockStatCard
                title="Total Blocks"
                value={stats.totalBlocks}
                description="All reusable block records"
                icon={Blocks}
              />

              <BlockStatCard
                title="Active Blocks"
                value={stats.activeBlocks}
                description="Available for new orders"
                icon={ShieldCheck}
              />

              <BlockStatCard
                title="Default Blocks"
                value={stats.defaultBlocks}
                description="Main blocks for customers"
                icon={Star}
              />

              <BlockStatCard
                title="Order Uses"
                value={stats.totalOrderUses}
                description="Times blocks were used in orders"
                icon={PackageCheck}
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
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
                          placeholder="Search block no, customer, phone, size..."
                          className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Category
                      </label>

                      <Input
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        placeholder="Category ID"
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Customer
                      </label>

                      <Input
                        value={customerId}
                        onChange={(event) => setCustomerId(event.target.value)}
                        placeholder="Customer ID"
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Status
                      </label>

                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus:ring-0">
                          <SelectValue placeholder="All status" />
                        </SelectTrigger>

                        <SelectContent>
                          {blockStatusOptions.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                    {categoryId && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Category: {categoryId}
                      </Badge>
                    )}

                    {customerId && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Customer: {customerId}
                      </Badge>
                    )}

                    {status !== "all" && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Status: {formatBlockStatus(status)}
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
                      Block List
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      View customer blocks, default fit, category, status, and
                      order usage.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {pagination.totalItems} blocks
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
                  <BlocksLoadingState />
                ) : (
                  <BlocksTable
                    blocks={blocksList}
                    onViewBlock={handleViewBlock}
                    onEditBlock={(blockId: string) => {
                      setSelectedEditBlockId(blockId);
                      setEditBlockOpen(true);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

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
    </PermissionGate>
  );
}

type BlockStatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
};

function BlockStatCard({
  title,
  value,
  description,
  icon: Icon,
}: BlockStatCardProps) {
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

function BlocksLoadingState() {
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

function formatBlockStatus(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
  };

  return map[status] ?? status;
}