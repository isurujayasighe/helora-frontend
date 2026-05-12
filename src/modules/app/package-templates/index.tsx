"use client";

import * as React from "react";
import {
  CheckCircle2,
  Loader2,
  MoreVertical,
  Package2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useGetCategories } from "@/api/useGetCategories";
import type { OrderItemType, PriceSource } from "@/api/useCreateOrder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useCreatePackageTemplate,
  useDeactivatePackageTemplate,
  usePackageTemplatesQuery,
  useUpdatePackageTemplate,
  type PackageTemplate,
  type PackageTemplatePayload,
} from "./api/package-template-api";

type EditableItem = {
  itemType: OrderItemType;
  categoryId: string;
  itemDescription: string;
  defaultQuantity: number;
  defaultUnitPrice: number;
  priceSource: PriceSource;
  isOptional: boolean;
  sortOrder: number;
  notes: string;
};

type EditableTemplate = {
  id?: string;
  name: string;
  description: string;
  packagePrice: number;
  isActive: boolean;
  items: EditableItem[];
};

const PRICE_SOURCE_OPTIONS: Array<{ value: PriceSource; label: string }> = [
  { value: "PACKAGE_INCLUDED_ITEM", label: "Included in package" },
  { value: "ADDITIONAL_ITEM_PRICE", label: "Additional item price" },
  { value: "FIXED_ITEM_PRICE", label: "Fixed item price" },
  { value: "MEASUREMENT_CHART_PRICE", label: "Measurement chart" },
  { value: "FREE_OF_CHARGE", label: "Free of charge" },
];

function emptyItem(sortOrder = 1): EditableItem {
  return {
    itemType: "GARMENT",
    categoryId: "",
    itemDescription: "",
    defaultQuantity: 1,
    defaultUnitPrice: 0,
    priceSource: "PACKAGE_INCLUDED_ITEM",
    isOptional: false,
    sortOrder,
    notes: "",
  };
}

function emptyTemplate(): EditableTemplate {
  return {
    name: "",
    description: "",
    packagePrice: 0,
    isActive: true,
    items: [emptyItem()],
  };
}

function toEditableTemplate(template: PackageTemplate): EditableTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    packagePrice: Number(template.packagePrice ?? 0),
    isActive: template.isActive,
    items: template.items.map((item) => ({
      itemType: item.itemType,
      categoryId: item.categoryId ?? "",
      itemDescription: item.itemDescription,
      defaultQuantity: item.defaultQuantity,
      defaultUnitPrice: Number(item.defaultUnitPrice ?? 0),
      priceSource: item.priceSource,
      isOptional: item.isOptional,
      sortOrder: item.sortOrder,
      notes: item.notes ?? "",
    })),
  };
}

function toPayload(form: EditableTemplate): PackageTemplatePayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    packagePrice: Number(form.packagePrice || 0),
    isActive: form.isActive,
    items: form.items.map((item, index) => ({
      itemType: item.itemType,
      categoryId:
        item.itemType === "GARMENT" ? item.categoryId || undefined : undefined,
      itemDescription: item.itemDescription.trim(),
      defaultQuantity: Number(item.defaultQuantity || 1),
      defaultUnitPrice: Number(item.defaultUnitPrice || 0),
      priceSource: item.priceSource,
      isOptional: item.isOptional,
      sortOrder: Number(item.sortOrder || index + 1),
      notes: item.notes.trim() || undefined,
    })),
  };
}

function formatMoney(value?: string | number | null) {
  return Number(value ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function PackageTemplatesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<PackageTemplate | null>(null);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const { data: templates = [], isLoading, isFetching, refetch } =
    usePackageTemplatesQuery({
      search: debouncedSearch || undefined,
    });
  const deactivateTemplate = useDeactivatePackageTemplate();

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const stats = React.useMemo(() => {
    const active = templates.filter((template) => template.isActive).length;
    const items = templates.reduce(
      (sum, template) => sum + template.items.length,
      0,
    );
    const optional = templates.reduce(
      (sum, template) =>
        sum + template.items.filter((item) => item.isOptional).length,
      0,
    );

    return {
      total: templates.length,
      active,
      items,
      optional,
    };
  }, [templates]);

  const openCreate = () => {
    setSelectedTemplate(null);
    setDialogOpen(true);
  };

  const openEdit = (template: PackageTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeactivate = async (template: PackageTemplate) => {
    const confirmed = window.confirm(
      `Deactivate ${template.name}? It will no longer appear as an active set in Order Builder.`,
    );

    if (!confirmed) return;

    try {
      await deactivateTemplate.mutateAsync(template.id);
      toast.success("Garment set deactivated.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Garment set could not be deactivated.";
      toast.error(message);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
      <div className="flex h-full flex-col gap-4 p-3 md:p-5">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <Package2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                Garment Sets
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Manage uniform packages and the garment or accessory items
                included in each set.
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
                className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")}
              />
              Refresh
            </Button>

            <Button
              type="button"
              onClick={openCreate}
              className="h-9 rounded-lg bg-slate-900 font-bold shadow-sm hover:bg-slate-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Set
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PackageStatCard
            title="Total Sets"
            value={stats.total}
            description="All configured packages"
            icon={Package2}
          />
          <PackageStatCard
            title="Active Sets"
            value={stats.active}
            description="Available in Order Builder"
            icon={CheckCircle2}
          />
          <PackageStatCard
            title="Set Items"
            value={stats.items}
            description="Garments and accessories"
            icon={Package2}
          />
          <PackageStatCard
            title="Optional Items"
            value={stats.optional}
            description="Customer selectable add-ons"
            icon={Plus}
          />
        </div>

        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
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
                    placeholder="Search set name or description..."
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-600 hover:bg-slate-100">
                  {templates.length} sets
                </Badge>
                {debouncedSearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-10 rounded-lg font-bold text-slate-500 hover:text-slate-900"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-black text-slate-950">
                  Set List
                </CardTitle>
                <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                  Use these sets when building uniform orders with multiple
                  parts.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent
            className={cn(
              "min-h-0 flex-1 overflow-auto p-0",
              isFetching && "opacity-70",
            )}
          >
            <PackageTemplateTable
              templates={templates}
              isLoading={isLoading}
              isDeactivating={deactivateTemplate.isPending}
              onCreate={openCreate}
              onEdit={openEdit}
              onDeactivate={handleDeactivate}
            />
          </CardContent>
        </Card>
      </div>

      <PackageTemplateDialog
        open={dialogOpen}
        template={selectedTemplate}
        onClose={closeDialog}
      />
    </div>
  );
}

function PackageStatCard({
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

function PackageTemplateTable({
  templates,
  isLoading,
  isDeactivating,
  onCreate,
  onEdit,
  onDeactivate,
}: {
  templates: PackageTemplate[];
  isLoading: boolean;
  isDeactivating: boolean;
  onCreate: () => void;
  onEdit: (template: PackageTemplate) => void;
  onDeactivate: (template: PackageTemplate) => void;
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

  if (!templates.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Package2 className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-950">
          No garment sets found
        </h3>
        <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
          Create sets like Nurse Full Kit or School Uniform Set, then add the
          garments and accessories that belong to each one.
        </p>
        <Button
          type="button"
          onClick={onCreate}
          className="mt-4 h-9 rounded-lg bg-slate-900 font-bold hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Set
        </Button>
      </div>
    );
  }

  return (
    <Table className="min-w-245">
      <TableHeader className="bg-slate-50">
        <TableRow className="hover:bg-slate-50">
          <TableHead className="text-slate-500">Garment Set</TableHead>
          <TableHead className="text-slate-500">Package Price</TableHead>
          <TableHead className="text-slate-500">Included</TableHead>
          <TableHead className="text-slate-500">Optional</TableHead>
          <TableHead className="text-slate-500">Status</TableHead>
          <TableHead className="text-slate-500">Updated</TableHead>
          <TableHead className="w-14" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => {
          const includedItems = template.items.filter(
            (item) => !item.isOptional,
          );
          const optionalItems = template.items.filter((item) => item.isOptional);

          return (
            <TableRow key={template.id} className="hover:bg-slate-50">
              <TableCell className="max-w-[320px] px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEdit(template)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-sm font-black text-slate-950">
                    {template.name}
                  </p>
                  <p className="mt-1 line-clamp-2 whitespace-normal text-xs font-semibold leading-5 text-slate-500">
                    {template.description || "No description added"}
                  </p>
                </button>
              </TableCell>
              <TableCell className="px-4 py-3 text-sm font-black text-slate-900">
                Rs. {formatMoney(template.packagePrice)}
              </TableCell>
              <TableCell className="px-4 py-3">
                <ItemSummary items={includedItems} fallback="No included items" />
              </TableCell>
              <TableCell className="px-4 py-3">
                <ItemSummary items={optionalItems} fallback="No optional items" />
              </TableCell>
              <TableCell className="px-4 py-3">
                <Badge
                  className={cn(
                    "rounded-full",
                    template.isActive
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3 text-xs font-semibold text-slate-500">
                {formatDate(template.updatedAt)}
              </TableCell>
              <TableCell className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Set
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={isDeactivating || !template.isActive}
                      onClick={() => onDeactivate(template)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function ItemSummary({
  items,
  fallback,
}: {
  items: PackageTemplate["items"];
  fallback: string;
}) {
  if (!items.length) {
    return <span className="text-xs font-semibold text-slate-400">{fallback}</span>;
  }

  return (
    <div className="flex max-w-65 flex-wrap gap-1.5">
      {items.slice(0, 3).map((item) => (
        <Badge
          key={item.id}
          className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100"
        >
          {item.itemDescription}
        </Badge>
      ))}
      {items.length > 3 && (
        <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
          +{items.length - 3}
        </Badge>
      )}
    </div>
  );
}

function PackageTemplateDialog({
  open,
  template,
  onClose,
}: {
  open: boolean;
  template: PackageTemplate | null;
  onClose: () => void;
}) {
  const [editing, setEditing] = React.useState<EditableTemplate>(() =>
    emptyTemplate(),
  );
  const { data: categories = [] } = useGetCategories();
  const createTemplate = useCreatePackageTemplate();
  const updateTemplate = useUpdatePackageTemplate();

  const isSaving = createTemplate.isPending || updateTemplate.isPending;
  const isEditing = Boolean(template?.id);

  React.useEffect(() => {
    if (!open) return;
    setEditing(template ? toEditableTemplate(template) : emptyTemplate());
  }, [open, template]);

  const updateItem = (index: number, patch: Partial<EditableItem>) => {
    setEditing((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const validate = () => {
    if (!editing.name.trim()) {
      toast.error("Garment set name is required.");
      return false;
    }

    if (!editing.items.length) {
      toast.error("Add at least one package item.");
      return false;
    }

    const invalidItem = editing.items.findIndex((item) => {
      if (!item.itemDescription.trim()) return true;
      if (item.itemType === "GARMENT" && !item.categoryId) return true;
      return false;
    });

    if (invalidItem >= 0) {
      toast.error(
        `Complete description and garment category for item ${invalidItem + 1}.`,
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = toPayload(editing);

    try {
      if (editing.id) {
        await updateTemplate.mutateAsync({
          packageTemplateId: editing.id,
          payload,
        });
        toast.success("Garment set updated.");
      } else {
        await createTemplate.mutateAsync(payload);
        toast.success("Garment set created.");
      }

      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Garment set could not be saved.";
      toast.error(message);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden gap-0 rounded-lg p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3 pr-10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Package2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-black tracking-tight text-slate-950">
                {isEditing ? "Edit Garment Set" : "New Garment Set"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                Define the garments, accessories, optional add-ons, and default
                prices used in Order Builder.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-148px)] space-y-5 overflow-y-auto bg-slate-50/60 p-5">
          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 px-4 py-3">
              <CardTitle className="text-sm font-black text-slate-900">
                Set Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Set Name
                </label>
                <Input
                  value={editing.name}
                  onChange={(event) =>
                    setEditing((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1 rounded-lg"
                  placeholder="Nurse Full Kit"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Package Price
                </label>
                <Input
                  value={editing.packagePrice}
                  onChange={(event) =>
                    setEditing((previous) => ({
                      ...previous,
                      packagePrice: Number(event.target.value || 0),
                    }))
                  }
                  className="mt-1 rounded-lg"
                  type="number"
                  min={0}
                />
              </div>

              <label className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(event) =>
                    setEditing((previous) => ({
                      ...previous,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Active
              </label>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>
                <Textarea
                  value={editing.description}
                  onChange={(event) =>
                    setEditing((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1 min-h-20 rounded-lg"
                  placeholder="Blouse, trouser, cap, belt and apron."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-black text-slate-900">
                    Set Items
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                    Included items are added automatically. Optional items can
                    be selected by the order user.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() =>
                    setEditing((previous) => ({
                      ...previous,
                      items: [
                        ...previous.items,
                        emptyItem(previous.items.length + 1),
                      ],
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Item
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
              {editing.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Item {index + 1}
                    </p>
                    {editing.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() =>
                          setEditing((previous) => ({
                            ...previous,
                            items: previous.items.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <select
                      value={item.itemType}
                      onChange={(event) =>
                        updateItem(index, {
                          itemType: event.target.value as OrderItemType,
                          categoryId:
                            event.target.value === "GARMENT"
                              ? item.categoryId
                              : "",
                        })
                      }
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                    >
                      <option value="GARMENT">Garment</option>
                      <option value="ACCESSORY">Accessory</option>
                      <option value="SERVICE">Service</option>
                    </select>

                    <select
                      value={item.categoryId}
                      disabled={item.itemType !== "GARMENT"}
                      onChange={(event) =>
                        updateItem(index, { categoryId: event.target.value })
                      }
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        {item.itemType === "GARMENT"
                          ? "Select garment part"
                          : "No category required"}
                      </option>
                      {categories
                        .filter((category) => category.isActive)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>

                    <Input
                      value={item.defaultQuantity}
                      onChange={(event) =>
                        updateItem(index, {
                          defaultQuantity: Number(event.target.value || 1),
                        })
                      }
                      className="rounded-lg"
                      type="number"
                      min={1}
                      placeholder="Qty"
                    />

                    <Input
                      value={item.defaultUnitPrice}
                      onChange={(event) =>
                        updateItem(index, {
                          defaultUnitPrice: Number(event.target.value || 0),
                        })
                      }
                      className="rounded-lg"
                      type="number"
                      min={0}
                      placeholder="Default price"
                    />

                    <Input
                      value={item.itemDescription}
                      onChange={(event) =>
                        updateItem(index, {
                          itemDescription: event.target.value,
                        })
                      }
                      className="rounded-lg sm:col-span-2"
                      placeholder="Blouse, Trouser, Cap..."
                    />

                    <select
                      value={item.priceSource}
                      onChange={(event) =>
                        updateItem(index, {
                          priceSource: event.target.value as PriceSource,
                        })
                      }
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                    >
                      {PRICE_SOURCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.isOptional}
                        onChange={(event) =>
                          updateItem(index, {
                            isOptional: event.target.checked,
                          })
                        }
                      />
                      Optional item
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-lg font-bold"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-slate-900 font-bold hover:bg-slate-800"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Package2 className="mr-2 h-4 w-4" />
            )}
            Save Garment Set
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
