import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Hash,
  HelpCircle,
  ListChecks,
  Ruler,
  Shirt,
} from "lucide-react";
import type { MeasurementField } from "../types/measurement-fields-types";
import { MeasurementFieldStatusBadge } from "./measurement-field-status-badge";
import { MeasurementFieldInputTypeBadge } from "./measurement-field-input-type-badge";

interface Props {
  open: boolean;
  field?: MeasurementField | null;
  onClose: () => void;
}

export function MeasurementFieldDetailsDialog({ open, field, onClose }: Props) {
  if (!field) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Ruler className="size-6" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="truncate text-xl font-black tracking-tight text-slate-950">
                  {field.label}
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                  Code: {field.code}
                </DialogDescription>
              </div>
            </div>

            <MeasurementFieldStatusBadge
              isActive={field.isActive}
              isRequired={field.isRequired}
            />
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto bg-slate-50 p-5">
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={Shirt} title="Category details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Category"
                  value={field.category?.name || field.categoryId}
                />
                <InfoItem label="Sort order" value={`${field.sortOrder}`} />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={Hash} title="Input setup" />

              <div className="mt-4 flex flex-wrap gap-2">
                <MeasurementFieldInputTypeBadge inputType={field.inputType} />
                <MeasurementFieldStatusBadge
                  isActive={field.isActive}
                  isRequired={field.isRequired}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Unit" value={field.unit || "No unit"} />
                <InfoItem
                  label="Required"
                  value={field.isRequired ? "Yes" : "No"}
                />
              </div>
            </section>

            {field.options?.length ? (
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <SectionHeading icon={ListChecks} title="Options" />

                <div className="mt-4 flex flex-wrap gap-2">
                  {field.options.map((option) => (
                    <span
                      key={option}
                      className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={HelpCircle} title="Help text" />

              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                {field.helpText || "No help text added."}
              </p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={FileText} title="System details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Created"
                  value={formatDateTime(field.createdAt)}
                />
                <InfoItem
                  label="Updated"
                  value={formatDateTime(field.updatedAt)}
                />
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-slate-600" />
      <h3 className="font-black text-slate-950">{title}</h3>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 wrap-break-word text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
