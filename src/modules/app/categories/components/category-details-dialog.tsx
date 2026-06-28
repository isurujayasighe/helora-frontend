import { useEffect, type ElementType } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  ClipboardList,
  Loader2,
  Pencil,
  Ruler,
  Save,
  ShoppingBag,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import type { Category, CreateCategoryPayload } from "../types/category.types";
import { useCreateCategory, useUpdateCategory } from "../api/category-api";

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string(),
});

interface Props {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
}

export function CategoryDetailsDialog({ open, category, onClose }: Props) {
  const isEdit = Boolean(category?.id);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isPending = createCategory.isPending || updateCategory.isPending;

  const form = useForm({
    defaultValues: getDefaultValues(category),
    validators: {
      onChange: categorySchema,
    },
    onSubmit: async ({ value }) => {
      const payload: CreateCategoryPayload = {
        name: value.name.trim(),
        description: cleanOptional(value.description),
      };

      if (isEdit && category?.id) {
        await updateCategory.mutateAsync({
          categoryId: category.id,
          payload,
        });
      } else {
        await createCategory.mutateAsync(payload);
      }

      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(category));
    }
  }, [open, category, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-dvh max-h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl"
      >
        <SheetHeader className="shrink-0 border-b bg-background px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <SheetTitle className="truncate text-xl font-semibold tracking-tight">
                  {isEdit ? "Edit Category" : "Add Category"}
                </SheetTitle>
              </div>

              <SheetDescription className="text-sm text-muted-foreground">
                {isEdit
                  ? "Update category details used across blocks, orders, and measurement configurations."
                  : "Create a new garment category for blocks, orders, and measurement configurations."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <form
            id="category-form"
            className="space-y-5 bg-muted/30 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <section className="rounded-xl border bg-card shadow-sm">
              <div className="flex items-start gap-3 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">
                        Category details
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Main information used when creating blocks, order items,
                        and measurement fields.
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid gap-4">
                    <form.Field
                      name="name"
                      children={(field) => (
                        <FormField>
                          <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="category-name">
                              Category Name{" "}
                              <span className="text-destructive">*</span>
                            </Label>

                            <span className="text-xs text-muted-foreground">
                              Required
                            </span>
                          </div>

                          <Input
                            id="category-name"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder="Example: Nurse Uniform"
                            disabled={isPending}
                            className={cn(
                              "h-11 bg-background",
                              field.state.meta.errors.length &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                          />

                          <FieldError errors={field.state.meta.errors} />
                        </FormField>
                      )}
                    />

                    <form.Field
                      name="description"
                      children={(field) => (
                        <FormField>
                          <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="category-description">
                              Description
                            </Label>

                            <span className="text-xs text-muted-foreground">
                              Optional
                            </span>
                          </div>

                          <Textarea
                            id="category-description"
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder="Example: Uniform category for hospital nurse staff."
                            disabled={isPending}
                            className="min-h-28 resize-none bg-background"
                          />

                          <p className="text-xs text-muted-foreground">
                            Add a short note to help staff understand when this
                            category should be selected.
                          </p>
                        </FormField>
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <SectionHeader
                title="How this category is used"
                description="Categories help Helora organize garment work across the main production workflow."
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <UsageCard
                  icon={ShoppingBag}
                  label="Orders"
                  description="Selected when creating customer order items."
                />

                <UsageCard
                  icon={ClipboardList}
                  label="Blocks"
                  description="Used to group reusable fit and block records."
                />

                <UsageCard
                  icon={Ruler}
                  label="Measurements"
                  description="Used to configure category-specific fields."
                />
              </div>
            </section>

            {isEdit ? (
              <section className="rounded-xl border bg-card p-5 shadow-sm">
                <SectionHeader
                  title="Edit impact"
                  description="Changing this category name will affect how it appears in future blocks, orders, and measurement setup."
                />
              </section>
            ) : null}
          </form>
        </ScrollArea>

        <SheetFooter className="shrink-0 border-t bg-background px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Changes may affect future blocks, orders, and measurement setup."
                : "Measurement fields can be configured after creating the category."}
            </p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                <X className="mr-2 size-4" />
                Cancel
              </Button>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="button"
                    onClick={form.handleSubmit}
                    disabled={!canSubmit || isSubmitting || isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {isEdit ? (
                          <Pencil className="mr-2 size-4" />
                        ) : (
                          <Save className="mr-2 size-4" />
                        )}
                        {isEdit ? "Save Changes" : "Add Category"}
                      </>
                    )}
                  </Button>
                )}
              />
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FormField({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}

function UsageCard({
  icon: Icon,
  label,
  description,
}: {
  icon: ElementType;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors.length) return null;

  return (
    <p className="text-sm font-medium text-destructive">
      {errors.map(formatFormError).join(", ")}
    </p>
  );
}

function formatFormError(error: unknown) {
  if (typeof error === "string") return error;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Invalid value";
}

function getDefaultValues(category?: Category | null) {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
  };
}

function cleanOptional(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}
