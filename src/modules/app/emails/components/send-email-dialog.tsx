import { useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SendEmailPayload } from "../types/email.types";

type SendEmailDialogProps = {
  open: boolean;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (payload: SendEmailPayload) => Promise<unknown>;
};

export function SendEmailDialog({
  open,
  isPending,
  onOpenChange,
  onSend,
}: SendEmailDialogProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Hello from Helora ERP</p>");
  const [text, setText] = useState("Hello from Helora ERP");

  const reset = () => {
    setTo("");
    setSubject("");
    setHtml("<p>Hello from Helora ERP</p>");
    setText("Hello from Helora ERP");
  };

  const handleSubmit = async () => {
    await onSend({
      to,
      subject,
      html,
      text,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-950">
                Send Email
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                Send a transactional email through the configured provider.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-150px)] space-y-4 overflow-y-auto bg-slate-50 p-5">
          <div className="grid gap-2">
            <Label htmlFor="email-to" className="font-bold text-slate-700">
              To
            </Label>
            <Input
              id="email-to"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="customer@example.com"
              className="h-11 rounded-lg bg-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email-subject" className="font-bold text-slate-700">
              Subject
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Test email from Helora ERP"
              className="h-11 rounded-lg bg-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email-html" className="font-bold text-slate-700">
              HTML body
            </Label>
            <Textarea
              id="email-html"
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              className="min-h-36 rounded-lg bg-white font-mono text-sm"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email-text" className="font-bold text-slate-700">
              Text body
            </Label>
            <Textarea
              id="email-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-24 rounded-lg bg-white"
            />
          </div>
        </div>

        <DialogFooter className="border-t bg-white px-5 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !to.trim() || !subject.trim()}
            className="font-bold"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

