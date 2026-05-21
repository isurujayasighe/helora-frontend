"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  History,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useGetBlocks } from "./api/useGetBlocks";
import { useGetCategories } from "./api/useGetCategories";
import { BlocksTable } from "./components/blocks-table";
import { BlockDetailsDialog } from "./components/block-details-dialog";
import { CreateBlockDialog } from "./components/create-block-dialog";
import { EditBlockCustomersDialog } from "./components/edit-block-customers-dialog";

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
  const navigate = useNavigate({
    from: "/app/blocks/",
  });
  const blockSearch = useSearch({
    from: "/_authenticated/app/blocks/",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [addBlockOpen, setAddBlockOpen] = useState(false);

  const [selectedEditBlockId, setSelectedEditBlockId] = useState<string | null>(
    null,
  );
  const [editBlockOpen, setEditBlockOpen] = useState(false);
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetCategories();

  const categories = categoriesResponse?.data ?? [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryId, status]);

  const {
    data: blocksResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetBlocks({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    categoryId: categoryId === "all" ? undefined : categoryId,
    status: status === "all" ? undefined : status,
    includeCounts: false,
    includeTotal: true,
  });

  const { data: activeBlocksResponse } = useGetBlocks({
    page: 1,
    pageSize: 1,
    search: debouncedSearch || undefined,
    categoryId: categoryId === "all" ? undefined : categoryId,
    status: "ACTIVE",
    includeCounts: false,
    includeTotal: true,
  });

  const blocksList = blocksResponse?.data.items ?? [];

  const pagination = blocksResponse?.data.pagination ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    isTotalExact: false,
  };

  const stats = useMemo(() => {
    const totalBlocks = pagination.totalItems;
    const activeBlocks =
      activeBlocksResponse?.data.pagination.totalItems ??
      blocksList.filter((block: any) => block.status === "ACTIVE").length;
    const recentUsage = blocksList.filter((block: any) => {
      if (!block.lastUsedAt) return false;

      const lastUsedAt = new Date(block.lastUsedAt).getTime();
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      return Number.isFinite(lastUsedAt) && lastUsedAt >= oneDayAgo;
    }).length;
    const activePercentage = totalBlocks
      ? Math.round((activeBlocks / totalBlocks) * 1000) / 10
      : 0;

    return {
      totalBlocks,
      activeBlocks,
      recentUsage,
      activePercentage,
    };
  }, [activeBlocksResponse, blocksList, pagination.totalItems]);

  const handleViewBlock = (blockId: string) => {
    navigate({
      search: (previous) => ({
        ...previous,
        viewBlockId: blockId,
      }),
    });
  };

  const handleCloseBlockDetails = () => {
    navigate({
      search: (previous) => ({
        ...previous,
        viewBlockId: undefined,
      }),
      replace: true,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCategoryId("all");
    setStatus("all");
    setCurrentPage(1);
  };

  const handleBlockCreated = async () => {
    setCurrentPage(1);
    await refetch();
  };

  const hasFilters = Boolean(
    debouncedSearch || categoryId !== "all" || status !== "all",
  );

  const safeTotalPages = Math.max(pagination.totalPages || 1, 1);
  const canGoPrevious = pagination.hasPreviousPage || currentPage > 1;
  const canGoNext =
    pagination.hasNextPage || currentPage < safeTotalPages;
  const totalBlocksLabel =
    pagination.isTotalExact === false && pagination.hasNextPage
      ? `${pagination.totalItems}+`
      : `${pagination.totalItems}`;
  const firstVisibleItem = pagination.totalItems
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const lastVisibleItem = pagination.totalItems
    ? firstVisibleItem + blocksList.length - 1
    : 0;
  const paginationItems = getPaginationItems(currentPage, safeTotalPages);

  return (
    <PermissionGate action="read" subject="blocks">
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
            <div className="grid gap-4 md:grid-cols-3">
              <BlockStatCard
                title="Total Blocks"
                value={stats.totalBlocks}
                description="Global repository inventory"
                meta="Live total"
                icon={Blocks}
                iconClassName="bg-indigo-100 text-indigo-700"
              />

              <BlockStatCard
                title="Active Blocks"
                value={stats.activeBlocks}
                description="Verified and ready for production"
                meta={`${stats.activePercentage}% Active`}
                icon={CheckCircle2}
                iconClassName="bg-teal-100 text-teal-700"
              />

              <BlockStatCard
                title="Recent Usage"
                value={stats.recentUsage}
                valueSuffix="today"
                description="Applied to orders in last 24h"
                meta={stats.recentUsage ? "High Usage" : "No recent usage"}
                icon={History}
                iconClassName="bg-blue-100 text-blue-700"
              />
            </div>

            <Card className="flex min-h-0 flex-1 flex-col rounded-md border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-950">
                    Block List
                  </h1>

                  <Badge className="rounded-full border-0 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-slate-500 hover:bg-rose-50">
                    {totalBlocksLabel} total
                  </Badge>
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="grid gap-2 md:grid-cols-[minmax(210px,1fr)_160px_140px] lg:w-125">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search blocks..."
                        className="h-9 rounded-md border-slate-200 bg-white pl-9 text-sm shadow-none"
                      />
                    </div>

                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="h-9 rounded-md border-slate-200 bg-white text-sm shadow-none">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                        {isCategoriesLoading && (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-9 rounded-md border-slate-200 bg-white text-sm shadow-none">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>

                      <SelectContent>
                        {blockStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      title="Refresh blocks"
                      onClick={() => refetch()}
                      disabled={isLoading || isFetching}
                      className="rounded-md"
                    >
                      <RefreshCw
                        className={cn(isFetching && "animate-spin")}
                      />
                    </Button>

                    <PermissionGate action="create" subject="blocks">
                      <Button
                        type="button"
                        size="icon-sm"
                        title="Add block"
                        onClick={() => setAddBlockOpen(true)}
                        className="rounded-md"
                      >
                        <Plus />
                      </Button>
                    </PermissionGate>

                    {hasFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClearFilters}
                        className="h-9 rounded-md px-3 font-bold text-slate-500 hover:text-slate-900"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <CardContent
                className={cn(
                  "min-h-0 flex-1 overflow-auto p-0",
                  isFetching && "opacity-70",
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

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-600">
                  Showing {firstVisibleItem} to {lastVisibleItem} of{" "}
                  {pagination.totalItems} entries
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="rounded-md"
                    disabled={!canGoPrevious || isFetching}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(page - 1, 1))
                    }
                  >
                    <ChevronLeft />
                  </Button>

                  {paginationItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <span
                        key={`${item}-${index}`}
                        className="px-1 text-sm font-bold text-slate-400"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={item}
                        type="button"
                        variant={item === currentPage ? "default" : "outline"}
                        size="icon-sm"
                        disabled={isFetching}
                        onClick={() => setCurrentPage(item)}
                        className={cn(
                          "rounded-md",
                          item === currentPage && "bg-black text-white hover:bg-black",
                        )}
                      >
                        {item}
                      </Button>
                    ),
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="rounded-md"
                    disabled={!canGoNext || isFetching}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, safeTotalPages),
                      )
                    }
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <CreateBlockDialog
          open={addBlockOpen}
          onOpenChange={setAddBlockOpen}
          onCreated={handleBlockCreated}
        />

        <BlockDetailsDialog
          blockId={blockSearch.viewBlockId ?? null}
          open={Boolean(blockSearch.viewBlockId)}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseBlockDetails();
            }
          }}
        />

        <EditBlockCustomersDialog
          blockId={selectedEditBlockId}
          open={editBlockOpen}
          onOpenChange={(open) => {
            setEditBlockOpen(open);

            if (!open) {
              setSelectedEditBlockId(null);
            }
          }}
          onUpdated={async () => {
            await refetch();
          }}
        />
      </div>
    </PermissionGate>
  );
}

type BlockStatCardProps = {
  title: string;
  value: number | string;
  valueSuffix?: string;
  description: string;
  meta: string;
  icon: React.ElementType;
  iconClassName: string;
};

function BlockStatCard({
  title,
  value,
  valueSuffix,
  description,
  meta,
  icon: Icon,
  iconClassName,
}: BlockStatCardProps) {
  return (
    <Card className="relative min-h-35 overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              iconClassName,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>

          <p className="text-xs font-black text-cyan-700">{meta}</p>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-800">
            {title}
          </p>

          <div className="mt-1 flex items-end gap-1.5">
            <p className="text-2xl font-black leading-none text-slate-950">
              {value}
            </p>
            {valueSuffix && (
              <span className="pb-0.5 text-sm font-semibold text-slate-500">
                {valueSuffix}
              </span>
            )}
          </div>

          <p className="mt-3 text-xs font-medium italic text-slate-500">
            {description}
          </p>
        </div>

        <div className="pointer-events-none absolute -bottom-7 -right-5 text-slate-900/[0.035]">
          <Icon className="h-24 w-24" strokeWidth={1.5} />
        </div>
      </CardContent>
    </Card>
  );
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

function BlocksLoadingState() {
  return (
    <div className="divide-y divide-slate-200">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid h-14 grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr_0.9fr_70px] items-center gap-4 px-4"
        >
          {Array.from({ length: 7 }).map((_, cellIndex) => (
            <div
              key={cellIndex}
              className="h-3 animate-pulse rounded bg-slate-100"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
