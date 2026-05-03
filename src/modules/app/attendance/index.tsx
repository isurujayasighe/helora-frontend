import { useMemo, useState } from "react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Clock,
  Eye,
  MoreVertical,
  RefreshCw,
  Search, 
  UserCheck,
  UsersRound,
} from "lucide-react";
import type {
  AttendanceRecord,
  AttendanceSource,
  AttendanceStatus,
} from "./types/attendance.types";
import { useAttendanceQuery } from "./api/attendance-api";
import { AttendanceStatusBadge } from "./components/attendance-status-badge";
import { AttendanceDetailsDialog } from "./components/attendance-detail-dialog";

type StatusFilter = "ALL" | AttendanceStatus;
type SourceFilter = "ALL" | AttendanceSource;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All status" },
  { value: "PRESENT", label: "Present" },
  { value: "LATE", label: "Late" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "LEAVE", label: "Leave" },
  { value: "HOLIDAY", label: "Holiday" },
];

const sourceFilters: Array<{ value: SourceFilter; label: string }> = [
  { value: "ALL", label: "All sources" },
  { value: "DEVICE", label: "Device" },
  { value: "MANUAL", label: "Manual" },
  { value: "IMPORT", label: "Imported" },
];

export default function AttendancePage() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceRecord | null>(null);

  const { data, isLoading, isRefetching, refetch } = useAttendanceQuery({
    pageIndex,
    pageSize,
    search,
    date: selectedDate,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    source: sourceFilter === "ALL" ? undefined : sourceFilter,
  });

  const records = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const pageCount = Math.max(1, pagination?.totalPages ?? 1);

  const stats = useMemo(() => {
    const present = records.filter((item) => item.status === "PRESENT").length;
    const late = records.filter((item) => item.status === "LATE").length;
    const missingCheckout = records.filter(
      (item) => item.firstIn && !item.lastOut
    ).length;
    const overtimeMinutes = records.reduce(
      (sum, item) => sum + (item.overtimeMinutes || 0),
      0
    );

    return {
      total,
      present,
      late,
      missingCheckout,
      overtimeMinutes,
    };
  }, [records, total]);

  const openDetails = (record: AttendanceRecord) => {
    setSelectedAttendance(record);
    setDetailsOpen(true);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSourceFilter("ALL");
    setPageIndex(0);
  };

  return (
    <PermissionGate action="read" subject="attendance">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-attendance"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <Clock className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Attendance
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Track daily in time, out time, late minutes, and overtime.
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
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AttendanceStatCard
                title="Total Records"
                value={stats.total}
                description="Attendance records for selected day"
                icon={UsersRound}
              />

              <AttendanceStatCard
                title="Present"
                value={stats.present}
                description="Employees marked present"
                icon={UserCheck}
              />

              <AttendanceStatCard
                title="Late"
                value={stats.late}
                description="Employees came after expected time"
                icon={Clock}
              />

              <AttendanceStatCard
                title="Missing Checkout"
                value={stats.missingCheckout}
                description="In time marked, out time missing"
                icon={AlertTriangle}
              />
            </div>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid w-full gap-3 md:grid-cols-[1fr_220px] xl:max-w-2xl">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPageIndex(0);
                        }}
                        placeholder="Search by employee name, number, department..."
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                      />
                    </div>

                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => {
                        setSelectedDate(event.target.value);
                        setPageIndex(0);
                      }}
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
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
                      label="Source"
                      value={
                        sourceFilters.find((item) => item.value === sourceFilter)
                          ?.label ?? "Source"
                      }
                      items={sourceFilters}
                      onSelect={(value) => {
                        setSourceFilter(value as SourceFilter);
                        setPageIndex(0);
                      }}
                    />

                    {(search ||
                      statusFilter !== "ALL" ||
                      sourceFilter !== "ALL") && (
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
                      Attendance List
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      Review employee attendance for{" "}
                      {formatDateOnly(selectedDate)}.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {total} records
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-0">
                <AttendanceTable
                  records={records}
                  isLoading={isLoading}
                  onView={openDetails}
                />
              </CardContent>

              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-500">
                  Page {pageIndex + 1} of {pageCount}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination?.hasPreviousPage}
                    onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                    className="h-9 rounded-lg font-bold"
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!pagination?.hasNextPage}
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    className="h-9 rounded-lg font-bold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <AttendanceDetailsDialog
          open={detailsOpen}
          attendance={selectedAttendance}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedAttendance(null);
          }}
        />
      </div>
    </PermissionGate>
  );
}

function AttendanceStatCard({
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
        <Button variant="outline" className="h-10 rounded-lg bg-white font-bold">
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

function AttendanceTable({
  records,
  isLoading,
  onView,
}: {
  records: AttendanceRecord[];
  isLoading: boolean;
  onView: (record: AttendanceRecord) => void;
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

  if (!records.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Clock className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-950">
          No attendance found
        </h3>
        <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
          No employee attendance records match your selected date or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-262.5">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_70px] border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
        <div>Employee</div>
        <div>Date</div>
        <div>In / Out</div>
        <div>Worked</div>
        <div>Late</div>
        <div>Status</div>
        <div />
      </div>

      {records.map((record) => {
        const isMissingCheckout = Boolean(record.firstIn && !record.lastOut);

        return (
          <div
            key={record.id}
            className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_70px] items-center border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50"
          >
            <button
              type="button"
              onClick={() => onView(record)}
              className="min-w-0 text-left"
            >
              <p className="truncate font-black text-slate-950">
                {record.employee.fullName}
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                {record.employee.employeeNumber} · {record.employee.department}
              </p>
            </button>

            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {formatDateOnly(record.attendanceDate)}
            </div>

            <div>
              <p className="text-sm font-black text-slate-900">
                {formatTime(record.firstIn)} - {formatTime(record.lastOut)}
              </p>

              {isMissingCheckout && (
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Missing checkout
                </p>
              )}
            </div>

            <div>
              <p className="font-bold text-slate-800">
                {formatMinutes(record.totalMinutes)}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                OT {formatMinutes(record.overtimeMinutes)}
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800">
                {formatMinutes(record.lateMinutes)}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Expected {record.expectedInTime}
              </p>
            </div>

            <AttendanceStatusBadge status={record.status} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(record)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}

function formatDateOnly(value: string) {
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
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