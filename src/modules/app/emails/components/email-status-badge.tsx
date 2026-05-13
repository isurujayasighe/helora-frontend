import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EmailStatus } from "../types/email.types";

const statusStyles: Record<EmailStatus, string> = {
  PENDING: "border-amber-100 bg-amber-50 text-amber-700",
  SENT: "border-emerald-100 bg-emerald-50 text-emerald-700",
  FAILED: "border-red-100 bg-red-50 text-red-700",
};

export function EmailStatusBadge({ status }: { status: EmailStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 font-bold", statusStyles[status])}
    >
      {status}
    </Badge>
  );
}

