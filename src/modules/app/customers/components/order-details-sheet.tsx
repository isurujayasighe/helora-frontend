import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  Package2,
  Hash,
  MapPin,
  Calendar,
  Activity,
} from "lucide-react";
import type { Order, SalesPart } from "../types/Order";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OrderDetailsDialog({
  order,
  isOpen,
  onClose,
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [innerSearch, setInnerSearch] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) setInnerSearch("");
  }, [isOpen]);

  if (!order) return null;

  const filteredLines =
    order?.orderLines?.filter((line: SalesPart) =>
      line.salesParts.toLowerCase().includes(innerSearch.toLowerCase()),
    ) || [];

  // Calculate Total Quantity
  const totalQty =
    order?.orderLines?.reduce(
      (acc, line) => acc + (Number(line.qty) || 0),
      0,
    ) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[85vh] p-0 overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl bg-white"
        showCloseButton={false}
      >
        {/* 1. Sleek Header */}
        <div className="p-6 border-b border-slate-100 bg-white z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
                  Line Item Details
                </DialogTitle>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900 uppercase tracking-widest mt-0.5">
                  <Hash className="h-3 w-3" />
                  Order {order?.orderNo}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* New: Order Metadata Grid */}
          {/* Updated: Order Metadata Grid with expanded address area */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            {/* Address takes 2 columns on desktop for better readability */}
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-wider">
                <MapPin className="h-3 w-3" /> Delivery Address
              </div>
              <p className="text-[11px] font-bold text-slate-700 leading-normal wrap-break-word">
                {order.shipAddrNo || "No address provided"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-wider">
                <Calendar className="h-3 w-3" /> Order Date
              </div>
              <p className="text-xs font-bold text-slate-700">
                {order.dateEntered || "—"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-wider">
                <Activity className="h-3 w-3" /> Status
              </div>
              <div>
                <div
                  className={cn(
                    "inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight",
                    order.ifsState === "Invoiced"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700",
                  )}
                >
                  {order.ifsState || "Unknown"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input
              placeholder="Search by part description..."
              className="pl-11 bg-muted border-gray-200 placeholder:text-xs rounded-lg h-10 text-sm focus-visible:ring-2 focus-visible:ring-slate-900 transition-all"
              value={innerSearch}
              onChange={(e) => setInnerSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 3. High-Density List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/30">
          {filteredLines.map((line: any, index: number) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-sm group"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {line.salesParts}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {line.state}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 mt-4 md:mt-0 pl-12 md:pl-0">
                <div className="text-left md:text-right min-w-20">
                  <p className="text-xs font-bold text-slate-900  tracking-widest mb-0.5">
                    Quantity
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-900">
                    {line.qty}
                  </p>
                </div>
                <div className="text-left md:text-right min-w-28">
                  <p className="text-xs font-bold text-slate-900  tracking-widest mb-0.5">
                    Gross Total
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-900">
                    {line.grossAmount === "0"
                      ? "—"
                      : `${Number(line.grossAmount).toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredLines.length === 0 && (
            <div className="py-20 text-center">
              <Search className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">
                No items found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your search query.
              </p>
            </div>
          )}
        </div>

        {/* 4. Professional Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6 ml-2">
            <div>
              <p className="text-[9px] font-black  uppercase tracking-tighter">
                Total Items
              </p>
              <p className="text-xs font-black text-slate-900">
                {filteredLines.length}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div>
              <p className="text-[9px] font-black  uppercase tracking-tighter">
                Total Qty
              </p>
              <p className="text-xs font-black text-slate-900">{totalQty}</p>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="px-8 h-10 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
