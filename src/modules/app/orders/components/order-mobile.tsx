"use client";
import { cn } from "@/lib/utils";

export function OrderCard({ order, onClick }: { order: any; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm active:scale-[0.98] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Ref</span>
          <span className="text-base font-black text-[#070B3F]">#{order.orderNo}</span>
        </div>
        
        <div className={cn(
          "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
          order.state === "Processing" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {order.state}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase text-slate-400">Date</span>
          <span className="text-xs font-semibold text-slate-700">
            {new Date(order.dateEntered).toLocaleDateString("en-GB")}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[9px] font-bold uppercase text-slate-400">Gross Total</span>
          <span className="text-sm font-black text-[#070B3F]">
            £{Number(order.totalAmount).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}