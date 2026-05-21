import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FolderPlus,
  HelpCircle,
  Loader2,
  Save,
  Shirt,
} from "lucide-react";
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
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-2xl gap-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <FolderPlus className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-xl font-black tracking-tight text-slate-950">
                {isEdit ? "Edit Category" : "Add Category"}
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                {isEdit
                  ? "Update this garment category name and description."
                  : "Create a garment category like Nurse Uniform, Saree, Blouse, or School Uniform."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto bg-slate-50 p-5">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
                      <Label className="font-bold text-slate-700">
                        Category name <span className="text-red-500">*</span>
                      </Label>

                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Example: Nurse Uniform"
                        className={cn(
                          "h-11 rounded-lg bg-slate-50 text-sm font-semibold shadow-none",
                          field.state.meta.errors.length &&
                            "border-red-500 focus-visible:ring-red-500"
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
                      <Label className="font-bold text-slate-700">
                        Description
                      </Label>

                      <Textarea
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Example: Nurse Uniform Hospital"
                        className="min-h-28 rounded-lg bg-slate-50 text-sm font-semibold shadow-none"
                      />
                    </div>
                  )}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={HelpCircle}
                title="How this is used"
                description="Categories help Helora organize garment work."
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoBox title="Orders" description="Used when creating order items." />
                <InfoBox title="Blocks" description="Used to group reusable fits." />
                <InfoBox title="Measurements" description="Used to define fields." />
              </div>
            </section>
          </form>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="h-11 rounded-lg font-bold"
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
                  className="h-11 rounded-lg font-bold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEdit ? "Save Changes" : "Add Category"}
                    </>
                  )}
                </Button>
              )}
            />
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
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-black text-slate-900">{title}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors.length) return null;

  return (
    <p className="text-sm font-semibold text-red-600">
      {errors.join(", ")}
    </p>
  );
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
