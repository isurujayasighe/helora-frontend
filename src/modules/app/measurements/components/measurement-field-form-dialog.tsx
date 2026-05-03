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
import { useGetCategories } from "@/api/useGetCategories";

const measurementInputTypeValues = [
  "DECIMAL",
  "NUMBER",
  "TEXT",
  "SELECT",
  "MULTI_SELECT",
  "BOOLEAN",
] as const satisfies readonly MeasurementInputType[];

const measurementFieldSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),

  code: z
    .string()
    .min(2, "Code is required")
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Use lowercase letters, numbers, and underscore only",
    ),

  label: z.string().min(2, "Label is required"),

  inputType: z.enum(measurementInputTypeValues),

  unit: z.string(),

  sortOrder: z.number().min(0),

  isRequired: z.boolean(),

  isActive: z.boolean(),

  helpText: z.string(),

  optionsText: z.string(),
});

interface Props {
  open: boolean;
  field?: MeasurementField | null;
  onClose: () => void;
}

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

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetCategories({
    enabled: open,
  });

  const categoryOptions = useMemo(() => {
    return categories
      .filter((category) => category.isActive)
      .map((category) => ({
        value: category.id,
        label: category.name,
      }));
  }, [categories]);

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
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-3xl gap-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
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

        <form
          id="measurement-field-form"
          className="flex max-h-[calc(92vh-92px)] flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
            <div className="space-y-4">
              {isCategoriesError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  Categories could not be loaded. Please refresh and try again.
                </div>
              )}

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
                    placeholder={
                      isCategoriesLoading
                        ? "Loading categories..."
                        : "Choose category"
                    }
                    options={categoryOptions}
                    disabled={isCategoriesLoading || isPending}
                    required
                  />

                  <TextField
                    form={form}
                    name="label"
                    label="Field label"
                    placeholder="Example: Chest"
                    required
                    disabled={isPending}
                  />

                  <TextField
                    form={form}
                    name="code"
                    label="Field code"
                    placeholder="Example: chest"
                    required
                    disabled={isEdit || isPending}
                    helpText={
                      isEdit
                        ? "Code cannot be changed after creating the field."
                        : "Use lowercase letters, numbers, and underscore only."
                    }
                  />

                  <NumberField
                    form={form}
                    name="sortOrder"
                    label="Sort order"
                    placeholder="Example: 1"
                    required
                    disabled={isPending}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <SectionTitle
                  icon={Settings2}
                  title="Input behavior"
                  description="Choose how staff should enter this measurement."
                />

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <SelectField
                    form={form}
                    name="inputType"
                    label="Input type"
                    placeholder="Choose input type"
                    options={inputTypeOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                      description: option.description,
                    }))}
                    required
                    disabled={isPending}
                  />

                  <SelectField
                    form={form}
                    name="unit"
                    label="Unit"
                    placeholder="Choose unit"
                    options={unitOptions}
                    disabled={isPending}
                  />

                  <TextareaField
                    form={form}
                    name="optionsText"
                    label="Options"
                    placeholder={"S\nM\nL\nXL"}
                    description="Only required for Select or Multi Select. Add one option per line."
                    disabled={isPending}
                  />

                  <TextareaField
                    form={form}
                    name="helpText"
                    label="Help text"
                    placeholder="Example: Measure around the chest"
                    description="Shown as guidance when staff enters measurements."
                    disabled={isPending}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <SectionTitle
                  icon={SlidersHorizontal}
                  title="Field settings"
                  description="Control whether this field is required and visible."
                />

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <SwitchField
                    form={form}
                    name="isRequired"
                    label="Required field"
                    description="Staff must enter this measurement before saving."
                    disabled={isPending}
                  />

                  <SwitchField
                    form={form}
                    name="isActive"
                    label="Active field"
                    description="Inactive fields are hidden from new measurement forms."
                    disabled={isPending}
                  />
                </div>
              </section>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              disabled={isPending}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="measurement-field-form"
              disabled={isPending || isCategoriesLoading}
              className="rounded-lg bg-slate-900 hover:bg-slate-800"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Save Field"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(field?: MeasurementField | null) {
  return {
    categoryId: field?.categoryId ?? "",
    code: field?.code ?? "",
    label: field?.label ?? "",
    inputType: field?.inputType ?? "DECIMAL",
    unit: field?.unit ?? "inch",
    sortOrder: field?.sortOrder ?? 0,
    isRequired: field?.isRequired ?? true,
    isActive: field?.isActive ?? true,
    helpText: field?.helpText ?? "",
    optionsText: Array.isArray(field?.options) ? field.options.join("\n") : "",
  };
}

function cleanOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function parseOptions(value?: string) {
  const options = value
    ?.split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return options?.length ? options : undefined;
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldError({ errors }: { errors?: unknown[] }) {
  if (!errors?.length) return null;

  return (
    <p className="text-xs font-medium text-red-600">
      {String(errors[0])}
    </p>
  );
}

function TextField({
  form,
  name,
  label,
  placeholder,
  required,
  disabled,
  helpText,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
}) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>

          <Input
            value={field.state.value ?? ""}
            disabled={disabled}
            placeholder={placeholder}
            className="rounded-lg"
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
          />

          {helpText && (
            <p className="text-xs font-medium text-slate-500">{helpText}</p>
          )}

          <FieldError errors={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}

function NumberField({
  form,
  name,
  label,
  placeholder,
  required,
  disabled,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>

          <Input
            type="number"
            min={0}
            value={field.state.value ?? 0}
            disabled={disabled}
            placeholder={placeholder}
            className="rounded-lg"
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(Number(event.target.value))}
          />

          <FieldError errors={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}

function SelectField({
  form,
  name,
  label,
  placeholder,
  options,
  required,
  disabled,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>

          <Select
            value={field.state.value ?? ""}
            disabled={disabled}
            onValueChange={field.handleChange}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-slate-500">
                        {option.description}
                      </p>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError errors={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}

function TextareaField({
  form,
  name,
  label,
  placeholder,
  description,
  disabled,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">{label}</Label>

          <Textarea
            value={field.state.value ?? ""}
            disabled={disabled}
            placeholder={placeholder}
            className="min-h-24 rounded-lg"
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
          />

          {description && (
            <div className="flex items-start gap-2 text-xs font-medium text-slate-500">
              <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>{description}</p>
            </div>
          )}

          <FieldError errors={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}

function SwitchField({
  form,
  name,
  label,
  description,
  disabled,
}: {
  form: any;
  name: string;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <div
          className={cn(
            "flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3",
            disabled && "opacity-60",
          )}
        >
          <div>
            <Label className="text-sm font-bold text-slate-800">{label}</Label>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
              {description}
            </p>
          </div>

          <Switch
            checked={Boolean(field.state.value)}
            disabled={disabled}
            onCheckedChange={field.handleChange}
          />
        </div>
      )}
    </form.Field>
  );
}