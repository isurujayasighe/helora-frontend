import { Input } from "@/components/ui/input";

export type MeasurementFieldConfig = {
  key: string;
  label: string;
  unit?: string | null;
};

type MeasurementFieldsProps = {
  fields: MeasurementFieldConfig[];
  values: Record<string, string | number | undefined>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
};

export function MeasurementFields({
  fields,
  values,
  onChange,
  disabled = false,
}: MeasurementFieldsProps) {
  if (!fields.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
        Select a category to enter measurements.
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
            <span>{field.label}</span>
            {field.unit && (
              <span className="text-[10px] font-medium text-slate-400">
                {field.unit}
              </span>
            )}
          </label>

          <Input
            value={String(values[field.key] ?? "")}
            disabled={disabled}
            onChange={(event) => onChange(field.key, event.target.value)}
            className="h-9 rounded-lg text-sm disabled:bg-slate-100"
            placeholder={field.label}
          />
        </div>
      ))}
    </div>
  );
}