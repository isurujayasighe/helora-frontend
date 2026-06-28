import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import type {
  Employee,
  EmployeeDepartment,
  EmployeePayload,
  EmployeeStatus,
  SalaryType,
} from "../types/employee.types";
import {
  useCreateEmployee,
  useUpdateEmployee,
} from "../api/useGetEmployeeList";

const employeeSchema = z.object({
  fullName: z.string().min(2, "Employee name is required"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  alternatePhone: z.string(),
  nic: z.string(),
  address: z.string(),
  town: z.string(),

  department: z.enum([
    "TAILORING",
    "CUTTING",
    "FINISHING",
    "SALES",
    "ACCOUNTS",
    "MANAGEMENT",
  ]),
  designation: z.string().min(2, "Job role is required"),
  salaryType: z.enum(["MONTHLY", "DAILY", "PIECE_RATE"]),

  basicSalary: z.number().nullable(),
  dailyRate: z.number().nullable(),
  pieceRate: z.number().nullable(),

  joinedDate: z.string().min(1, "Joined date is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "LEFT"]),

  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  notes: z.string(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;
type EmployeeFormApi = UseFormReturn<EmployeeFormValues>;
type TextFieldName = Extract<
  FieldPath<EmployeeFormValues>,
  | "fullName"
  | "phoneNumber"
  | "alternatePhone"
  | "nic"
  | "address"
  | "town"
  | "designation"
  | "joinedDate"
  | "emergencyContactName"
  | "emergencyContactPhone"
>;
type NumberFieldName = Extract<
  FieldPath<EmployeeFormValues>,
  "basicSalary" | "dailyRate" | "pieceRate"
>;
type SelectFieldName = Extract<
  FieldPath<EmployeeFormValues>,
  "department" | "salaryType" | "status"
>;

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

  const form = useForm<EmployeeFormValues>({
    defaultValues: getDefaultValues(employee),
    mode: "onChange",
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(employee));
    }
  }, [open, employee, form]);

  const handleSubmit = async (value: EmployeeFormValues) => {
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
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-dvh max-h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl xl:max-w-3xl"
      >
        <SheetHeader className="shrink-0 border-b bg-background px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted">
              <UserPlus className="size-5 text-muted-foreground" />
            </div>

            <div>
              <SheetTitle className="text-lg">
                {isEdit ? "Edit Employee" : "Add Employee"}
              </SheetTitle>

              <SheetDescription className="mt-1 leading-5">
                {isEdit
                  ? "Update employee details used for garment operations."
                  : "Add a tailor, cutter, helper, cashier, or manager to Helora."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <Form {...form}>
            <form
              className="space-y-5 bg-muted/30 p-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <section className="rounded-xl border bg-card p-5 shadow-sm">
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

              <section className="rounded-xl border bg-card p-5 shadow-sm">
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

              <section className="rounded-xl border bg-card p-5 shadow-sm">
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

              <section className="rounded-xl border bg-card p-5 shadow-sm">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Add any special notes about this employee..."
                          className="min-h-24 resize-none bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>
            </form>
          </Form>
        </ScrollArea>

        <SheetFooter className="shrink-0 border-t bg-background px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={
              !form.formState.isValid ||
              form.formState.isSubmitting ||
              isPending
            }
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                {isEdit ? "Save Changes" : "Add Employee"}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>

      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
  form: EmployeeFormApi;
  name: TextFieldName;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>

          <FormControl>
            <Input
              {...field}
              type={type}
              value={field.value ?? ""}
              placeholder={placeholder}
              className="h- bg-background"
            />
          </FormControl>

          <FormMessage />
        </FormItem>
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
  form: EmployeeFormApi;
  name: NumberFieldName;
  label: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>

          <FormControl>
            <Input
              type="number"
              min={0}
              value={field.value ?? ""}
              onBlur={field.onBlur}
              onChange={(event) => {
                const value = event.target.value;
                field.onChange(value === "" ? null : Number(value));
              }}
              placeholder={placeholder}
              className="h-11 bg-background"
            />
          </FormControl>

          <FormMessage />
        </FormItem>
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
  form: EmployeeFormApi;
  name: SelectFieldName;
  label: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>

          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="h-11 w-full bg-background">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormMessage />
        </FormItem>
      )}
    />
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
