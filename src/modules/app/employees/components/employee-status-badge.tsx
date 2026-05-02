import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleMinus, XCircle } from "lucide-react";
import type { EmployeeStatus } from "../types/employee.types";

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  if (status === "ACTIVE") {
    return (
      <Badge className="rounded-lg bg-emerald-600 px-2.5 py-1 font-bold text-white hover:bg-emerald-600">
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        Working
      </Badge>
    );
  }

  if (status === "LEFT") {
    return (
      <Badge className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-600">
        <XCircle className="mr-1 h-3.5 w-3.5" />
        Left
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-600"
    >
      <CircleMinus className="mr-1 h-3.5 w-3.5" />
      Inactive
    </Badge>
  );
}