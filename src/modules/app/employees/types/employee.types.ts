export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "LEFT";
export type EmployeeDepartment =
  | "TAILORING"
  | "CUTTING"
  | "FINISHING"
  | "SALES"
  | "ACCOUNTS"
  | "MANAGEMENT";

export type SalaryType = "MONTHLY" | "DAILY" | "PIECE_RATE";

export interface Employee {
  id: string;
  employeeNo: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  nic?: string | null;
  address?: string | null;
  town?: string | null;

  department: EmployeeDepartment;
  designation: string;
  salaryType: SalaryType;
  basicSalary?: number | null;
  dailyRate?: number | null;
  pieceRate?: number | null;

  joinedDate: string;
  status: EmployeeStatus;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  notes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface EmployeesResponse {
  items: Employee[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

export interface EmployeeListParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
  status?: EmployeeStatus;
  department?: EmployeeDepartment;
}

export interface EmployeePayload {
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  nic?: string;
  address?: string;
  town?: string;

  department: EmployeeDepartment;
  designation: string;
  salaryType: SalaryType;
  basicSalary?: number | null;
  dailyRate?: number | null;
  pieceRate?: number | null;

  joinedDate: string;
  status: EmployeeStatus;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}