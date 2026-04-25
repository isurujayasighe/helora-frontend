"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrdersTable({ orders, onAction }: { orders: any[], onAction: (o: any) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="py-4 pl-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Reference</TableHead>
            <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
            <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Created</TableHead>
            <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Destination</TableHead>
            <TableHead className="text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Amount</TableHead>
            <TableHead className="pr-6 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderNo} className="group transition-colors hover:bg-slate-50/40">
              <TableCell className="py-4 pl-6 font-bold text-[#070B3F]">
                #{order.orderNo}
              </TableCell>
              <TableCell>
                <div className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-tight",
                  order.state === "Processing" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  <div className={cn("h-1 w-1 rounded-full", order.state === "Processing" ? "bg-blue-600" : "bg-emerald-600")} />
                  {order.state}
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium text-slate-500">
                {new Date(order.dateEntered).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3 w-3 text-slate-300" />
                  <span className="truncate max-w-30">{order.shipAddrNo || "Global"}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-black tabular-nums text-[#070B3F]">
                £{Number(order.totalAmount).toLocaleString()}
              </TableCell>
              <TableCell className="pr-6 text-right">
                <Button 
                  onClick={() => onAction(order)}
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#1963FF] hover:text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}