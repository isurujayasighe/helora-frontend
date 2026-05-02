import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Timer,
  User,
  UserCheck,
} from "lucide-react";
import type { AttendanceRecord } from "../types/attendance.types";
import { AttendanceStatusBadge } from "./attendance-status-badge";

interface Props {
  open: boolean;
  attendance?: AttendanceRecord | null;
  onClose: () => void;
}

export function AttendanceDetailsDialog({
  open,
  attendance,
  onClose,
}: Props) {
  if (!attendance) return null;

  const isMissingCheckout = Boolean(attendance.firstIn && !attendance.lastOut);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                <Clock className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="truncate text-xl font-black tracking-tight text-slate-950">
                  {attendance.employee.fullName}
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                  {attendance.employee.employeeNumber} ·{" "}
                  {formatDate(attendance.attendanceDate)}
                </DialogDescription>
              </div>
            </div>

            <AttendanceStatusBadge status={attendance.status} />
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto bg-slate-50 p-5">
          <div className="space-y-4">
            {isMissingCheckout && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-black text-amber-900">
                      Checkout is missing
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-amber-700">
                      This employee has an in time, but no out time. Please
                      check the device punch or update attendance manually.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={User} title="Employee details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Employee" value={attendance.employee.fullName} />
                <InfoItem
                  label="Employee No"
                  value={attendance.employee.employeeNumber}
                />
                <InfoItem
                  label="Department"
                  value={attendance.employee.department}
                />
                <InfoItem
                  label="Job role"
                  value={attendance.employee.designation}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={Clock} title="Time details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Expected in"
                  value={attendance.expectedInTime || "Not set"}
                />
                <InfoItem
                  label="Expected out"
                  value={attendance.expectedOutTime || "Not set"}
                />
                <InfoItem
                  label="First in"
                  value={formatTime(attendance.firstIn)}
                />
                <InfoItem
                  label="Last out"
                  value={formatTime(attendance.lastOut)}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={Timer} title="Worked time" />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoItem
                  label="Worked"
                  value={formatMinutes(attendance.totalMinutes)}
                />
                <InfoItem
                  label="Late"
                  value={formatMinutes(attendance.lateMinutes)}
                />
                <InfoItem
                  label="Overtime"
                  value={formatMinutes(attendance.overtimeMinutes)}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={UserCheck} title="Approval" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Approved"
                  value={attendance.approvedAt ? "Yes" : "Not approved"}
                />
                <InfoItem
                  label="Approved at"
                  value={
                    attendance.approvedAt
                      ? formatDateTime(attendance.approvedAt)
                      : "Not approved"
                  }
                />
              </div>

              {attendance.approvedBy && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Approved by {attendance.approvedBy.firstName}{" "}
                    {attendance.approvedBy.lastName}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={FileText} title="Other details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Source" value={formatSource(attendance.source)} />
                <InfoItem
                  label="Created"
                  value={formatDateTime(attendance.createdAt)}
                />
              </div>

              {attendance.notes && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">
                    {attendance.notes}
                  </p>
                </div>
              )}
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
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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

function formatTime(value?: string | null) {
  if (!value) return "Not marked";

  return new Date(value).toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(value?: number | null) {
  const minutes = value ?? 0;

  if (minutes <= 0) return "0 min";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours <= 0) return `${remainingMinutes} min`;
  if (remainingMinutes <= 0) return `${hours} hr`;

  return `${hours} hr ${remainingMinutes} min`;
}

function formatSource(value: string) {
  const map: Record<string, string> = {
    DEVICE: "Device",
    MANUAL: "Manual",
    IMPORT: "Imported",
  };

  return map[value] ?? value;
}