import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CalendarCheck2,
  Clock,
  Coffee,
  MinusCircle,
  Palmtree,
} from "lucide-react";
import type { AttendanceStatus } from "../types/attendance.types";

export function AttendanceStatusBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  if (status === "PRESENT") {
    return (
      <Badge className="rounded-lg bg-emerald-600 px-2.5 py-1 font-bold text-white hover:bg-emerald-600">
        <CalendarCheck2 className="mr-1 h-3.5 w-3.5" />
        Present
      </Badge>
    );
  }

  if (status === "LATE") {
    return (
      <Badge className="rounded-lg bg-amber-500 px-2.5 py-1 font-bold text-white hover:bg-amber-500">
        <Clock className="mr-1 h-3.5 w-3.5" />
        Late
      </Badge>
    );
  }

  if (status === "ABSENT") {
    return (
      <Badge className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-600">
        <AlertCircle className="mr-1 h-3.5 w-3.5" />
        Absent
      </Badge>
    );
  }

  if (status === "HALF_DAY") {
    return (
      <Badge className="rounded-lg bg-blue-600 px-2.5 py-1 font-bold text-white hover:bg-blue-600">
        <Coffee className="mr-1 h-3.5 w-3.5" />
        Half Day
      </Badge>
    );
  }

  if (status === "LEAVE") {
    return (
      <Badge className="rounded-lg bg-purple-600 px-2.5 py-1 font-bold text-white hover:bg-purple-600">
        <Palmtree className="mr-1 h-3.5 w-3.5" />
        Leave
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-600"
    >
      <MinusCircle className="mr-1 h-3.5 w-3.5" />
      Holiday
    </Badge>
  );
}