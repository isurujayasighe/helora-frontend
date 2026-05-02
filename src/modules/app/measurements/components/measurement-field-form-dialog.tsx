import { useEffect, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  Loader2,
  Ruler,
  Save,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MeasurementField,
  MeasurementInputType,
} from "../types/measurement-fields-types";
import {
  useCreateMeasurementField,
  useUpdateMeasurementField,
} from "../api/measurement-api";

const measurementFieldSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  code: z
    .string()
    .min(2, "Code is required")
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Use lowercase letters, numbers, and underscore only"
    ),
  label: z.string().min(2, "Label is required"),
  inputType: z.string().min(1, "Input type is required"),
  unit: z.string().optional(),
  sortOrder: z.number().min(0),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  helpText: z.string().optional(),
  optionsText: z.string().optional(),
});

interface Props {
  open: boolean;
  field?: MeasurementField | null;
  onClose: () => void;
}

/**
 * Replace this with your real category query later.
 * For now this keeps the component usable.
 */
const categoryOptions = [
  { value: "category_cuid", label: "Uniform" },
  { value: "saree_category_cuid", label: "Saree" },
  { value: "blouse_category_cuid", label: "Blouse" },
];

const inputTypeOptions: Array<{
  value: MeasurementInputType;
  label: string;
  description: string;
}> = [
  {
    value: "DECIMAL",
    label: "Decimal",
    description: "For measurements like 34.5 inch",
  },
  {
    value: "NUMBER",
    label: "Number",
    description: "For whole numbers",
  },
  {
    value: "TEXT",
    label: "Text",
    description: "For free typing",
  },
  {
    value: "SELECT",
    label: "Select",
    description: "Choose one option",
  },
  {
    value: "MULTI_SELECT",
    label: "Multi Select",
    description: "Choose multiple options",
  },
  {
    value: "BOOLEAN",
    label: "Yes / No",
    description: "Simple true or false field",
  },
];

const unitOptions = [
  { value: "inch", label: "inch" },
  { value: "cm", label: "cm" },
  { value: "none", label: "No unit" },
];

export function MeasurementFieldFormDialog({ open, field, onClose }: Props) {
  const isEdit = Boolean(field?.id);

  const createField = useCreateMeasurementField();
  const updateField = useUpdateMeasurementField();

  const isPending = createField.isPending || updateField.isPending;

  const form = useForm({
    defaultValues: getDefaultValues(field),
    validators: {
      onChange: measurementFieldSchema,
    },
    onSubmit: async ({ value }) => {
      const options = parseOptions(value.optionsText);

      const payload = {
        categoryId: value.categoryId,
        code: value.code.trim(),
        label: value.label.trim(),
        inputType: value.inputType as MeasurementInputType,
        unit: value.unit === "none" ? undefined : cleanOptional(value.unit),
        sortOrder: value.sortOrder,
        isRequired: value.isRequired,
        isActive: value.isActive,
        helpText: cleanOptional(value.helpText),
        options,
      };

      if (isEdit && field?.id) {
        await updateField.mutateAsync({
          fieldId: field.id,
          payload,
        });
      } else {
        await createField.mutateAsync(payload);
      }

      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(field));
    }
  }, [open, field, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <Ruler className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-950">
                {isEdit ? "Edit Measurement Field" : "Add Measurement Field"}
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                {isEdit
                  ? "Update how this measurement field appears in orders and customer measurements."
                  : "Create a field like Chest, Waist, Length, Shoulder, or Size."}
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
                icon={Ruler}
                title="Measurement field"
                description="Basic details shown to staff when taking measurements."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SelectField
                  form={form}
                  name="categoryId"
                  label="Garment category"
                  placeholder="Choose category"
                  options={categoryOptions}
                  required
                />

                <TextField
                  form={form}
                  name="label"
                  label="Field label"
                  placeholder="Example: Chest"
                  required
                />

                <TextField
                  form={form}
                  name="code"
                  label="Field code"
                  placeholder="Example: chest"
                  required
                />

                <NumberField
                  form={form}
                  name="sortOrder"
                  label="Display order"
                  placeholder="Example: 1"
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={Settings2}
                title="Input setup"
                description="Choose how staff should enter this measurement."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SelectField
                  form={form}
                  name="inputType"
                  label="Input type"
                  placeholder="Choose input type"
                  options={inputTypeOptions.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  required
                />

                <SelectField
                  form={form}
                  name="unit"
                  label="Unit"
                  placeholder="Choose unit"
                  options={unitOptions}
                />
              </div>

              <form.Subscribe
                selector={(state) => state.values.inputType}
                children={(inputType) => {
                  const shouldShowOptions =
                    inputType === "SELECT" || inputType === "MULTI_SELECT";

                  if (!shouldShowOptions) return null;

                  return (
                    <div className="mt-4">
                      <form.Field
                        name="optionsText"
                        children={(field) => (
                          <div className="grid gap-2">
                            <Label className="font-bold text-slate-700">
                              Options
                            </Label>

                            <Textarea
                              value={field.state.value ?? ""}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              placeholder="Example: S, M, L"
                              className="min-h-24 rounded-lg bg-slate-50 text-sm font-semibold shadow-none"
                            />

                            <p className="text-xs font-semibold text-slate-500">
                              Add options separated by commas. Example: S, M, L
                            </p>
                          </div>
                        )}
                      />
                    </div>
                  );
                }}
              />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={SlidersHorizontal}
                title="Field rules"
                description="Control whether this field is required and active."
              />

              <div className="mt-4 grid gap-3">
                <SwitchField
                  form={form}
                  name="isRequired"
                  label="Required field"
                  description="Staff must enter this measurement before saving."
                />

                <SwitchField
                  form={form}
                  name="isActive"
                  label="Active field"
                  description="Show this field when taking new measurements."
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={HelpCircle}
                title="Help text"
                description="Add a short instruction for tailors or staff."
              />

              <div className="mt-4">
                <form.Field
                  name="helpText"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label className="font-bold text-slate-700">
                        Instruction
                      </Label>

                      <Textarea
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Example: Measure around chest"
                        className="min-h-24 rounded-lg bg-slate-50 text-sm font-semibold shadow-none"
                      />
                    </div>
                  )}
                />
              </div>
            </section>
          </form>
        </div>

        <DialogFooter className="border-t bg-white px-5 py-4">
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
                      {isEdit ? "Save Changes" : "Add Field"}
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
        <p className="mt-1 text-sm font-medium text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function TextField({
  form,
  name,
  label,
  placeholder,
  required,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="grid gap-2">
          <Label className="font-bold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>

          <Input
            value={field.state.value ?? ""}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder={placeholder}
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
  );
}

function NumberField({
  form,
  name,
  label,
  placeholder,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="grid gap-2">
          <Label className="font-bold text-slate-700">{label}</Label>

          <Input
            type="number"
            min={0}
            value={field.state.value ?? 0}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(Number(event.target.value))}
            placeholder={placeholder}
            className="h-11 rounded-lg bg-slate-50 text-sm font-semibold shadow-none"
          />

          <FieldError errors={field.state.meta.errors} />
        </div>
      )}
    />
  );
}

function SelectField({
  form,
  name,
  label,
  placeholder,
  options,
  required,
}: {
  form: any;
  name: string;
  label: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="grid gap-2">
          <Label className="font-bold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>

          <Select value={field.state.value} onValueChange={field.handleChange}>
            <SelectTrigger
              className={cn(
                "h-11 rounded-lg bg-slate-50 text-sm font-semibold shadow-none",
                field.state.meta.errors.length &&
                  "border-red-500 focus-visible:ring-red-500"
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError errors={field.state.meta.errors} />
        </div>
      )}
    />
  );
}

function SwitchField({
  form,
  name,
  label,
  description,
}: {
  form: any;
  name: string;
  label: string;
  description: string;
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <Label className="font-black text-slate-900">{label}</Label>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
              {description}
            </p>
          </div>

          <Switch
            checked={Boolean(field.state.value)}
            onCheckedChange={field.handleChange}
          />
        </div>
      )}
    />
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

function getDefaultValues(field?: MeasurementField | null) {
  return {
    categoryId: field?.categoryId ?? "category_cuid",
    code: field?.code ?? "",
    label: field?.label ?? "",
    inputType: field?.inputType ?? "DECIMAL",
    unit: field?.unit ?? "inch",
    sortOrder: field?.sortOrder ?? 1,
    isRequired: field?.isRequired ?? true,
    isActive: field?.isActive ?? true,
    helpText: field?.helpText ?? "",
    optionsText: field?.options?.join(", ") ?? "",
  };
}

function cleanOptional(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function parseOptions(value?: string | null) {
  const options = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return options?.length ? options : undefined;
}