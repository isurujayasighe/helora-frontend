import { useEffect, type ElementType } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  ClipboardList,
  FolderPlus,
  HelpCircle,
  Loader2,
  Ruler,
  Save,
  Shirt,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export function CategoryFormDialog({ open, category, onClose }: Props) {
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-background px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">
              <FolderPlus className="size-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {isEdit ? "Edit Category" : "Add Category"}
                </DialogTitle>

                <Badge variant="secondary">
                  {isEdit ? "Update Record" : "New Record"}
                </Badge>
              </div>

              <DialogDescription className="mt-1 max-w-xl text-sm">
                {isEdit
                  ? "Update this garment category used across orders, blocks, and measurement setup."
                  : "Create a garment category such as Nurse Uniform, Saree, Blouse, or School Uniform."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(92vh-153px)]">
          <form
            id="category-form"
            className="space-y-5 bg-muted/30 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <Card className="shadow-sm">
              <CardHeader className="space-y-0 pb-4">
                <SectionTitle
                  icon={Shirt}
                  title="Category details"
                  description="This category will be available when creating orders, blocks, and measurement fields."
                />
              </CardHeader>

              <Separator />

              <CardContent className="space-y-5 pt-5">
                <form.Field
                  name="name"
                  children={(field) => (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="category-name">
                          Category name <span className="text-destructive">*</span>
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
                    </div>
                  )}
                />

                <form.Field
                  name="description"
                  children={(field) => (
                    <div className="grid gap-2">
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
                        Add a short note to help staff understand when to use
                        this category.
                      </p>
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            <Alert className="bg-background">
              <HelpCircle className="size-4" />
              <AlertTitle>How this category is used</AlertTitle>
              <AlertDescription>
                Categories help Helora organize garment workflows across orders,
                reusable blocks, and measurement configuration.
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-3">
              <UsageCard
                icon={ShoppingBag}
                title="Orders"
                description="Selected when creating customer order items."
              />

              <UsageCard
                icon={ClipboardList}
                title="Blocks"
                description="Used to group reusable garment fit records."
              />

              <UsageCard
                icon={Ruler}
                title="Measurements"
                description="Used to define category-specific fields."
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="border-t bg-background px-6 py-4">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Changes may affect future order and block setup."
                : "You can configure measurement fields after creating the category."}
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
                        <Save className="mr-2 size-4" />
                        {isEdit ? "Save Changes" : "Add Category"}
                      </>
                    )}
                  </Button>
                )}
              />
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>
    </div>
  );
}

function UsageCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
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