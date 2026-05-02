import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";

type HeloraDialogLayoutProps = {
  open: boolean;
  title: string;
  description: string;
  icon?: React.ElementType;
  isBusy?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
};

export function HeloraDialogLayout({
  open,
  title,
  description,
  icon: Icon = UserPlus,
  isBusy,
  children,
  footer,
  onClose,
}: HeloraDialogLayoutProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isBusy) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-xl font-black tracking-tight text-slate-950">
                  {title}
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                  {description}
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isBusy}
              className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto bg-slate-50 p-5">
          {children}
        </div>

        {footer && (
          <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}