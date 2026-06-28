"use client";

import * as React from "react";
import { Loader2, Package2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useGetCategories } from "@/api/useGetCategories";
import type { OrderItemType, PriceSource } from "@/api/useCreateOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import {
  useCreatePackageTemplate,
  useUpdatePackageTemplate,
  type PackageTemplate,
} from "../api/package-template-api";
import type {
  EditablePackageTemplate,
  EditablePackageTemplateItem,
} from "../types/package-template-form.types";
import { PRICE_SOURCE_OPTIONS } from "../types/package-template-form.types";
import {
  emptyPackageTemplate,
  emptyPackageTemplateItem,
  toEditablePackageTemplate,
  toPackageTemplatePayload,
} from "../utils/package-template-form.utils";

type PackageTemplateDialogProps = {
  open: boolean;
  template: PackageTemplate | null;
  onClose: () => void;
};

export function PackageTemplateDialog({
  open,
  template,
  onClose,
}: PackageTemplateDialogProps) {
  const [editing, setEditing] = React.useState<EditablePackageTemplate>(() =>
    emptyPackageTemplate(),
  );

  const { data: categories = [] } = useGetCategories();
  const createTemplate = useCreatePackageTemplate();
  const updateTemplate = useUpdatePackageTemplate();

  const isSaving = createTemplate.isPending || updateTemplate.isPending;
  const isEditing = Boolean(template?.id);

  const activeCategories = React.useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setEditing(
        template ? toEditablePackageTemplate(template) : emptyPackageTemplate(),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [open, template]);

  const updateTemplateField = (patch: Partial<EditablePackageTemplate>) => {
    setEditing((previous) => ({ ...previous, ...patch }));
  };

  const updateItem = (
    index: number,
    patch: Partial<EditablePackageTemplateItem>,
  ) => {
    setEditing((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const addItem = () => {
    setEditing((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        emptyPackageTemplateItem(previous.items.length + 1),
      ],
    }));
  };

  const removeItem = (index: number) => {
    setEditing((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index),
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

    const payload = toPackageTemplatePayload(editing);

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
        error instanceof Error
          ? error.message
          : "Garment set could not be saved.";

      toast.error(message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        side="right"
        className="flex h-dvh max-h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl xl:max-w-3xl"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <div className="flex items-start gap-3">
           
            <div className="min-w-0">
              <SheetTitle className="text-lg">
                {isEditing ? "Edit Garment Set" : "New Garment Set"}
              </SheetTitle>

              
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-5 px-6 py-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Set Details</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="package-template-name">Set Name</Label>
                  <Input
                    id="package-template-name"
                    value={editing.name}
                    onChange={(event) =>
                      updateTemplateField({ name: event.target.value })
                    }
                    placeholder="Nurse Full Kit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package-template-price">Package Price</Label>
                  <Input
                    id="package-template-price"
                    value={editing.packagePrice}
                    onChange={(event) =>
                      updateTemplateField({
                        packagePrice: Number(event.target.value || 0),
                      })
                    }
                    type="number"
                    min={0}
                  />
                </div>

                <div className="flex items-end">
                  <Label className="flex h-9 items-center gap-2">
                    <Checkbox
                      checked={editing.isActive}
                      onCheckedChange={(checked) =>
                        updateTemplateField({ isActive: checked === true })
                      }
                    />
                    Active
                  </Label>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="package-template-description">
                    Description
                  </Label>
                  <Textarea
                    id="package-template-description"
                    value={editing.description}
                    onChange={(event) =>
                      updateTemplateField({ description: event.target.value })
                    }
                    placeholder="Blouse, trouser, cap, belt and apron."
                    className="min-h-24 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card >
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div>
                  <CardTitle className="text-base">Set Items</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add each garment, accessory, or service included in this
                    set.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="size-4" />
                  Item
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                {editing.items.map((item, index) => (
                  <PackageTemplateItemFields
                    key={index}
                    item={item}
                    index={index}
                    canRemove={editing.items.length > 1}
                    categories={activeCategories}
                    onUpdate={(patch) => updateItem(index, patch)}
                    onRemove={() => removeItem(index)}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <SheetFooter className="shrink-0 border-t bg-background px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button type="button" disabled={isSaving} onClick={handleSave}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Package2 className="size-4" />
            )}
            Save Garment Set
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PackageTemplateItemFields({
  item,
  index,
  canRemove,
  categories,
  onUpdate,
  onRemove,
}: {
  item: EditablePackageTemplateItem;
  index: number;
  canRemove: boolean;
  categories: Array<{ id: string; name: string }>;
  onUpdate: (patch: Partial<EditablePackageTemplateItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Item {index + 1}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Configure item type, quantity, price, and optional status.
          </p>
        </div>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Remove item {index + 1}</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={item.itemType}
            onValueChange={(value) =>
              onUpdate({
                itemType: value as OrderItemType,
                categoryId: value === "GARMENT" ? item.categoryId : "",
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="GARMENT">Garment</SelectItem>
              <SelectItem value="ACCESSORY">Accessory</SelectItem>
              <SelectItem value="SERVICE">Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={item.categoryId || undefined}
            disabled={item.itemType !== "GARMENT"}
            onValueChange={(value) => onUpdate({ categoryId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  item.itemType === "GARMENT"
                    ? "Select garment part"
                    : "No category required"
                }
              />
            </SelectTrigger>

            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`package-template-item-${index}-quantity`}>Qty</Label>
          <Input
            id={`package-template-item-${index}-quantity`}
            value={item.defaultQuantity}
            onChange={(event) =>
              onUpdate({ defaultQuantity: Number(event.target.value || 1) })
            }
            type="number"
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`package-template-item-${index}-price`}>
            Default Price
          </Label>
          <Input
            id={`package-template-item-${index}-price`}
            value={item.defaultUnitPrice}
            onChange={(event) =>
              onUpdate({ defaultUnitPrice: Number(event.target.value || 0) })
            }
            type="number"
            min={0}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`package-template-item-${index}-description`}>
            Item Description
          </Label>
          <Input
            id={`package-template-item-${index}-description`}
            value={item.itemDescription}
            onChange={(event) =>
              onUpdate({ itemDescription: event.target.value })
            }
            placeholder="Blouse, trouser, cap..."
          />
        </div>

        <div className="space-y-2">
          <Label>Price Source</Label>
          <Select
            value={item.priceSource}
            onValueChange={(value) =>
              onUpdate({ priceSource: value as PriceSource })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select price source" />
            </SelectTrigger>

            <SelectContent>
              {PRICE_SOURCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Label className="flex h-9 items-center gap-2">
            <Checkbox
              checked={item.isOptional}
              onCheckedChange={(checked) =>
                onUpdate({ isOptional: checked === true })
              }
            />
            Optional item
          </Label>
        </div>
      </div>
    </div>
  );
}
