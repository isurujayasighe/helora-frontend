import { memo, useMemo, useState } from "react";
import {
  FileText,
  FileDown,
  Loader2,
  FileSearchCorner,
  CalendarDaysIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "./table-component";
import {
  type Invoice,
  downloadInvoicePdf,
  getInvoiceBlob,
} from "../api/useGetInvoices";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getStatusStyles = (status: string, isOverdue: boolean) => {
  const s = status || "";

  if (isOverdue) {
    return {
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      text: "text-rose-700",
      iconBg: "bg-rose-100",
      accent: "bg-rose-500",
      ring: "ring-rose-500/20",
    };
  }

  if (s.toLowerCase().includes("paid")) {
    return {
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
      accent: "bg-emerald-500",
      ring: "ring-emerald-500/20",
    };
  }

  return {
    bg: "bg-slate-50/50",
    border: "border-slate-100",
    text: "text-slate-700",
    iconBg: "bg-slate-100",
    accent: "bg-slate-500",
    ring: "ring-slate-500/20",
  };
};

interface InvoiceCardProps {
  invoice: Invoice;
  onViewDetails: () => void;
}

export const InvoiceCard = memo(({ invoice }: InvoiceCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const styles = useMemo(
    () => getStatusStyles(invoice.portalStatus, invoice.isOverdue),
    [invoice.portalStatus, invoice.isOverdue]
  );

  const formattedInvoiceDate = useMemo(() => {
    if (!invoice.invoiceDate) return "N/A";
    return new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [invoice.invoiceDate]);

  const formattedDueDate = useMemo(() => {
    if (!invoice.dueDate) return "N/A";
    return new Date(invoice.dueDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [invoice.dueDate]);

  const formattedAmount = useMemo(() => {
    return Number(invoice.openAmount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [invoice.openAmount]);

  const handleViewInvoice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!invoice.canDownload) return;

    try {
      setIsPreviewLoading(true);
      const blob = await getInvoiceBlob(invoice.invoiceId, invoice.company);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsViewing(true);
    } catch (error) {
      console.error("Failed to load preview", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!invoice.canDownload || isDownloading) return;

    try {
      setIsDownloading(true);
      await downloadInvoicePdf(
        invoice.invoiceId,
        invoice.company,
        invoice.invoiceNo
      );
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg">
        <div
          role="button"
          className="flex items-start gap-3 bg-white p-3 transition-colors hover:bg-slate-50/30 md:items-center md:gap-6"
        >
          {/* Leading icon */}
          {/* <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border md:h-7 md:w-7 md:rounded-xl",
              styles.iconBg,
              styles.border,
              styles.text
            )}
          >
            {invoice.isOverdue ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div> */}

          {/* Details */}
          <div className="min-w-0 flex-1">
            {/* Mobile */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:hidden">
              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Invoice No
                </span>
                <h3 className="truncate text-xs font-semibold tracking-tight text-slate-900">
                  #{invoice.invoiceNo}
                </h3>
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </span>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status={invoice.portalStatus} />
                </div>
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Invoice Date
                </span>
                <div
                  className={cn(
                    "flex items-center text-[11px] font-medium",
                    invoice.isOverdue ? "text-rose-600" : "text-slate-600"
                  )}
                >
                  <CalendarDaysIcon className="mr-1 h-3 w-3 text-slate-400" />
                  <span className="truncate">{formattedInvoiceDate}</span>
                </div>
              </div>

              <div className="min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Due Date
                </span>
                <div
                  className={cn(
                    "flex items-center text-[11px] font-medium",
                    invoice.isOverdue ? "text-rose-600" : "text-slate-600"
                  )}
                >
                  <CalendarDaysIcon className="mr-1 h-3 w-3 text-slate-400" />
                  <span className="truncate">{formattedDueDate}</span>
                </div>
              </div>

              <div className="col-span-2 min-w-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Total
                </span>
                <p
                  className={cn(
                    "text-sm font-bold leading-none tabular-nums tracking-tight",
                    styles.text
                  )}
                >
                  <span className="mr-1 text-xs font-medium opacity-75">
                    {invoice.currencyCode}
                  </span>
                  {formattedAmount}
                </p>
              </div>

              {invoice.isOverdue && (
                <div className="col-span-2 min-w-0 border-t border-slate-100 pt-2">
                  <span className="inline-flex rounded-md border border-rose-100/50 px-1.5 py-0.5 text-[10px] font-medium tracking-tight text-slate-900">
                    Overdue
                  </span>
                </div>
              )}
            </div>

            {/* Desktop */}
            <div className="hidden items-center md:grid md:grid-cols-6 md:gap-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Invoice No
                </span>
                <h3 className="truncate text-sm font-bold text-slate-900">
                  #{invoice.invoiceNo}
                </h3>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Invoice Date
                </span>
                <div
                  className={cn(
                    "flex items-center text-xs font-semibold",
                    invoice.isOverdue ? "text-rose-600" : "text-slate-600"
                  )}
                >
                  {formattedInvoiceDate}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Due Date
                </span>
                <div
                  className={cn(
                    "flex items-center text-xs font-semibold",
                    invoice.isOverdue ? "text-rose-600" : "text-slate-600"
                  )}
                >
                  {formattedDueDate}
                </div>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={invoice.portalStatus} />
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-0.5 md:items-start">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </span>

                <p
                  className={cn(
                    "text-sm font-bold tabular-nums tracking-tight",
                    styles.text
                  )}
                >
                  <span className="mr-1 text-xs font-medium opacity-75">
                    {invoice.currencyCode}
                  </span>
                  {formattedAmount}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {invoice.isOverdue && (
                  <div className="flex items-center gap-1.5 animate-in slide-in-from-left-1 fade-in duration-300">
                    <span className="rounded-md border border-rose-100/50 px-1.5 py-0.5 text-[10px] font-medium capitalize tracking-tight text-slate-900">
                      Overdue
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2 md:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-not-allowed">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleViewInvoice}
                    disabled={isPreviewLoading || !invoice.canDownload}
                    className={cn(
                      "h-8 w-8 rounded-lg transition-all md:h-9 md:w-9",
                      invoice.canDownload
                        ? "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                        : "text-slate-200"
                    )}
                  >
                    {isPreviewLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSearchCorner className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </Button>
                </span>
              </TooltipTrigger>

              <TooltipContent
                side="bottom"
                className="bg-slate-900 text-xs text-white"
              >
                <p>
                  {!invoice.canDownload
                    ? "Preview unavailable"
                    : isPreviewLoading
                    ? "Loading preview..."
                    : "Preview Invoice"}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Enable this if you want download button back */}
            {/* 
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-not-allowed">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDownload}
                    disabled={isDownloading || !invoice.canDownload}
                    className={cn(
                      "h-8 w-8 rounded-lg transition-all md:h-9 md:w-9",
                      invoice.canDownload
                        ? "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                        : "text-slate-200"
                    )}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </Button>
                </span>
              </TooltipTrigger>

              <TooltipContent
                side="bottom"
                className="bg-slate-900 text-xs text-white"
              >
                <p>
                  {!invoice.canDownload
                    ? "Download unavailable"
                    : isDownloading
                    ? "Downloading..."
                    : "Download PDF"}
                </p>
              </TooltipContent>
            </Tooltip> 
            */}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={isViewing}
        onOpenChange={(open) => {
          if (!open) setPdfUrl(null);
          setIsViewing(open);
        }}
      >
        <DialogContent className="flex h-[92vh] max-w-[95vw] flex-col gap-0 overflow-hidden border-none p-0 shadow-2xl md:max-w-7xl">
          <DialogHeader className="shrink-0 border-b bg-white p-4 md:px-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Invoice Details: #{invoice.invoiceNo}
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500">
                  {invoice.company} • {invoice.portalStatus}{" "}
                  {invoice.isOverdue && "• OVERDUE"}
                </DialogDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="mr-8 border-slate-200 hover:bg-slate-50"
              >
                <FileDown className="mr-2 h-3.5 w-3.5" />
                Download PDF
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-1 justify-center overflow-hidden bg-slate-200/50 p-4 md:p-8">
            <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">
              {pdfUrl ? (
                <iframe
                  src={`${pdfUrl}#view=FitH`}
                  className="h-full w-full border-none"
                  title="Invoice PDF"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});