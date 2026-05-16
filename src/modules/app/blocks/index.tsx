"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
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
      (block: any) => block.status === "ACTIVE",
    ).length;

    const defaultBlocks = blocksList.filter((block: any) =>
      block.customerBlocks?.some((item: any) => item.isDefault),
    ).length;

    return {
      totalBlocks: pagination.totalItems,
      activeBlocks,
      defaultBlocks,
    };
  }, [blocksList, pagination.totalItems]);

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

  return (
    <PermissionGate action="read" subject="blocks">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
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
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
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

                <PermissionGate action="create" subject="blocks">
                  <Button
                    type="button"
                    onClick={() => setAddBlockOpen(true)}
                    className="h-9 rounded-lg bg-slate-900 font-bold shadow-sm hover:bg-slate-800"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Block
                  </Button>
                </PermissionGate>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <BlockStatCard
                title="Visible Blocks"
                value={stats.totalBlocks}
                description="Loaded on this page"
                icon={Blocks}
              />

              <BlockStatCard
                title="Active Blocks"
                value={stats.activeBlocks}
                description="Ready to use"
                icon={ShieldCheck}
              />

              <BlockStatCard
                title="Default Blocks"
                value={stats.defaultBlocks}
                description="Assigned as default"
                icon={Star}
              />

              <BlockStatCard
                title="Page"
                value={currentPage}
                description="Current result page"
                icon={PackageCheck}
              />
            </div>

            {/* Table */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 px-4 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base font-black text-slate-950">
                        Block List
                      </CardTitle>

                      <Badge
                        variant="outline"
                        className="rounded-lg px-3 py-1 font-bold text-slate-600"
                      >
                        {pagination.totalItems} blocks
                      </Badge>
                    </div>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      Search and filter reusable blocks.
                    </CardDescription>
                  </div>

                  <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_220px_160px_auto] xl:w-195">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search blocks..."
                        className="h-10 rounded-lg border-slate-200 bg-white pl-9"
                      />
                    </div>

                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white">
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
                      <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white">
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
              </CardHeader>

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

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {blocksList.length} of {pagination.totalItems} blocks
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg"
                    disabled={!canGoPrevious || isFetching}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(page - 1, 1))
                    }
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                    {pagination.page} / {safeTotalPages}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg"
                    disabled={!canGoNext || isFetching}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, safeTotalPages),
                      )
                    }
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
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
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function BlocksLoadingState() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}
