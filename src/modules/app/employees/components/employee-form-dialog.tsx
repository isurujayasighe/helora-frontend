import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Phone,
  Save,
  Shirt,
  UserPlus,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Employee,
  EmployeeDepartment,
  EmployeePayload,
  EmployeeStatus,
  SalaryType,
} from "../types/employee.types";
import { useCreateEmployee, useUpdateEmployee } from "../api/useGetEmployeeList";

const employeeSchema = z.object({
  fullName: z.string().min(2, "Employee name is required"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  alternatePhone: z.string().optional(),
  nic: z.string().optional(),
  address: z.string().optional(),
  town: z.string().optional(),

  department: z.string().min(1, "Department is required"),
  designation: z.string().min(2, "Job role is required"),
  salaryType: z.string().min(1, "Salary type is required"),

  basicSalary: z.number().nullable().optional(),
  dailyRate: z.number().nullable().optional(),
  pieceRate: z.number().nullable().optional(),

  joinedDate: z.string().min(1, "Joined date is required"),
  status: z.string().min(1, "Status is required"),

  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
});

interface Props {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
}

const departmentOptions: Array<{
  value: EmployeeDepartment;
  label: string;
  description: string;
}> = [
  {
    value: "TAILORING",
    label: "Tailoring",
    description: "Stitching and sewing work",
  },
  {
    value: "CUTTING",
    label: "Cutting",
    description: "Fabric cutting and pattern work",
  },
  {
    value: "FINISHING",
    label: "Finishing",
    description: "Ironing, packing, and final checking",
  },
  {
    value: "SALES",
    label: "Sales",
    description: "Customer handling and order taking",
  },
  {
    value: "ACCOUNTS",
    label: "Accounts",
    description: "Payments and cash handling",
  },
  {
    value: "MANAGEMENT",
    label: "Management",
    description: "Shop and staff management",
  },
];

const salaryTypeOptions: Array<{
  value: SalaryType;
  label: string;
}> = [
  { value: "MONTHLY", label: "Monthly salary" },
  { value: "DAILY", label: "Daily payment" },
  { value: "PIECE_RATE", label: "Per item payment" },
];

const statusOptions: Array<{
  value: EmployeeStatus;
  label: string;
}> = [
  { value: "ACTIVE", label: "Working" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "LEFT", label: "Left job" },
];

export function EmployeeFormDialog({ open, employee, onClose }: Props) {
  const isEdit = Boolean(employee?.id);

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const isPending = createEmployee.isPending || updateEmployee.isPending;

  const form = useForm({
    defaultValues: getDefaultValues(employee),
    validators: {
      onChange: employeeSchema,
    },
    onSubmit: async ({ value }) => {
      const payload: EmployeePayload = {
        fullName: value.fullName.trim(),
        phoneNumber: value.phoneNumber.trim(),
        alternatePhone: cleanOptional(value.alternatePhone),
        nic: cleanOptional(value.nic),
        address: cleanOptional(value.address),
        town: cleanOptional(value.town),

        department: value.department as EmployeeDepartment,
        designation: value.designation.trim(),
        salaryType: value.salaryType as SalaryType,

        basicSalary: value.basicSalary ?? null,
        dailyRate: value.dailyRate ?? null,
        pieceRate: value.pieceRate ?? null,

        joinedDate: value.joinedDate,
        status: value.status as EmployeeStatus,

        emergencyContactName: cleanOptional(value.emergencyContactName),
        emergencyContactPhone: cleanOptional(value.emergencyContactPhone),
        notes: cleanOptional(value.notes),
      };

      if (isEdit && employee?.id) {
        await updateEmployee.mutateAsync({
          employeeId: employee.id,
          payload,
        });
      } else {
        await createEmployee.mutateAsync(payload);
      }

      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(employee));
    }
  }, [open, employee, form]);

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
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-950">
                {isEdit ? "Edit Employee" : "Add Employee"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                {isEdit
                  ? "Update employee details used for garment operations."
                  : "Add a tailor, cutter, helper, cashier, or manager to Helora."}
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
                icon={Shirt}
                title="Employee details"
                description="Basic details for identifying this staff member."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <TextField
                  form={form}
                  name="fullName"
                  label="Employee name"
                  placeholder="Example: Nimal Perera"
                  required
                />

                <TextField
                  form={form}
                  name="nic"
                  label="NIC"
                  placeholder="Example: 901234567V"
                />

                <TextField
                  form={form}
                  name="phoneNumber"
                  label="Phone number"
                  placeholder="Example: 0712345678"
                  required
                />

                <TextField
                  form={form}
                  name="alternatePhone"
                  label="Another phone"
                  placeholder="Optional"
                />

                <TextField
                  form={form}
                  name="town"
                  label="Town"
                  placeholder="Example: Horana"
                />

                <TextField
                  form={form}
                  name="address"
                  label="Address"
                  placeholder="Employee address"
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={WalletCards}
                title="Work and payment"
                description="Choose the work type and how this person is paid."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SelectField
                  form={form}
                  name="department"
                  label="Department"
                  placeholder="Choose department"
                  options={departmentOptions.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  required
                />

                <TextField
                  form={form}
                  name="designation"
                  label="Job role"
                  placeholder="Example: Senior Tailor"
                  required
                />

                <SelectField
                  form={form}
                  name="salaryType"
                  label="Payment type"
                  placeholder="Choose payment type"
                  options={salaryTypeOptions}
                  required
                />

                <SelectField
                  form={form}
                  name="status"
                  label="Employee status"
                  placeholder="Choose status"
                  options={statusOptions}
                  required
                />

                <NumberField
                  form={form}
                  name="basicSalary"
                  label="Monthly salary"
                  placeholder="Example: 65000"
                />

                <NumberField
                  form={form}
                  name="dailyRate"
                  label="Daily rate"
                  placeholder="Example: 2500"
                />

                <NumberField
                  form={form}
                  name="pieceRate"
                  label="Per item rate"
                  placeholder="Example: 350"
                />

                <TextField
                  form={form}
                  name="joinedDate"
                  label="Joined date"
                  type="date"
                  required
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={Phone}
                title="Emergency contact"
                description="Someone to contact if there is an emergency."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <TextField
                  form={form}
                  name="emergencyContactName"
                  label="Contact name"
                  placeholder="Example: Kamala Perera"
                />

                <TextField
                  form={form}
                  name="emergencyContactPhone"
                  label="Contact phone"
                  placeholder="Example: 0771234567"
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <form.Field
                name="notes"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700">Notes</Label>
                    <Textarea
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Add any special notes about this employee..."
                      className="min-h-24 rounded-lg bg-slate-50 text-sm font-medium shadow-none"
                    />
                  </div>
                )}
              />
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
                      {isEdit ? "Save Changes" : "Add Employee"}
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
  type = "text",
  required,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
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
            type={type}
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
            value={field.state.value ?? ""}
            onBlur={field.handleBlur}
            onChange={(event) => {
              const value = event.target.value;
              field.handleChange(value === "" ? null : Number(value));
            }}
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

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors.length) return null;

  return (
    <p className="text-sm font-semibold text-red-600">
      {errors.join(", ")}
    </p>
  );
}

function getDefaultValues(employee?: Employee | null) {
  return {
    fullName: employee?.fullName ?? "",
    phoneNumber: employee?.phoneNumber ?? "",
    alternatePhone: employee?.alternatePhone ?? "",
    nic: employee?.nic ?? "",
    address: employee?.address ?? "",
    town: employee?.town ?? "",

    department: employee?.department ?? "TAILORING",
    designation: employee?.designation ?? "",
    salaryType: employee?.salaryType ?? "MONTHLY",

    basicSalary: employee?.basicSalary ?? null,
    dailyRate: employee?.dailyRate ?? null,
    pieceRate: employee?.pieceRate ?? null,

    joinedDate: employee?.joinedDate
      ? employee.joinedDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10),

    status: employee?.status ?? "ACTIVE",

    emergencyContactName: employee?.emergencyContactName ?? "",
    emergencyContactPhone: employee?.emergencyContactPhone ?? "",
    notes: employee?.notes ?? "",
  };
}

function cleanOptional(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}