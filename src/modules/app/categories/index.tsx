"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Blocks,
  Eye,
  MoreHorizontal,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CustomerStatCard } from "@/components/common/customer-stat-card";
import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";

import type { Category } from "./types/category.types";
import { useCategoriesQuery, useDeleteCategory } from "./api/category-api";
import { CategoryFormDialog } from "./components/category-form-dialog";
import {CategoryDetailsDialog } from "./components/category-details-dialog";

const PAGE_SIZE = 10;

export default function CategoryPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPageIndex(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, refetch } = useCategoriesQuery({
    pageIndex,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteCategory = useDeleteCategory();

  const categories = useMemo(() => data?.items ?? [], [data?.items]);
  const pagination = data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const pageCount = Math.max(1, pagination?.totalPages ?? 1);
  const currentPage = pagination?.page ?? pageIndex + 1;

  const stats = useMemo(() => {
    const totalBlocks = categories.reduce(
      (sum, item) => sum + (item._count?.blocks ?? 0),
      0,
    );

    const totalOrders = categories.reduce(
      (sum, item) => sum + (item._count?.orderItems ?? 0),
      0,
    );

    const totalFields = categories.reduce(
      (sum, item) => sum + (item._count?.measurementFields ?? 0),
      0,
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
      `Are you sure you want to remove ${category.name}?`,
    );

    if (!confirmed) return;

    deleteCategory.mutate(category.id);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setPageIndex(0);
  };

  return (
    <PermissionGate action="read" subject="settings-categories">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Categories"
              description="Manage garment categories used for orders, blocks, and measurement fields."
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

                  <Button type="button" onClick={openCreate}>
                    <Plus className="size-4" />
                    Add Category
                  </Button>
                </>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CustomerStatCard
                title="Total Categories"
                value={stats.total}
                description="All garment categories"
                icon={Shirt}
              />

              <CustomerStatCard
                title="Linked Blocks"
                value={stats.totalBlocks}
                description="Blocks using categories"
                icon={Blocks}
              />

              <CustomerStatCard
                title="Order Items"
                value={stats.totalOrders}
                description="Order items using categories"
                icon={Shirt}
              />

              <CustomerStatCard
                title="Measurement Fields"
                value={stats.totalFields}
                description="Fields configured by category"
                icon={Ruler}
              />
            </div>

            <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Category Directory</CardTitle>

                    <CardDescription>
                      Create categories before adding blocks or measurement
                      fields.
                    </CardDescription>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search categories..."
                        className="pl-9 bg-background"
                      />
                    </div>

                    {debouncedSearch && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={resetFilters}
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
                <CategoryTable
                  categories={categories}
                  isLoading={isLoading}
                  isDeleting={deleteCategory.isPending}
                  onView={openDetails}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </CardContent>

              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {pageCount}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination?.hasPreviousPage}
                    onClick={() =>
                      setPageIndex((prev) => Math.max(0, prev - 1))
                    }
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!pagination?.hasNextPage}
                    onClick={() => setPageIndex((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

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
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
        <Shirt className="size-10 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">No categories found</h3>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Add garment categories like Nurse Uniform, Saree, Blouse, or School
          Uniform before setting up blocks and measurement fields.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-background">
        <TableRow>
          <TableHead className="px-4">Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Blocks</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Fields</TableHead>
          <TableHead className="px-4 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="px-4 py-3">
              <button
                type="button"
                onClick={() => onView(category)}
                className="text-left"
              >
                <p className="font-medium">{category.name}</p>
              
              </button>
            </TableCell>

            <TableCell className="max-w-md">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {category.description || "No description added"}
              </p>
            </TableCell>

            <TableCell>{category._count?.blocks ?? 0}</TableCell>
            <TableCell>{category._count?.orderItems ?? 0}</TableCell>
            <TableCell>{category._count?.measurementFields ?? 0}</TableCell>

            <TableCell className="px-4 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open category actions</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(category)}>
                    <Eye className="size-4" />
                    View Details
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Pencil className="size-4" />
                    Edit Category
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={isDeleting}
                    onClick={() => onDelete(category)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
