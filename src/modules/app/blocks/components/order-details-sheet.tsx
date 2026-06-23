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
import { Badge } from "@/components/ui/badge";

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
        className="flex h-[90vh] w-[95vw] flex-col overflow-hidden border p-0 sm:h-[85vh] sm:max-w-4xl"
        showCloseButton={false}
      >
        {/* 1. Sleek Header */}
        <div className="p-6 border-b z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Line Item Details
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs uppercase mt-0.5">
                  <Hash className="h-3 w-3" />
                  Order {order?.orderNo}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center transition-all border"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New: Order Metadata Grid */}
          {/* Updated: Order Metadata Grid with expanded address area */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border">
            {/* Address takes 2 columns on desktop for better readability */}
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase">
                <MapPin className="h-3 w-3" /> Delivery Address
              </div>
              <p className="text-xs leading-normal wrap-break-word">
                {order.shipAddrNo || "No address provided"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase">
                <Calendar className="h-3 w-3" /> Order Date
              </div>
              <p className="text-xs">{order.dateEntered || "—"}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase">
                <Activity className="h-3 w-3" /> Status
              </div>
              <div>
                <Badge variant="secondary">{order.ifsState || "Unknown"}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="px-6 py-3 border-b">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by part description..."
              className="pl-11 h-10 text-sm transition-all"
              value={innerSearch}
              onChange={(e) => setInnerSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 3. High-Density List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredLines.map((line: any, index: number) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border transition-all group"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="h-8 w-8 border flex items-center justify-center text-xs font-semibold shrink-0">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-xs leading-tight">{line.salesParts}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs uppercase">
                      {line.state}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 mt-4 md:mt-0 pl-12 md:pl-0">
                <div className="text-left md:text-right min-w-20">
                  <p className="text-xs mb-0.5">Quantity</p>
                  <p className="text-sm font-mono">{line.qty}</p>
                </div>
                <div className="text-left md:text-right min-w-28">
                  <p className="text-xs mb-0.5">Gross Total</p>
                  <p className="text-sm font-mono">
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
              <Search className="h-10 w-10 mx-auto mb-3" />
              <h3 className="text-sm">No items found</h3>
              <p className="text-xs mt-1">Try adjusting your search query.</p>
            </div>
          )}
        </div>

        {/* 4. Professional Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-6 ml-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-tighter">
                Total Items
              </p>
              <p className="text-xs font-semibold">{filteredLines.length}</p>
            </div>
            <div className="h-8 w-px" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-tighter">
                Total Qty
              </p>
              <p className="text-xs font-semibold">{totalQty}</p>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="px-8 h-10 text-xs uppercase transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
