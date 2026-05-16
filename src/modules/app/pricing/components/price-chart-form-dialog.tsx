import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { FileSpreadsheet, Loader2, Plus, Save, Trash2 } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import type {
  PriceChart,
  PriceChartPayload,
  PriceRule,
} from "../types/pricing.types";
import {
  useCreatePriceChart,
  useUpdatePriceChart,
} from "../api/pricing-api";

const none = "__none__";

type CellForm = {
  measurement1From: string;
  measurement1To: string;
  measurement2From: string;
  measurement2To: string;
  price: string;
  notes: string;
};

type ChartForm = {
  priceRuleId: string;
  name: string;
  description: string;
  isActive: boolean;
  cells: CellForm[];
};

type FormErrors = {
  priceRuleId?: string;
  name?: string;
  cells?: string;
  cellErrors?: Record<number, Partial<Record<keyof CellForm, string>>>;
};

export function PriceChartFormDialog({
  open,
  priceChart,
  priceRules,
  onOpenChange,
}: {
  open: boolean;
  priceChart?: PriceChart | null;
  priceRules: PriceRule[];
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(priceChart?.id);
  const createPriceChart = useCreatePriceChart();
  const updatePriceChart = useUpdatePriceChart();
  const isPending = createPriceChart.isPending || updatePriceChart.isPending;
  const [form, setForm] = useState<ChartForm>(() =>
    getDefaultValues(priceChart, priceRules),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(getDefaultValues(priceChart, priceRules));
      setErrors({});
    }
  }, [open, priceChart, priceRules]);

  const selectedRule = priceRules.find((rule) => rule.id === form.priceRuleId);
  const measurementKeys = selectedRule?.measurementKeys ?? [];
  const isTwoAxis = measurementKeys.length >= 2;

  const payload = useMemo<PriceChartPayload>(
    () => ({
      priceRuleId: form.priceRuleId,
      name: form.name.trim(),
      description: cleanOptional(form.description),
      isActive: form.isActive,
      cells: form.cells.map((cell) => ({
        measurement1From: toOptionalNumber(cell.measurement1From),
        measurement1To: toOptionalNumber(cell.measurement1To),
        measurement2From: toOptionalNumber(cell.measurement2From),
        measurement2To: toOptionalNumber(cell.measurement2To),
        price: Number(cell.price),
        notes: cleanOptional(cell.notes),
      })),
    }),
    [form],
  );

  const handleSubmit = async () => {
    const nextErrors = validateChart(form);
    setErrors(nextErrors);
    if (
      nextErrors.priceRuleId ||
      nextErrors.name ||
      nextErrors.cells ||
      Object.keys(nextErrors.cellErrors ?? {}).length
    ) {
      return;
    }

    if (isEdit && priceChart?.id) {
      await updatePriceChart.mutateAsync({ id: priceChart.id, payload });
    } else {
      await createPriceChart.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg border-slate-200 p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-950">
                {isEdit ? "Edit Price Chart" : "Create Price Chart"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500">
                Add measurement ranges and prices for chart-based garments.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-152px)] overflow-y-auto bg-slate-50 p-5">
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Price rule" error={errors.priceRuleId} required>
                  <Select
                    value={form.priceRuleId || none}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        priceRuleId: value === none ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                      <SelectValue placeholder="Select chart rule" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value={none}>Select chart rule</SelectItem>
                      {priceRules.map((rule) => (
                        <SelectItem key={rule.id} value={rule.id}>
                          {rule.packageTemplateItem?.itemDescription ||
                            rule.packageTemplate?.name ||
                            rule.priceBook?.name ||
                            "Price rule"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Chart name" error={errors.name} required>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Example: Blouse bust and hip chart"
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Description">
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Short note for this chart"
                    className="min-h-20 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
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

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950">Chart cells</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {isTwoAxis
                      ? "Using two measurement axes for range matching."
                      : "Using one measurement axis for range matching."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      cells: [...prev.cells, emptyCell()],
                    }))
                  }
                  className="rounded-lg bg-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row
                </Button>
              </div>

              {errors.cells && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {errors.cells}
                </p>
              )}

              <div className="mt-4 overflow-x-auto">
                <div
                  className={
                    isTwoAxis
                      ? "min-w-225 space-y-2"
                      : "min-w-175 space-y-2"
                  }
                >
                  <div
                    className={
                      isTwoAxis
                        ? "grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1.4fr_48px] gap-2 text-xs font-semibold uppercase text-slate-400"
                        : "grid grid-cols-[1fr_1fr_1fr_1.4fr_48px] gap-2 text-xs font-semibold uppercase text-slate-400"
                    }
                  >
                    <span>{measurementKeys[0]?.field.label || "From"}</span>
                    <span>{measurementKeys[0]?.field.label || "To"}</span>
                    {isTwoAxis && (
                      <>
                        <span>{measurementKeys[1]?.field.label || "From"}</span>
                        <span>{measurementKeys[1]?.field.label || "To"}</span>
                      </>
                    )}
                    <span>Price</span>
                    <span>Notes</span>
                    <span />
                  </div>

                  {form.cells.map((cell, index) => {
                    const cellErrors = errors.cellErrors?.[index] ?? {};
                    return (
                      <div
                        key={index}
                        className={
                          isTwoAxis
                            ? "grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1.4fr_48px] gap-2"
                            : "grid grid-cols-[1fr_1fr_1fr_1.4fr_48px] gap-2"
                        }
                      >
                        <CellInput
                          value={cell.measurement1From}
                          error={cellErrors.measurement1From}
                          onChange={(value) =>
                            updateCell(index, "measurement1From", value, setForm)
                          }
                        />
                        <CellInput
                          value={cell.measurement1To}
                          error={cellErrors.measurement1To}
                          onChange={(value) =>
                            updateCell(index, "measurement1To", value, setForm)
                          }
                        />
                        {isTwoAxis && (
                          <>
                            <CellInput
                              value={cell.measurement2From}
                              error={cellErrors.measurement2From}
                              onChange={(value) =>
                                updateCell(
                                  index,
                                  "measurement2From",
                                  value,
                                  setForm,
                                )
                              }
                            />
                            <CellInput
                              value={cell.measurement2To}
                              error={cellErrors.measurement2To}
                              onChange={(value) =>
                                updateCell(
                                  index,
                                  "measurement2To",
                                  value,
                                  setForm,
                                )
                              }
                            />
                          </>
                        )}
                        <CellInput
                          value={cell.price}
                          error={cellErrors.price}
                          onChange={(value) =>
                            updateCell(index, "price", value, setForm)
                          }
                        />
                        <Input
                          value={cell.notes}
                          onChange={(event) =>
                            updateCell(index, "notes", event.target.value, setForm)
                          }
                          placeholder="Optional"
                          className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={form.cells.length === 1}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              cells: prev.cells.filter((_, row) => row !== index),
                            }))
                          }
                          className="h-10 w-10 rounded-lg text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
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
            {isEdit ? "Save Changes" : "Create Price Chart"}
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

function CellInput({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function getDefaultValues(
  priceChart?: PriceChart | null,
  priceRules: PriceRule[] = [],
): ChartForm {
  return {
    priceRuleId: priceChart?.priceRuleId ?? priceRules[0]?.id ?? "",
    name: priceChart?.name ?? "",
    description: priceChart?.description ?? "",
    isActive: priceChart?.isActive ?? true,
    cells: priceChart?.cells?.length
      ? priceChart.cells.map((cell) => ({
          measurement1From: cell.measurement1From
            ? String(cell.measurement1From)
            : "",
          measurement1To: cell.measurement1To ? String(cell.measurement1To) : "",
          measurement2From: cell.measurement2From
            ? String(cell.measurement2From)
            : "",
          measurement2To: cell.measurement2To ? String(cell.measurement2To) : "",
          price: String(cell.price),
          notes: cell.notes ?? "",
        }))
      : [emptyCell()],
  };
}

function validateChart(form: ChartForm): FormErrors {
  const errors: FormErrors = { cellErrors: {} };

  if (!form.priceRuleId) errors.priceRuleId = "Price rule is required.";
  if (!form.name.trim()) errors.name = "Chart name is required.";
  if (!form.cells.length) errors.cells = "At least one chart row is required.";

  form.cells.forEach((cell, index) => {
    const rowErrors: Partial<Record<keyof CellForm, string>> = {};
    const m1From = Number(cell.measurement1From);
    const m1To = Number(cell.measurement1To);
    const m2From = Number(cell.measurement2From);
    const m2To = Number(cell.measurement2To);
    const price = Number(cell.price);

    if (cell.measurement1From === "") {
      rowErrors.measurement1From = "Required";
    }
    if (cell.measurement1To === "") {
      rowErrors.measurement1To = "Required";
    }
    if (cell.measurement1From !== "" && cell.measurement1To !== "" && m1To < m1From) {
      rowErrors.measurement1To = "Must be >= from";
    }
    if (cell.measurement2From !== "" && cell.measurement2To === "") {
      rowErrors.measurement2To = "Required";
    }
    if (cell.measurement2To !== "" && cell.measurement2From === "") {
      rowErrors.measurement2From = "Required";
    }
    if (cell.measurement2From !== "" && cell.measurement2To !== "" && m2To < m2From) {
      rowErrors.measurement2To = "Must be >= from";
    }
    if (cell.price === "" || !Number.isFinite(price) || price < 0) {
      rowErrors.price = "Valid price required";
    }

    if (Object.keys(rowErrors).length) {
      errors.cellErrors![index] = rowErrors;
    }
  });

  return errors;
}

function updateCell(
  index: number,
  key: keyof CellForm,
  value: string,
  setForm: Dispatch<SetStateAction<ChartForm>>,
) {
  setForm((prev) => ({
    ...prev,
    cells: prev.cells.map((cell, row) =>
      row === index ? { ...cell, [key]: value } : cell,
    ),
  }));
}

function emptyCell(): CellForm {
  return {
    measurement1From: "",
    measurement1To: "",
    measurement2From: "",
    measurement2To: "",
    price: "",
    notes: "",
  };
}

function cleanOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function toOptionalNumber(value: string) {
  return value === "" ? undefined : Number(value);
}
