import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  MoreHorizontal,
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

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { CustomerStatCard } from "@/components/common/customer-stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";
import { useDeleteEmployee, useEmployeesQuery } from "./api/useGetEmployeeList";
import { EmployeeDetailsDialog } from "./components/employee-detail-dialog";
import { EmployeeFormDialog } from "./components/employee-form-dialog";
import { EmployeeStatusBadge } from "./components/employee-status-badge";
import type {
  Employee,
  EmployeeDepartment,
  EmployeeStatus,
} from "./types/employee.types";

type StatusFilter = "ALL" | EmployeeStatus;
type DepartmentFilter = "ALL" | EmployeeDepartment;

const PAGE_SIZE = 10;

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
  const [pageSize] = useState(PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const { data, isLoading, isFetching, refetch } = useEmployeesQuery({
    pageIndex,
    pageSize,
    search: search.trim() || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    department: departmentFilter === "ALL" ? undefined : departmentFilter,
  });

  const deleteEmployee = useDeleteEmployee();

  const employees = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const stats = useMemo(() => {
    const active = employees.filter((item) => item.status === "ACTIVE").length;
    const tailoring = employees.filter(
      (item) => item.department === "TAILORING",
    ).length;
    const pieceRate = employees.filter(
      (item) => item.salaryType === "PIECE_RATE",
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
      `Are you sure you want to remove ${employee.fullName}?`,
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
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Employees"
              description="Manage garment staff, work roles, and payment details."
              actions={
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => refetch()}
                    disabled={isLoading || isFetching}
                  >
                    <RefreshCw
                      className={cn("size-4", isFetching && "animate-spin")}
                    />
                    Refresh
                  </Button>

                  <Button type="button" onClick={openCreate}>
                    <Plus className="size-4" />
                    Add Employee
                  </Button>
                </>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CustomerStatCard
                title="Total Employees"
                value={stats.total}
                description="All employee records"
                icon={UsersRound}
              />

              <CustomerStatCard
                title="Working"
                value={stats.active}
                description="Currently active employees"
                icon={UserCheck}
              />

              <CustomerStatCard
                title="Tailoring Staff"
                value={stats.tailoring}
                description="Employees in tailoring"
                icon={Shirt}
              />

              <CustomerStatCard
                title="Piece Rate"
                value={stats.pieceRate}
                description="Paid per item"
                icon={WalletCards}
              />
            </div>

            <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Employee Directory</CardTitle>

                    <CardDescription>
                      View and manage all garment employees in one place.
                    </CardDescription>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPageIndex(0);
                        }}
                        placeholder="Search employees..."
                        className="pl-9 bg-background"
                      />
                    </div>

                    <FilterDropdown
                      label="Status"
                      value={
                        statusFilters.find(
                          (item) => item.value === statusFilter,
                        )?.label ?? "Status"
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
                          (item) => item.value === departmentFilter,
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
                        type="button"
                        variant="ghost"
                        onClick={resetFilters}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "min-h-0 flex-1 overflow-auto p-0",
                  isFetching && "opacity-70",
                )}
              >
                <EmployeeTable
                  employees={employees}
                  isLoading={isLoading}
                  isDeleting={deleteEmployee.isPending}
                  onView={openDetails}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </CardContent>

              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {pageIndex + 1} of {pageCount}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pageIndex === 0}
                    onClick={() =>
                      setPageIndex((prev) => Math.max(0, prev - 1))
                    }
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={pageIndex + 1 >= pageCount}
                    onClick={() =>
                      setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

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
        <Button type="button" variant="outline">
          {value}
          <ChevronDown className="size-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => onSelect(item.value)}
          >
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
  isDeleting,
  onView,
  onEdit,
  onDelete,
}: {
  employees: Employee[];
  isLoading: boolean;
  isDeleting?: boolean;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
        <UsersRound className="size-10 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">No employees found</h3>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Add your first tailor, cutter, cashier, or helper to start managing
          garment employees.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-background">
        <TableRow>
          <TableHead className="px-4">Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="px-4 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="px-4 py-3">
              <button
                type="button"
                onClick={() => onView(employee)}
                className="text-left"
              >
                <p className="font-medium">{employee.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {employee.employeeNo} - {employee.phoneNumber}
                </p>
              </button>
            </TableCell>

            <TableCell>
              <p>{formatDepartment(employee.department)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {employee.designation}
              </p>
            </TableCell>

            <TableCell>
              <p>{formatSalaryType(employee.salaryType)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {getPaymentValue(employee)}
              </p>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-muted-foreground" />
                {formatDate(employee.joinedDate)}
              </div>
            </TableCell>

            <TableCell>
              <EmployeeStatusBadge status={employee.status} />
            </TableCell>

            <TableCell className="px-4 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open employee actions</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(employee)}>
                    <BriefcaseBusiness className="size-4" />
                    View Details
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onEdit(employee)}>
                    <Pencil className="size-4" />
                    Edit Employee
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={isDeleting}
                    onClick={() => onDelete(employee)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
