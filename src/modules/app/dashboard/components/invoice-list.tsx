import { memo, useMemo, useState } from "react";
import {
  FileText,
  FileDown,
  Loader2,
  FileSearch,
  AlertCircle,
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
import {
  type Invoice,
  downloadInvoicePdf,
  getInvoiceBlob,
} from "../../invoice/api/useGetInvoices";

const getStatusStyles = (status: string, isOverdue: boolean) => {
  const s = status || "";

  // If overdue, we use a rose/red accent for the icon and total, but keep the portal status badge separate
  if (isOverdue)
    return {
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      text: "text-rose-700",
      iconBg: "bg-rose-100",
      accent: "bg-rose-500",
      ring: "ring-rose-500/20",
    };

  if (s.toLowerCase().includes("paid"))
    return {
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100",
      accent: "bg-emerald-500",
      ring: "ring-emerald-500/20",
    };

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

export const InvoiceCard = memo(
  ({ invoice, onViewDetails }: InvoiceCardProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const styles = useMemo(
      () => getStatusStyles(invoice.portalStatus, invoice.isOverdue),
      [invoice.portalStatus, invoice.isOverdue],
    );

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
        console.log(invoice);
        await downloadInvoicePdf(invoice.invoiceId, invoice.company,invoice.invoiceNo);
      } catch (error) {
        console.error("Download failed", error);
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <>
        <div className="group relative flex flex-col bg-white border border-slate-200 rounded-xl transition-all duration-300 shadow-sm hover:border-slate-300 hover:shadow-lg">
          <div
            role="button"
            className="p-4 md:p-5 flex items-center gap-4 md:gap-6 cursor-pointer select-none bg-white hover:bg-slate-50/30"
            onClick={onViewDetails}
          >
            {/* Main Icon - Shows Alert if overdue */}
            <div
              className={cn(
                "h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-105",
                styles.iconBg,
                styles.border,
                styles.text,
              )}
            >
              {invoice.isOverdue ? (
                <AlertCircle className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <FileText className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 min-w-0 grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-6 items-center">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-wider ">
                  Invoice No
                </span>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  #{invoice.invoiceNo}
                </h3>
              </div>

              <div className="hidden md:flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-wider ">
                  Due Date
                </span>
                <div
                  className={cn(
                    "flex items-center text-xs font-semibold",
                    invoice.isOverdue ? "text-rose-600" : "text-slate-600",
                  )}
                >
                  {new Date(invoice.dueDate).toLocaleDateString("en-GB")}
                </div>
              </div>

              {/* Status Column - Shows Dual Badges */}
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] uppercase font-black tracking-wider ">
                  Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {/* <StatusBadge status={invoice.ifsStatus} /> */}
                </div>
              </div>

              <div className="flex flex-col items-end md:items-start justify-center gap-0.5">
                {/* 1. Subdued label for better hierarchy */}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </span>

                <p
                  className={cn(
                    "text-sm font-bold tabular-nums tracking-tight",
                    styles.text,
                  )}
                >
                  {/* 2. De-emphasize the currency code slightly so the numbers pop */}
                  <span className="text-xs font-medium opacity-75 mr-1">
                    {invoice.currencyCode}
                  </span>

                  {/* 3. Added maximumFractionDigits for safety against long decimals */}
                  {Number(invoice.grossAmount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {/* <StatusBadge status={invoice.portalStatus} /> */}
                {invoice.isOverdue && (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1 duration-300">
                    {/* High-visibility pulse dot */}

                    {/* Clean, typographic label */}
                    <span className="text-[10px] font-medium capitalize tracking-tight text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100/50">
                      Overdue
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleViewInvoice}
                disabled={isPreviewLoading || !invoice.canDownload}
                className="h-9 w-9 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
              >
                {isPreviewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSearch className="h-5 w-5" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleDownload}
                disabled={isDownloading || !invoice.canDownload}
                className={cn(
                  "h-9 w-9 rounded-lg transition-all",
                  invoice.canDownload
                    ? "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                    : "text-slate-200",
                )}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-5 w-5" />
                )}
              </Button>
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
          <DialogContent className="max-w-[95vw] md:max-w-7xl h-[92vh] p-0 flex flex-col gap-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-4 md:px-6 border-b bg-white shrink-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
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
                  <FileDown className="h-3.5 w-3.5 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 bg-slate-200/50 p-4 md:p-8 flex justify-center overflow-hidden">
              <div className="w-full max-w-5xl h-full shadow-2xl rounded-lg overflow-hidden bg-white relative">
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#view=FitH`}
                    className="w-full h-full border-none"
                    title="Invoice PDF"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);
