"use client";

import { Input } from "@/components/ui/input";

export type MeasurementFieldConfig = {
  key: string;
  label: string;
  unit?: string;
  placeholder?: string;
};

type MeasurementFieldsProps = {
  fields: MeasurementFieldConfig[];
  value?: Record<string, string | number | undefined>;
  values?: Record<string, string | number | undefined>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
};

export function MeasurementFields({
  fields,
  value,
  values,
  onChange,
  disabled = false,
}: MeasurementFieldsProps) {
  if (!fields.length) return null;

  const fieldValues = values ?? value ?? {};

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-slate-800">Measurements</h4>
        <p className="text-xs text-slate-500">
          Enter the relevant measurements for this category.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {field.label}
              {field.unit ? (
                <span className="ml-1 text-xs text-slate-500">
                  ({field.unit})
                </span>
              ) : null}
            </label>

            <Input
              type="number"
              step="0.01"
              min="0"
              value={fieldValues[field.key] ?? ""}
              disabled={disabled}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
