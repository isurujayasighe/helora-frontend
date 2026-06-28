import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus, HelpCircle, Loader2, Save, Shirt } from "lucide-react";
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-dvh max-h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted">
              <FolderPlus className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <SheetTitle className="text-lg">
                {isEdit ? "Edit Category" : "Add Category"}
              </SheetTitle>

              <SheetDescription className="mt-1 leading-5">
                {isEdit
                  ? "Update this garment category name and description."
                  : "Create a garment category like Nurse Uniform, Saree, Blouse, or School Uniform."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <form
            className="space-y-5 bg-muted/30 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <SectionTitle
                icon={Shirt}
                title="Category details"
                description="This category will be used for orders, blocks, and measurement fields."
              />

              <div className="mt-4 grid gap-4">
                <form.Field
                  name="name"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label>
                        Category name{" "}
                        <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Example: Nurse Uniform"
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
                      <Label>Description</Label>

                      <Textarea
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Example: Nurse Uniform Hospital"
                        className="min-h-28 resize-none bg-background"
                      />
                    </div>
                  )}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <SectionTitle
                icon={HelpCircle}
                title="How this is used"
                description="Categories help Helora organize garment work."
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoBox
                  title="Orders"
                  description="Used when creating order items."
                />
                <InfoBox
                  title="Blocks"
                  description="Used to group reusable fits."
                />
                <InfoBox
                  title="Measurements"
                  description="Used to define fields."
                />
              </div>
            </section>
          </form>
        </ScrollArea>

        <SheetFooter className="shrink-0 border-t bg-background px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
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
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      {isEdit ? "Save Changes" : "Add Category"}
                    </>
                  )}
                </Button>
              )}
            />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>

      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoBox({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
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
