import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  PriceBook,
  PriceBookPayload,
  PriceBookStatus,
} from "../types/pricing.types";
import {
  useCreatePriceBook,
  useUpdatePriceBook,
} from "../api/pricing-api";

const statusOptions: PriceBookStatus[] = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
];

type PriceBookForm = {
  name: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: PriceBookStatus;
};

type FormErrors = Partial<Record<keyof PriceBookForm, string>>;

export function PriceBookFormDialog({
  open,
  priceBook,
  onOpenChange,
}: {
  open: boolean;
  priceBook?: PriceBook | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(priceBook?.id);
  const createPriceBook = useCreatePriceBook();
  const updatePriceBook = useUpdatePriceBook();
  const isPending = createPriceBook.isPending || updatePriceBook.isPending;
  const [form, setForm] = useState<PriceBookForm>(() =>
    getDefaultValues(priceBook),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(getDefaultValues(priceBook));
      setErrors({});
    }
  }, [open, priceBook]);

  const title = isEdit ? "Edit Price Book" : "Create Price Book";

  const payload = useMemo<PriceBookPayload>(
    () => ({
      name: form.name.trim(),
      description: cleanOptional(form.description),
      effectiveFrom: cleanOptional(form.effectiveFrom),
      effectiveTo: cleanOptional(form.effectiveTo),
      status: form.status,
    }),
    [form],
  );

  const handleSubmit = async () => {
    const nextErrors = validatePriceBook(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (isEdit && priceBook?.id) {
      await updatePriceBook.mutateAsync({ id: priceBook.id, payload });
    } else {
      await createPriceBook.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg border-slate-200 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-950">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500">
                Manage the price list used for new garment calculations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-152px)] overflow-y-auto bg-slate-50 p-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="grid gap-4">
              <Field label="Name" error={errors.name} required>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Example: 2026 NTS Uniform Prices"
                  className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                />
              </Field>

              <Field label="Description" error={errors.description}>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Short note for this price book"
                  className="min-h-24 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Effective from" error={errors.effectiveFrom}>
                  <Input
                    type="date"
                    value={form.effectiveFrom}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        effectiveFrom: event.target.value,
                      }))
                    }
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                  />
                </Field>

                <Field label="Effective to" error={errors.effectiveTo}>
                  <Input
                    type="date"
                    value={form.effectiveTo}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        effectiveTo: event.target.value,
                      }))
                    }
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                  />
                </Field>

                <Field label="Status" error={errors.status} required>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        status: value as PriceBookStatus,
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {labelize(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4">
          <Button
            variant="ghost"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleSubmit}
            className="rounded-lg"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? "Save Changes" : "Create Price Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label className="font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}

function getDefaultValues(priceBook?: PriceBook | null): PriceBookForm {
  return {
    name: priceBook?.name ?? "",
    description: priceBook?.description ?? "",
    effectiveFrom: toDateInput(priceBook?.effectiveFrom),
    effectiveTo: toDateInput(priceBook?.effectiveTo),
    status: priceBook?.status ?? "DRAFT",
  };
}

function validatePriceBook(form: PriceBookForm): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }

  if (
    form.effectiveFrom &&
    form.effectiveTo &&
    new Date(form.effectiveTo) < new Date(form.effectiveFrom)
  ) {
    errors.effectiveTo = "Effective to must be after effective from.";
  }

  return errors;
}

function cleanOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function labelize(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
