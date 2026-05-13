import { AlertTriangle, Mail, RotateCcw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { EmailLog } from "../types/email.types";
import { EmailStatusBadge } from "./email-status-badge";

type EmailDetailDialogProps = {
  open: boolean;
  email?: EmailLog | null;
  isResending?: boolean;
  onClose: () => void;
  onResend: (email: EmailLog) => void;
};

export function EmailDetailDialog({
  open,
  email,
  isResending,
  onClose,
  onResend,
}: EmailDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-black text-slate-950">
                Email Log
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-sm font-medium text-slate-500">
                {email?.subject ?? "View delivery details"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {email && (
          <div className="max-h-[calc(92vh-145px)] overflow-y-auto bg-slate-50 p-5">
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Recipient
                  </p>
                  <p className="mt-1 font-bold text-slate-900">
                    {email.recipientEmail}
                  </p>
                </div>
                <EmailStatusBadge status={email.status} />
              </div>

              <Separator />

              <DetailRow label="Subject" value={email.subject} />
              <DetailRow label="Template" value={email.templateKey || "-"} />
              <DetailRow label="Provider" value={email.provider} />
              <DetailRow
                label="Provider Message ID"
                value={email.providerMessageId || "-"}
              />
              <DetailRow
                label="Related Entity"
                value={
                  email.relatedEntityType
                    ? `${email.relatedEntityType} ${email.relatedEntityId ?? ""}`
                    : "-"
                }
              />
              <DetailRow label="Created" value={formatDateTime(email.createdAt)} />
              <DetailRow
                label="Sent"
                value={email.sentAt ? formatDateTime(email.sentAt) : "-"}
              />

              {email.errorMessage && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-bold text-red-700">
                        Delivery error
                      </p>
                      <p className="mt-1 text-sm font-medium text-red-700">
                        {email.errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="border-t bg-white px-5 py-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {email && (
            <Button
              onClick={() => onResend(email)}
              disabled={isResending}
              className="font-bold"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Resend
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

