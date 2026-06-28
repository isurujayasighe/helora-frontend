import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        side="right"
        className="flex h-dvh max-h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl"
      >
        <SheetHeader className="shrink-0 border-b bg-background px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted">
                <User className="size-5 text-muted-foreground" />
              </div>

              <div>
                <SheetTitle className="text-lg">{employee.fullName}</SheetTitle>
                <SheetDescription className="mt-1 leading-5">
                  Employee No: {employee.employeeNo}
                </SheetDescription>
              </div>
            </div>

            <EmployeeStatusBadge status={employee.status} />
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-5 bg-muted/30 p-4">
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <SectionHeading icon={Shirt} title="Work details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Department"
                  value={formatDepartment(employee.department)}
                />
                <InfoItem label="Job role" value={employee.designation} />
                <InfoItem
                  label="Joined date"
                  value={formatDate(employee.joinedDate)}
                />
                <InfoItem
                  label="Status"
                  value={formatStatus(employee.status)}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <SectionHeading icon={Phone} title="Contact details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Phone" value={employee.phoneNumber} />
                <InfoItem
                  label="Another phone"
                  value={employee.alternatePhone || "Not added"}
                />
                <InfoItem label="NIC" value={employee.nic || "Not added"} />
                <InfoItem label="Town" value={employee.town || "Not added"} />
              </div>

              {employee.address && (
                <div className="mt-3 rounded-lg bg-muted p-3">
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4" />
                    {employee.address}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <SectionHeading icon={WalletCards} title="Payment details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Payment type"
                  value={formatSalaryType(employee.salaryType)}
                />
                <InfoItem
                  label="Monthly salary"
                  value={formatMoney(employee.basicSalary)}
                />
                <InfoItem
                  label="Daily rate"
                  value={formatMoney(employee.dailyRate)}
                />
                <InfoItem
                  label="Per item rate"
                  value={formatMoney(employee.pieceRate)}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5 shadow-sm">
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
              <section className="rounded-xl border bg-card p-5 shadow-sm">
                <SectionHeading icon={CalendarDays} title="Notes" />
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {employee.notes}
                </p>
              </section>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="shrink-0 border-t bg-background px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
      <Icon className="size-5 text-muted-foreground" />
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
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
