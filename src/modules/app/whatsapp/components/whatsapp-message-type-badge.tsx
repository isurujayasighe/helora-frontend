import { Badge } from "@/components/ui/badge";
import {
  Bell,
  ClipboardList,
  CreditCard,
  MessageCircle,
  PackageCheck,
} from "lucide-react";
import type { WhatsAppMessageType } from "../types/whatsapp.types";

export function WhatsAppMessageTypeBadge({
  type,
}: {
  type: WhatsAppMessageType;
}) {
  if (type === "ORDER_CREATED") {
    return (
      <Badge
        variant="secondary"
        className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-700"
      >
        <ClipboardList className="mr-1 h-3.5 w-3.5" />
        Order Created
      </Badge>
    );
  }

  if (type === "ORDER_READY") {
    return (
      <Badge
        variant="secondary"
        className="rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700"
      >
        <PackageCheck className="mr-1 h-3.5 w-3.5" />
        Order Ready
      </Badge>
    );
  }

  if (type === "PAYMENT_RECEIVED") {
    return (
      <Badge
        variant="secondary"
        className="rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700"
      >
        <CreditCard className="mr-1 h-3.5 w-3.5" />
        Payment
      </Badge>
    );
  }

  if (type === "PAYMENT_REMINDER") {
    return (
      <Badge
        variant="secondary"
        className="rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-700"
      >
        <Bell className="mr-1 h-3.5 w-3.5" />
        Reminder
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-700"
    >
      <MessageCircle className="mr-1 h-3.5 w-3.5" />
      General
    </Badge>
  );
}