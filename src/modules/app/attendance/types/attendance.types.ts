export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE"
  | "HOLIDAY";

export type AttendanceSource = "DEVICE" | "MANUAL" | "IMPORT";

export interface AttendanceEmployee {
  id: string;
  employeeNumber: string;
  fullName: string;
  department: string;
  designation: string;
}

export interface AttendanceApprovedBy {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;

  attendanceDate: string;
  firstIn: string | null;
  lastOut: string | null;

  status: AttendanceStatus;
  source: AttendanceSource;

  totalMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;

  expectedInTime: string;
  expectedOutTime: string;

  notes: string | null;

  approvedById: string | null;
  approvedAt: string | null;

  createdById: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;

  employee: AttendanceEmployee;
  approvedBy: AttendanceApprovedBy | null;
}

export interface AttendancePagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AttendanceResponse {
  items: AttendanceRecord[];
  pagination: AttendancePagination;
}

export interface AttendanceListParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
  date?: string;
  status?: AttendanceStatus;
  source?: AttendanceSource;
}