import { useMemo, useState } from "react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shirt,
  Trash2,
  UserCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type {
  Employee,
  EmployeeDepartment,
  EmployeeStatus,
} from "./types/employee.types";
import {
  useDeleteEmployee,
  useEmployeesQuery,
} from "./api/useGetEmployeeList";
import { EmployeeFormDialog } from "./components/employee-form-dialog";
import { EmployeeDetailsDialog } from "./components/employee-detail-dialog";
import { EmployeeStatusBadge } from "./components/employee-status-badge";

type StatusFilter = "ALL" | EmployeeStatus;
type DepartmentFilter = "ALL" | EmployeeDepartment;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All employees" },
  { value: "ACTIVE", label: "Working" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "LEFT", label: "Left job" },
];

const departmentFilters: Array<{ value: DepartmentFilter; label: string }> = [
  { value: "ALL", label: "All departments" },
  { value: "TAILORING", label: "Tailoring" },
  { value: "CUTTING", label: "Cutting" },
  { value: "FINISHING", label: "Finishing" },
  { value: "SALES", label: "Sales" },
  { value: "ACCOUNTS", label: "Accounts" },
  { value: "MANAGEMENT", label: "Management" },
];

export default function EmployeePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [departmentFilter, setDepartmentFilter] =
    useState<DepartmentFilter>("ALL");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const { data, isLoading, isRefetching, refetch } = useEmployeesQuery({
    pageIndex,
    pageSize,
    search,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    department: departmentFilter === "ALL" ? undefined : departmentFilter,
  });

  const deleteEmployee = useDeleteEmployee();

  const employees = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const stats = useMemo(() => {
    const active = employees.filter((item) => item.status === "ACTIVE").length;
    const tailoring = employees.filter(
      (item) => item.department === "TAILORING"
    ).length;
    const pieceRate = employees.filter(
      (item) => item.salaryType === "PIECE_RATE"
    ).length;

    return {
      total,
      active,
      tailoring,
      pieceRate,
    };
  }, [employees, total]);

  const openCreate = () => {
    setSelectedEmployee(null);
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormOpen(true);
  };

  const openDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailsOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${employee.fullName}?`
    );

    if (!confirmed) return;

    await deleteEmployee.mutateAsync(employee.id);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setPageIndex(0);
  };

  return (
    <PermissionGate action="read" subject="employees">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-employees"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <UsersRound className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Employees
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Manage garment staff, work roles, and payment details.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading || isRefetching}
                  className="h-9 rounded-lg bg-white font-bold"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isRefetching ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>

                <Button
                  onClick={openCreate}
                  className="h-9 rounded-lg font-bold shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <EmployeeStatCard
                title="Total Employees"
                value={stats.total}
                description="All employee records"
                icon={UsersRound}
              />

              <EmployeeStatCard
                title="Working"
                value={stats.active}
                description="Currently active employees"
                icon={UserCheck}
              />

              <EmployeeStatCard
                title="Tailoring Staff"
                value={stats.tailoring}
                description="Employees in tailoring"
                icon={Shirt}
              />

              <EmployeeStatCard
                title="Piece Rate"
                value={stats.pieceRate}
                description="Paid per item"
                icon={WalletCards}
              />
            </div>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPageIndex(0);
                      }}
                      placeholder="Search employee by name, phone, NIC or town..."
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <FilterDropdown
                      label="Status"
                      value={
                        statusFilters.find((item) => item.value === statusFilter)
                          ?.label ?? "Status"
                      }
                      items={statusFilters}
                      onSelect={(value) => {
                        setStatusFilter(value as StatusFilter);
                        setPageIndex(0);
                      }}
                    />

                    <FilterDropdown
                      label="Department"
                      value={
                        departmentFilters.find(
                          (item) => item.value === departmentFilter
                        )?.label ?? "Department"
                      }
                      items={departmentFilters}
                      onSelect={(value) => {
                        setDepartmentFilter(value as DepartmentFilter);
                        setPageIndex(0);
                      }}
                    />

                    {(search ||
                      statusFilter !== "ALL" ||
                      departmentFilter !== "ALL") && (
                      <Button
                        variant="ghost"
                        onClick={resetFilters}
                        className="h-10 rounded-lg font-bold text-slate-500 hover:text-slate-900"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950">
                      Employee Directory
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      View and manage all garment employees in one place.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {total} employees
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-0">
                <EmployeeTable
                  employees={employees}
                  isLoading={isLoading}
                  onView={openDetails}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </CardContent>

              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-500">
                  Page {pageIndex + 1} of {pageCount}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pageIndex === 0}
                    onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                    className="h-9 rounded-lg font-bold"
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={pageIndex + 1 >= pageCount}
                    onClick={() =>
                      setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))
                    }
                    className="h-9 rounded-lg font-bold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <EmployeeFormDialog
          open={formOpen}
          employee={selectedEmployee}
          onClose={() => {
            setFormOpen(false);
            setSelectedEmployee(null);
          }}
        />

        <EmployeeDetailsDialog
          open={detailsOpen}
          employee={selectedEmployee}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedEmployee(null);
          }}
        />
      </div>
    </PermissionGate>
  );
}

function EmployeeStatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterDropdown({
  label,
  value,
  items,
  onSelect,
}: {
  label: string;
  value: string;
  items: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-lg bg-white font-bold"
        >
          {label}
          <Badge
            variant="secondary"
            className="ml-2 rounded-lg bg-slate-100 text-slate-700"
          >
            {value}
          </Badge>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.map((item) => (
          <DropdownMenuItem key={item.value} onClick={() => onSelect(item.value)}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmployeeTable({
  employees,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: {
  employees: Employee[];
  isLoading: boolean;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <UsersRound className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-950">
          No employees found
        </h3>
        <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
          Add your first tailor, cutter, cashier, or helper to start managing
          garment employees.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-237.5">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_70px] border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
        <div>Employee</div>
        <div>Department</div>
        <div>Payment</div>
        <div>Joined</div>
        <div>Status</div>
        <div />
      </div>

      {employees.map((employee) => (
        <div
          key={employee.id}
          className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_70px] items-center border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50"
        >
          <button
            type="button"
            onClick={() => onView(employee)}
            className="min-w-0 text-left"
          >
            <p className="truncate font-black text-slate-950">
              {employee.fullName}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500">
              {employee.employeeNo} · {employee.phoneNumber}
            </p>
          </button>

          <div>
            <p className="font-bold text-slate-800">
              {formatDepartment(employee.department)}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {employee.designation}
            </p>
          </div>

          <div>
            <p className="font-bold text-slate-800">
              {formatSalaryType(employee.salaryType)}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {getPaymentValue(employee)}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {formatDate(employee.joinedDate)}
          </div>

          <EmployeeStatusBadge status={employee.status} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(employee)}>
                <BriefcaseBusiness className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Employee
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(employee)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
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
    MONTHLY: "Monthly",
    DAILY: "Daily",
    PIECE_RATE: "Per item",
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

function getPaymentValue(employee: Employee) {
  const value =
    employee.salaryType === "MONTHLY"
      ? employee.basicSalary
      : employee.salaryType === "DAILY"
        ? employee.dailyRate
        : employee.pieceRate;

  if (!value) return "Not added";

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}