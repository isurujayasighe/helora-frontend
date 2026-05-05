"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Eye,
  Hash,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Ruler,
  Search,
  Star,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type {
  MeasurementField,
  MeasurementInputType,
} from "./types/measurement-fields-types";

import { MeasurementFieldStatusBadge } from "./components/measurement-field-status-badge";
import { MeasurementFieldInputTypeBadge } from "./components/measurement-field-input-type-badge";
import { MeasurementFieldFormDialog } from "./components/measurement-field-form-dialog";
import { MeasurementFieldDetailsDialog } from "./components/measurement-field-details-dialog";
import { useDeleteMeasurementField } from "./api/measurement-api";
import { useMeasurementFieldsQuery } from "./api/useGetMeasurementsFieldsByCID";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const PAGE_SIZE = 10;

type InputTypeFilter = "ALL" | MeasurementInputType;
type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE";

const inputTypeFilters: Array<{ value: InputTypeFilter; label: string }> = [
  { value: "ALL", label: "All input types" },
  { value: "DECIMAL", label: "Decimal" },
  { value: "NUMBER", label: "Number" },
  { value: "TEXT", label: "Text" },
  { value: "SELECT", label: "Select" },
  { value: "MULTI_SELECT", label: "Multi Select" },
  { value: "BOOLEAN", label: "Yes / No" },
];

const activeFilters: Array<{ value: ActiveFilter; label: string }> = [
  { value: "ALL", label: "All status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function MeasurementFieldsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [inputTypeFilter, setInputTypeFilter] =
    useState<InputTypeFilter>("ALL");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<MeasurementField | null>(
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
  }, [debouncedSearch, categoryId, inputTypeFilter, activeFilter]);

  const { data, isLoading, isFetching, refetch } = useMeasurementFieldsQuery({
    pageIndex,
    pageSize,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    inputType: inputTypeFilter === "ALL" ? undefined : inputTypeFilter,
    isActive:
      activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE",
  });

  const deleteField = useDeleteMeasurementField();

  const fields = data ?? [];
  const pagination = data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const pageCount = Math.max(1, pagination?.totalPages ?? 1);

  const stats = useMemo(() => {
    const active = fields.filter((item) => item.isActive).length;
    const required = fields.filter((item) => item.isRequired).length;
    const decimal = fields.filter((item) => item.inputType === "DECIMAL").length;

    return {
      total,
      active,
      required,
      decimal,
    };
  }, [fields, total]);

  const openCreate = () => {
    setSelectedField(null);
    setFormOpen(true);
  };

  const openEdit = (field: MeasurementField) => {
    setSelectedField(field);
    setFormOpen(true);
  };

  const openDetails = (field: MeasurementField) => {
    setSelectedField(field);
    setDetailsOpen(true);
  };

  const handleDelete = async (field: MeasurementField) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${field.label}?`
    );

    if (!confirmed) return;

    await deleteField.mutateAsync(field.id);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryId("");
    setInputTypeFilter("ALL");
    setActiveFilter("ALL");
    setPageIndex(0);
  };

  const hasFilters = Boolean(
    debouncedSearch ||
      categoryId ||
      inputTypeFilter !== "ALL" ||
      activeFilter !== "ALL"
  );

  return (
    <PermissionGate action="read" subject="measurements">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-measurement-fields"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <Ruler className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Measurement Fields
                  </h1>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Manage category-wise fields like Chest, Waist, Length, Size,
                    and Shoulder.
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
                  Add Field
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MeasurementStatCard
                title="Total Fields"
                value={stats.total}
                description="All measurement definitions"
                icon={Ruler}
              />

              <MeasurementStatCard
                title="Active Fields"
                value={stats.active}
                description="Visible during measurement entry"
                icon={CheckCircle2}
              />

              <MeasurementStatCard
                title="Required Fields"
                value={stats.required}
                description="Must be filled by staff"
                icon={Star}
              />

              <MeasurementStatCard
                title="Decimal Fields"
                value={stats.decimal}
                description="Fields using inch or cm values"
                icon={Hash}
              />
            </div>

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
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search field label, code, help text..."
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
                        Input Type
                      </label>

                      <Select
                        value={inputTypeFilter}
                        onValueChange={(value) =>
                          setInputTypeFilter(value as InputTypeFilter)
                        }
                      >
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {inputTypeFilters.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Status
                      </label>

                      <Select
                        value={activeFilter}
                        onValueChange={(value) =>
                          setActiveFilter(value as ActiveFilter)
                        }
                      >
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {activeFilters.map((item) => (
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

                    {inputTypeFilter !== "ALL" && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Type: {formatInputType(inputTypeFilter)}
                      </Badge>
                    )}

                    {activeFilter !== "ALL" && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600"
                      >
                        Status: {activeFilter === "ACTIVE" ? "Active" : "Inactive"}
                      </Badge>
                    )}

                    {hasFilters && (
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
                      Measurement Field List
                    </CardTitle>

                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      Configure what measurements are shown for each garment
                      category.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {total} fields
                  </Badge>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "min-h-0 flex-1 overflow-auto p-0",
                  isFetching && "opacity-70"
                )}
              >
                <MeasurementFieldsTable
                  fields={fields}
                  isLoading={isLoading}
                  onView={openDetails}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteField.isPending}
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

        <MeasurementFieldFormDialog
          open={formOpen}
          field={selectedField}
          onClose={() => {
            setFormOpen(false);
            setSelectedField(null);
          }}
        />

        <MeasurementFieldDetailsDialog
          open={detailsOpen}
          field={selectedField}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedField(null);
          }}
        />
      </div>
    </PermissionGate>
  );
}

function MeasurementStatCard({
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

function MeasurementFieldsTable({
  fields,
  isLoading,
  isDeleting,
  onView,
  onEdit,
  onDelete,
}: {
  fields: MeasurementField[];
  isLoading: boolean;
  isDeleting?: boolean;
  onView: (field: MeasurementField) => void;
  onEdit: (field: MeasurementField) => void;
  onDelete: (field: MeasurementField) => void;
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

  if (!fields.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Ruler className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-950">
          No measurement fields found
        </h3>

        <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
          Add fields like Chest, Waist, Length, Shoulder, or Size to start
          building category-wise measurement templates.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-262.5">
      <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_0.9fr_0.9fr_70px] border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
        <div>Field</div>
        <div>Category</div>
        <div>Input</div>
        <div>Unit</div>
        <div>Order</div>
        <div>Status</div>
        <div />
      </div>

      {fields.map((field) => (
        <div
          key={field.id}
          className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_0.9fr_0.9fr_70px] items-center border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50"
        >
          <button
            type="button"
            onClick={() => onView(field)}
            className="min-w-0 text-left"
          >
            <p className="truncate font-black text-slate-950">{field.label}</p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500">
              {field.code}
            </p>
          </button>

          <div>
            <p className="font-bold text-slate-800">
              {field.category?.name || "Category"}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500">
              {field.categoryId}
            </p>
          </div>

          <MeasurementFieldInputTypeBadge inputType={field.inputType} />

          <p className="font-bold text-slate-800">
            {field.unit || "No unit"}
          </p>

          <p className="font-bold text-slate-800">{field.sortOrder}</p>

          <MeasurementFieldStatusBadge
            isActive={field.isActive}
            isRequired={field.isRequired}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(field)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onEdit(field)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Field
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={isDeleting}
                onClick={() => onDelete(field)}
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

function formatInputType(value: string) {
  const map: Record<string, string> = {
    TEXT: "Text",
    NUMBER: "Number",
    DECIMAL: "Decimal",
    SELECT: "Select",
    MULTI_SELECT: "Multi Select",
    BOOLEAN: "Yes / No",
  };

  return map[value] ?? value;
}