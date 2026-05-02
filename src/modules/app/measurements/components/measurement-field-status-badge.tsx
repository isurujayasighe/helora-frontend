import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleMinus, Star } from "lucide-react";

export function MeasurementFieldStatusBadge({
  isActive,
  isRequired,
}: {
  isActive: boolean;
  isRequired: boolean;
}) {
  if (!isActive) {
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

  if (isRequired) {
    return (
      <Badge className="rounded-lg bg-slate-900 px-2.5 py-1 font-bold text-white hover:bg-slate-900">
        <Star className="mr-1 h-3.5 w-3.5" />
        Required
      </Badge>
    );
  }

  return (
    <Badge className="rounded-lg bg-emerald-600 px-2.5 py-1 font-bold text-white hover:bg-emerald-600">
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
      Active
    </Badge>
  );
}