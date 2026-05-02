import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCheck,
  Clock,
  Eye,
  Send,
  XCircle,
} from "lucide-react";
import type { WhatsAppMessageStatus } from "../types/whatsapp.types";

export function WhatsAppMessageStatusBadge({
  status,
}: {
  status: WhatsAppMessageStatus;
}) {
  if (status === "PENDING") {
    return (
      <Badge className="rounded-lg bg-slate-500 px-2.5 py-1 font-bold text-white hover:bg-slate-500">
        <Clock className="mr-1 h-3.5 w-3.5" />
        Waiting
      </Badge>
    );
  }

  if (status === "SENT") {
    return (
      <Badge className="rounded-lg bg-blue-600 px-2.5 py-1 font-bold text-white hover:bg-blue-600">
        <Send className="mr-1 h-3.5 w-3.5" />
        Sent
      </Badge>
    );
  }

  if (status === "DELIVERED") {
    return (
      <Badge className="rounded-lg bg-emerald-600 px-2.5 py-1 font-bold text-white hover:bg-emerald-600">
        <CheckCheck className="mr-1 h-3.5 w-3.5" />
        Delivered
      </Badge>
    );
  }

  if (status === "READ") {
    return (
      <Badge className="rounded-lg bg-cyan-600 px-2.5 py-1 font-bold text-white hover:bg-cyan-600">
        <Eye className="mr-1 h-3.5 w-3.5" />
        Read
      </Badge>
    );
  }

  if (status === "FAILED") {
    return (
      <Badge className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-600">
        <XCircle className="mr-1 h-3.5 w-3.5" />
        Failed
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-600"
    >
      <AlertCircle className="mr-1 h-3.5 w-3.5" />
      Unknown
    </Badge>
  );
}