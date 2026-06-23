"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Blocks,
  CheckCircle2,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { CustomerStatCard } from "@/components/common/customer-stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";
import { useGetBlocks } from "./api/useGetBlocks";
import { useGetCategories } from "./api/useGetCategories";
import { BlockDetailsDialog } from "./components/block-details-dialog";
import { BlocksTable } from "./components/blocks-table";
import { CreateBlockDialog } from "./components/create-block-dialog";
import {
  EditBlockCustomersDialog,
  EditBlockDialog,
} from "./components/edit-block-customers-dialog";

const PAGE_SIZE = 10;

const blockStatusOptions = [
  { value: "all", label: "All statuses" },
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
  const [selectedAssignmentBlockId, setSelectedAssignmentBlockId] = useState<
    string | null
  >(null);
  const [assignCustomersOpen, setAssignCustomersOpen] = useState(false);

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetCategories();

  const categories = categoriesResponse?.data ?? [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    includeCounts: true,
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

  const blocksList = useMemo(
    () => blocksResponse?.data.items ?? [],
    [blocksResponse?.data.items],
  );

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
    const customerAssignments = blocksList.reduce(
      (total, block) => total + (block._count?.customerBlocks ?? 0),
      0,
    );

    const orderUsage = blocksList.reduce(
      (total, block) => total + (block._count?.orderItems ?? 0),
      0,
    );

    return {
      totalBlocks: pagination.totalItems,
      activeBlocks:
        activeBlocksResponse?.data.pagination.totalItems ??
        blocksList.filter((block) => block.status === "ACTIVE").length,
      customerAssignments,
      orderUsage,
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

  return (
    <PermissionGate action="read" subject="blocks">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Blocks"
              description="Manage reusable garment blocks, customer assignments, measurements, and order usage."
              actions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isLoading || isFetching}
                  >
                    <RefreshCw
                      className={cn("size-4", isFetching && "animate-spin")}
                    />
                    Refresh
                  </Button>

                  <PermissionGate action="create" subject="blocks">
                    <Button type="button" onClick={() => setAddBlockOpen(true)}>
                      <Plus className="size-4" />
                      Add Block
                    </Button>
                  </PermissionGate>
                </>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CustomerStatCard
                title="Total Blocks"
                value={stats.totalBlocks}
                description="All reusable blocks"
                icon={Blocks}
              />

              <CustomerStatCard
                title="Active Blocks"
                value={stats.activeBlocks}
                description="Blocks ready for use"
                icon={CheckCircle2}
              />

              <CustomerStatCard
                title="Customer Assignments"
                value={stats.customerAssignments}
                description="Assignments on this page"
                icon={UsersRound}
              />

              <CustomerStatCard
                title="Order Usage"
                value={stats.orderUsage}
                description="Order items on this page"
                icon={PackageCheck}
              />
            </div>

            <Card className="gap-0">
              <CardHeader className="gap-0 border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Block Directory</CardTitle>
                    <CardDescription>
                      View block specifications, assignments,
                    </CardDescription>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search blocks..."
                        className="bg-background pl-9"
                      />
                    </div>

                    <Select
                      value={categoryId}
                      onValueChange={(value) => {
                        setCategoryId(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-44">
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

                    <Select
                      value={status}
                      onValueChange={(value) => {
                        setStatus(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-40">
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
                      >
                        Clear
                      </Button>
                    )}
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
                  <BlocksLoadingState />
                ) : (
                  <BlocksTable
                    blocks={blocksList}
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalCount={pagination.totalItems}
                    onPageChange={setCurrentPage}
                    onViewBlock={handleViewBlock}
                    onEditBlock={(blockId) => {
                      setSelectedEditBlockId(blockId);
                      setEditBlockOpen(true);
                    }}
                    onAssignCustomers={(blockId) => {
                      setSelectedAssignmentBlockId(blockId);
                      setAssignCustomersOpen(true);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <CreateBlockDialog
          open={addBlockOpen}
          onOpenChange={setAddBlockOpen}
          onCreated={handleBlockCreated}
        />

        <BlockDetailsDialog
          blockId={blockSearch.viewBlockId ?? null}
          open={Boolean(blockSearch.viewBlockId)}
          onManageAssignments={(blockId) => {
            handleCloseBlockDetails();
            setSelectedAssignmentBlockId(blockId);
            setAssignCustomersOpen(true);
          }}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseBlockDetails();
            }
          }}
        />

        <EditBlockDialog
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

        <EditBlockCustomersDialog
          blockId={selectedAssignmentBlockId}
          open={assignCustomersOpen}
          onOpenChange={(open) => {
            setAssignCustomersOpen(open);

            if (!open) {
              setSelectedAssignmentBlockId(null);
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

function BlocksLoadingState() {
  return (
    <div className="grid gap-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-16" />
      ))}
    </div>
  );
}
