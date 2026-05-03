"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Ruler,
  Search,
  Shirt,
  Trash2,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { Category } from "./types/category.types";
import {
  useCategoriesQuery,
  useDeleteCategory,
} from "./api/category-api";
import { CategoryFormDialog } from "./components/category-form-dialog";
import { CategoryDetailsDialog } from "./components/category-details-dialog";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

export default function CategoryPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, refetch } = useCategoriesQuery({
    pageIndex,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteCategory = useDeleteCategory();

  const categories = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const pageCount = Math.max(1, pagination?.totalPages ?? 1);

  const stats = useMemo(() => {
    const totalBlocks = categories.reduce(
      (sum, item) => sum + (item._count?.blocks ?? 0),
      0
    );

    const totalOrders = categories.reduce(
      (sum, item) => sum + (item._count?.orderItems ?? 0),
      0
    );

    const totalFields = categories.reduce(
      (sum, item) => sum + (item._count?.measurementFields ?? 0),
      0
    );

    return {
      total,
      totalBlocks,
      totalOrders,
      totalFields,
    };
  }, [categories, total]);

  const openCreate = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormOpen(true);
  };

  const openDetails = (category: Category) => {
    setSelectedCategory(category);
    setDetailsOpen(true);
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${category.name}?`
    );

    if (!confirmed) return;

    await deleteCategory.mutateAsync(category.id);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setPageIndex(0);
  };

  return (
    <PermissionGate action="read" subject="settings-categories">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-categories"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <Shirt className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Categories
                  </h1>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Manage garment categories used for orders, blocks, and
                    measurement fields.
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
                  onClick={openCreate}
                  className="h-9 rounded-lg font-bold shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CategoryStatCard
                title="Total Categories"
                value={stats.total}
                description="All garment categories"
                icon={Shirt}
              />

              <CategoryStatCard
                title="Linked Blocks"
                value={stats.totalBlocks}
                description="Blocks using categories"
                icon={Blocks}
              />

              <CategoryStatCard
                title="Order Items"
                value={stats.totalOrders}
                description="Order items using categories"
                icon={Shirt}
              />

              <CategoryStatCard
                title="Measurement Fields"
                value={stats.totalFields}
                description="Fields configured by category"
                icon={Ruler}
              />
            </div>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div className="grid w-full gap-2 lg:max-w-md">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Search
                    </label>

                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search category name or description..."
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
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

                    {debouncedSearch && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={resetFilters}
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
                      Category List
                    </CardTitle>

                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      Create categories before adding blocks or measurement
                      fields.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {total} categories
                  </Badge>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "min-h-0 flex-1 overflow-auto p-0",
                  isFetching && "opacity-70"
                )}
              >
                <CategoryTable
                  categories={categories}
                  isLoading={isLoading}
                  isDeleting={deleteCategory.isPending}
                  onView={openDetails}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </CardContent>

              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-500">
                  Page {pageIndex + 1} of {pageCount}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination?.hasPreviousPage}
                    onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                    className="h-9 rounded-lg font-bold"
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!pagination?.hasNextPage}
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    className="h-9 rounded-lg font-bold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <CategoryFormDialog
          open={formOpen}
          category={selectedCategory}
          onClose={() => {
            setFormOpen(false);
            setSelectedCategory(null);
          }}
        />

        <CategoryDetailsDialog
          open={detailsOpen}
          category={selectedCategory}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedCategory(null);
          }}
        />
      </div>
    </PermissionGate>
  );
}

function CategoryStatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
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

function CategoryTable({
  categories,
  isLoading,
  isDeleting,
  onView,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  isLoading: boolean;
  isDeleting?: boolean;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  if (isLoading) {
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

  if (!categories.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Shirt className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-950">
          No categories found
        </h3>

        <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
          Add garment categories like Nurse Uniform, Saree, Blouse, or School
          Uniform before setting up blocks and measurement fields.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-225">
      <div className="grid grid-cols-[1.4fr_1.8fr_0.8fr_0.8fr_0.8fr_70px] border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
        <div>Category</div>
        <div>Description</div>
        <div>Blocks</div>
        <div>Orders</div>
        <div>Fields</div>
        <div />
      </div>

      {categories.map((category) => (
        <div
          key={category.id}
          className="grid grid-cols-[1.4fr_1.8fr_0.8fr_0.8fr_0.8fr_70px] items-center border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50"
        >
          <button
            type="button"
            onClick={() => onView(category)}
            className="min-w-0 text-left"
          >
            <p className="truncate font-black text-slate-950">
              {category.name}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500">
              {category.id}
            </p>
          </button>

          <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-600">
            {category.description || "No description added"}
          </p>

          <p className="font-bold text-slate-800">
            {category._count?.blocks ?? 0}
          </p>

          <p className="font-bold text-slate-800">
            {category._count?.orderItems ?? 0}
          </p>

          <p className="font-bold text-slate-800">
            {category._count?.measurementFields ?? 0}
          </p>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(category)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={isDeleting}
                onClick={() => onDelete(category)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}