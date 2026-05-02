import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCheck,
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  User,
} from "lucide-react";
import type { WhatsAppMessage } from "../types/whatsapp.types";
import { WhatsAppMessageStatusBadge } from "./whatsapp-message-status-badge";
import { WhatsAppMessageTypeBadge } from "./whatsapp-message-type-badge";

interface Props {
  open: boolean;
  message?: WhatsAppMessage | null;
  isRetrying?: boolean;
  onClose: () => void;
  onRetry: (message: WhatsAppMessage) => void;
}

export function WhatsAppMessageDetailsDialog({
  open,
  message,
  isRetrying,
  onClose,
  onRetry,
}: Props) {
  if (!message) return null;

  const canRetry = message.status === "FAILED";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                <MessageCircle className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="truncate text-xl font-black tracking-tight text-slate-950">
                  WhatsApp Message
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                  {message.phoneNumber} · {formatDateTime(message.createdAt)}
                </DialogDescription>
              </div>
            </div>

            <WhatsAppMessageStatusBadge status={message.status} />
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto bg-slate-50 p-5">
          <div className="space-y-4">
            {message.status === "FAILED" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <p className="font-black text-red-900">
                      Message was not sent
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-red-700">
                      {message.errorMessage ||
                        "WhatsApp provider did not send this message. You can try sending it again."}
                    </p>

                    {canRetry && (
                      <Button
                        type="button"
                        onClick={() => onRetry(message)}
                        disabled={isRetrying}
                        className="mt-3 h-9 rounded-lg font-bold"
                      >
                        {isRetrying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={User} title="Customer details" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Customer"
                  value={message.customer?.fullName || "Not linked"}
                />
                <InfoItem label="Phone" value={message.phoneNumber} />
                <InfoItem
                  label="Town"
                  value={message.customer?.town || "Not added"}
                />
                <InfoItem
                  label="Direction"
                  value={
                    message.direction === "OUTBOUND"
                      ? "Sent to customer"
                      : "Received from customer"
                  }
                />
              </div>
            </section>

            {message.order && (
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <SectionHeading icon={ShoppingBag} title="Order details" />

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoItem label="Order number" value={message.order.orderNumber} />
                  <InfoItem
                    label="Order status"
                    value={message.order.status || "Not available"}
                  />
                </div>
              </section>
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={MessageCircle} title="Message" />

              <div className="mt-4 flex flex-wrap gap-2">
                <WhatsAppMessageTypeBadge type={message.type} />
                <WhatsAppMessageStatusBadge status={message.status} />
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">
                  {message.message}
                </p>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={Clock} title="Message timeline" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Created"
                  value={formatDateTime(message.createdAt)}
                />
                <InfoItem label="Sent" value={formatDateTime(message.sentAt)} />
                <InfoItem
                  label="Delivered"
                  value={formatDateTime(message.deliveredAt)}
                />
                <InfoItem label="Read" value={formatDateTime(message.readAt)} />
                <InfoItem
                  label="Failed"
                  value={formatDateTime(message.failedAt)}
                />
                <InfoItem
                  label="Retry count"
                  value={`${message.retryCount ?? 0}`}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionHeading icon={CheckCheck} title="Provider details" />

              <div className="mt-4 grid gap-3">
                <InfoItem
                  label="Provider message ID"
                  value={message.providerMessageId || "Not available"}
                />

                <InfoItem
                  label="Last updated"
                  value={formatDateTime(message.updatedAt)}
                />
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-slate-600" />
      <h3 className="font-black text-slate-950">{title}</h3>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 wrap-break-word text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}