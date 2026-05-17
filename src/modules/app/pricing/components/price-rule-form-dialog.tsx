import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, Ruler, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useMeasurementFieldsQuery } from "@/modules/app/measurements/api/useGetMeasurementsFieldsByCID";
import { usePackageTemplatesQuery } from "@/modules/app/package-templates/api/package-template-api";
import type {
  GarmentSet,
  PriceBook,
  PriceRule,
  PriceRulePayload,
  PricingMethod,
  PricingScope,
} from "../types/pricing.types";
import {
  useCreatePriceRule,
  useUpdatePriceRule,
} from "../api/pricing-api";

const none = "__none__";

const scopeOptions: Array<{ value: PricingScope; label: string }> = [
  { value: "PACKAGE", label: "Full kit" },
  { value: "PACKAGE_ITEM", label: "Package item" },
  { value: "ADDITIONAL_ITEM", label: "Extra item" },
  { value: "STANDALONE_ITEM", label: "Standalone item" },
];

const methodOptions: Array<{ value: PricingMethod; label: string }> = [
  { value: "FIXED", label: "Fixed price" },
  { value: "CHART", label: "Measurement chart" },
  { value: "SUM_OF_ITEMS", label: "Sum of items" },
  { value: "MANUAL", label: "Manual override" },
  { value: "FREE", label: "Free of charge" },
];

type PriceRuleForm = {
  priceBookId: string;
  garmentSetId: string;
  packageTemplateId: string;
  packageTemplateItemId: string;
  scope: PricingScope;
  method: PricingMethod;
  fixedPrice: string;
  priority: string;
  isActive: boolean;
  notes: string;
  measurementFieldIds: string[];
};

type FormErrors = Partial<Record<keyof PriceRuleForm, string>>;

export function PriceRuleFormDialog({
  open,
  priceRule,
  priceBooks,
  garmentSets,
  onOpenChange,
}: {
  open: boolean;
  priceRule?: PriceRule | null;
  priceBooks: PriceBook[];
  garmentSets: GarmentSet[];
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(priceRule?.id);
  const createPriceRule = useCreatePriceRule();
  const updatePriceRule = useUpdatePriceRule();
  const isPending = createPriceRule.isPending || updatePriceRule.isPending;
  const packageTemplatesQuery = usePackageTemplatesQuery({ isActive: true });
  const measurementFieldsQuery = useMeasurementFieldsQuery({
    pageIndex: 0,
    pageSize: 100,
    isActive: true,
  });

  const [form, setForm] = useState<PriceRuleForm>(() =>
    getDefaultValues(priceRule, priceBooks),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(getDefaultValues(priceRule, priceBooks));
      setErrors({});
    }
  }, [open, priceRule, priceBooks]);

  const packageTemplates = packageTemplatesQuery.data ?? [];
  const packageItems = useMemo(
    () =>
      packageTemplates.flatMap((template) =>
        template.items.map((item) => ({
          ...item,
          label: `${item.itemDescription} · ${template.name}`,
        })),
      ),
    [packageTemplates],
  );
  const measurementFields = Array.isArray(measurementFieldsQuery.data)
    ? measurementFieldsQuery.data
    : measurementFieldsQuery.data?.data ?? [];

  const payload = useMemo<PriceRulePayload>(
    () => ({
      priceBookId: form.priceBookId,
      garmentSetId: cleanOptional(form.garmentSetId),
      packageTemplateId: cleanOptional(form.packageTemplateId),
      packageTemplateItemId: cleanOptional(form.packageTemplateItemId),
      scope: form.scope,
      method: form.method,
      fixedPrice: form.fixedPrice ? Number(form.fixedPrice) : undefined,
      priority: Number(form.priority) || 0,
      isActive: form.isActive,
      notes: cleanOptional(form.notes),
      measurementFieldIds:
        form.method === "CHART" ? form.measurementFieldIds : undefined,
    }),
    [form],
  );

  const handleSubmit = async () => {
    const nextErrors = validatePriceRule(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (isEdit && priceRule?.id) {
      await updatePriceRule.mutateAsync({ id: priceRule.id, payload });
    } else {
      await createPriceRule.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  const showPackageTemplate = form.scope === "PACKAGE";
  const showPackageItem =
    form.scope === "PACKAGE_ITEM" || form.scope === "ADDITIONAL_ITEM";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg border-slate-200 p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Ruler className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-950">
                {isEdit ? "Edit Price Rule" : "Create Price Rule"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500">
                Choose what garment item this rule prices and how Helora should
                calculate it.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-152px)] overflow-y-auto bg-slate-50 p-5">
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Price book" error={errors.priceBookId} required>
                  <Select
                    value={form.priceBookId || none}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        priceBookId: value === none ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                      <SelectValue placeholder="Select price book" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value={none}>Select price book</SelectItem>
                      {priceBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Garment set" error={errors.garmentSetId}>
                  <Select
                    value={form.garmentSetId || none}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        garmentSetId: value === none ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                      <SelectValue placeholder="Optional garment set" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value={none}>No garment set</SelectItem>
                      {garmentSets.map((set) => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.name} ({set.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Scope" error={errors.scope} required>
                  <Select
                    value={form.scope}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        scope: value as PricingScope,
                        packageTemplateId: "",
                        packageTemplateItemId: "",
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {scopeOptions.map((scope) => (
                        <SelectItem key={scope.value} value={scope.value}>
                          {scope.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Method" error={errors.method} required>
                  <Select
                    value={form.method}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        method: value as PricingMethod,
                        fixedPrice:
                          value === "FIXED" ? prev.fixedPrice : "",
                        measurementFieldIds:
                          value === "CHART" ? prev.measurementFieldIds : [],
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {methodOptions.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                {showPackageTemplate && (
                  <Field
                    label="Package"
                    error={errors.packageTemplateId}
                    required
                  >
                    <Select
                      value={form.packageTemplateId || none}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          packageTemplateId: value === none ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value={none}>Select package</SelectItem>
                        {packageTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {showPackageItem && (
                  <Field
                    label="Package item"
                    error={errors.packageTemplateItemId}
                    required
                  >
                    <Select
                      value={form.packageTemplateItemId || none}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          packageTemplateItemId: value === none ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value={none}>Select item</SelectItem>
                        {packageItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {form.method === "FIXED" && (
                  <Field label="Fixed price" error={errors.fixedPrice} required>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.fixedPrice}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          fixedPrice: event.target.value,
                        }))
                      }
                      placeholder="Example: 3500"
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                    />
                  </Field>
                )}

                <Field label="Priority" error={errors.priority}>
                  <Input
                    type="number"
                    value={form.priority}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        priority: event.target.value,
                      }))
                    }
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                  />
                </Field>
              </div>

              {form.method === "CHART" && (
                <div className="mt-4">
                  <Field
                    label="Measurement keys"
                    error={errors.measurementFieldIds}
                    required
                  >
                    <div className="grid max-h-52 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
                      {measurementFields.map((field) => {
                        const checked = form.measurementFieldIds.includes(
                          field.id,
                        );
                        return (
                          <label
                            key={field.id}
                            className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(nextChecked) =>
                                setForm((prev) => ({
                                  ...prev,
                                  measurementFieldIds: nextChecked
                                    ? [...prev.measurementFieldIds, field.id].slice(
                                        0,
                                        2,
                                      )
                                    : prev.measurementFieldIds.filter(
                                        (id) => id !== field.id,
                                      ),
                                }))
                              }
                            />
                            <span className="min-w-0 truncate">
                              {field.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              )}

              <div className="mt-4">
                <Field label="Notes" error={errors.notes}>
                  <Textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    placeholder="Any manager note for this rule"
                    className="min-h-24 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                  />
                </Field>
              </div>

              <label className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                <Checkbox
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isActive: Boolean(checked) }))
                  }
                />
                Active for new price calculations
              </label>
            </section>
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
            {isEdit ? "Save Changes" : "Create Price Rule"}
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

function getDefaultValues(
  priceRule?: PriceRule | null,
  priceBooks: PriceBook[] = [],
): PriceRuleForm {
  return {
    priceBookId: priceRule?.priceBookId ?? priceBooks[0]?.id ?? "",
    garmentSetId: priceRule?.garmentSetId ?? "",
    packageTemplateId: priceRule?.packageTemplateId ?? "",
    packageTemplateItemId: priceRule?.packageTemplateItemId ?? "",
    scope: priceRule?.scope ?? "PACKAGE_ITEM",
    method: priceRule?.method ?? "FIXED",
    fixedPrice: priceRule?.fixedPrice ? String(priceRule.fixedPrice) : "",
    priority: String(priceRule?.priority ?? 0),
    isActive: priceRule?.isActive ?? true,
    notes: priceRule?.notes ?? "",
    measurementFieldIds:
      priceRule?.measurementKeys?.map((key) => key.field.id) ?? [],
  };
}

function validatePriceRule(form: PriceRuleForm): FormErrors {
  const errors: FormErrors = {};

  if (!form.priceBookId) errors.priceBookId = "Price book is required.";

  if (form.scope === "PACKAGE" && !form.packageTemplateId) {
    errors.packageTemplateId = "Package is required for full kit pricing.";
  }

  if (
    (form.scope === "PACKAGE_ITEM" || form.scope === "ADDITIONAL_ITEM") &&
    !form.packageTemplateItemId
  ) {
    errors.packageTemplateItemId = "Package item is required.";
  }

  if (
    !form.packageTemplateId &&
    !form.packageTemplateItemId &&
    !form.garmentSetId
  ) {
    errors.garmentSetId = "Select a garment set, package, or package item.";
  }

  if (form.method === "FIXED") {
    if (!form.fixedPrice) errors.fixedPrice = "Fixed price is required.";
    if (Number(form.fixedPrice) < 0) {
      errors.fixedPrice = "Fixed price cannot be negative.";
    }
  }

  if (form.method === "CHART" && !form.measurementFieldIds.length) {
    errors.measurementFieldIds = "Select one or two measurement keys.";
  }

  if (!Number.isFinite(Number(form.priority))) {
    errors.priority = "Priority must be a number.";
  }

  return errors;
}

function cleanOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}
