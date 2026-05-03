import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  MapPin,
  Phone,
  ShieldCheck,
  Shirt,
  User,
  WalletCards,
} from "lucide-react";
import { EmployeeStatusBadge } from "./employee-status-badge";
import type { Employee } from "../types/employee.types";

interface Props {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
}

export function EmployeeDetailsDialog({ open, employee, onClose }: Props) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                <User className="h-6 w-6" />
              </div>

              <div>
                <DialogTitle className="text-xl font-black tracking-tight text-slate-950">
                  {employee.fullName}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                  Employee No: {employee.employeeNo}
                </DialogDescription>
              </div>
            </div>

            <EmployeeStatusBadge status={employee.status} />
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto bg-slate-50 p-5">
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={Shirt} title="Work details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Department" value={formatDepartment(employee.department)} />
                <InfoItem label="Job role" value={employee.designation} />
                <InfoItem label="Joined date" value={formatDate(employee.joinedDate)} />
                <InfoItem label="Status" value={formatStatus(employee.status)} />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={Phone} title="Contact details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Phone" value={employee.phoneNumber} />
                <InfoItem label="Another phone" value={employee.alternatePhone || "Not added"} />
                <InfoItem label="NIC" value={employee.nic || "Not added"} />
                <InfoItem label="Town" value={employee.town || "Not added"} />
              </div>

              {employee.address && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex gap-2 text-sm font-semibold text-slate-700">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                    {employee.address}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={WalletCards} title="Payment details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Payment type" value={formatSalaryType(employee.salaryType)} />
                <InfoItem
                  label="Monthly salary"
                  value={formatMoney(employee.basicSalary)}
                />
                <InfoItem label="Daily rate" value={formatMoney(employee.dailyRate)} />
                <InfoItem label="Per item rate" value={formatMoney(employee.pieceRate)} />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={ShieldCheck} title="Emergency contact" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Contact name"
                  value={employee.emergencyContactName || "Not added"}
                />
                <InfoItem
                  label="Contact phone"
                  value={employee.emergencyContactPhone || "Not added"}
                />
              </div>
            </section>

            {employee.notes && (
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <SectionHeading icon={CalendarDays} title="Notes" />
                <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
                  {employee.notes}
                </p>
              </section>
            )}
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

function formatDepartment(value: string) {
  const map: Record<string, string> = {
    TAILORING: "Tailoring",
    CUTTING: "Cutting",
    FINISHING: "Finishing",
    SALES: "Sales",
    ACCOUNTS: "Accounts",
    MANAGEMENT: "Management",
  };

  return map[value] ?? value;
}

function formatSalaryType(value: string) {
  const map: Record<string, string> = {
    MONTHLY: "Monthly salary",
    DAILY: "Daily payment",
    PIECE_RATE: "Per item payment",
  };

  return map[value] ?? value;
}

function formatStatus(value: string) {
  const map: Record<string, string> = {
    ACTIVE: "Working",
    INACTIVE: "Inactive",
    LEFT: "Left job",
  };

  return map[value] ?? value;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatMoney(value?: number | null) {
  if (!value) return "Not added";

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}