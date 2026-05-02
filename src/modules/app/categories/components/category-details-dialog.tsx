import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Shirt,
} from "lucide-react";
import type { Category } from "../types/category.types";

interface Props {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
}

export function CategoryDetailsDialog({ open, category, onClose }: Props) {
  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <Shirt className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="truncate text-xl font-black tracking-tight text-slate-950">
                {category.name}
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                Garment category details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto bg-slate-50 p-5">
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={FileText} title="Category details" />

              <div className="mt-4 grid gap-3">
                <InfoItem label="Name" value={category.name} />
                <InfoItem
                  label="Description"
                  value={category.description || "No description added"}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={ClipboardList} title="Usage" />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoItem
                  label="Blocks"
                  value={`${category._count?.blocks ?? 0}`}
                />
                <InfoItem
                  label="Orders"
                  value={`${category._count?.orderItems ?? 0}`}
                />
                <InfoItem
                  label="Fields"
                  value={`${category._count?.measurementFields ?? 0}`}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={CalendarDays} title="System details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Created" value={formatDateTime(category.createdAt)} />
                <InfoItem label="Updated" value={formatDateTime(category.updatedAt)} />
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