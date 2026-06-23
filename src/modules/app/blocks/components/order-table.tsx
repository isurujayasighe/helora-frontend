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
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, MapPin } from "lucide-react";

export function OrdersTable({
  orders,
  onAction,
}: {
  orders: any[];
  onAction: (o: any) => void;
}) {
  return (
    <div className="border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-4 pl-6 text-xs font-semibold uppercase">
              Reference
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase">
              Created
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase">
              Destination
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase">
              Amount
            </TableHead>
            <TableHead className="pr-6 text-right text-xs font-semibold uppercase">
              Manage
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderNo} className="group transition-colors">
              <TableCell className="py-4 pl-6">#{order.orderNo}</TableCell>
              <TableCell>
                <Badge variant="secondary">{order.state}</Badge>
              </TableCell>
              <TableCell className="text-sm font-medium">
                {new Date(order.dateEntered).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-30">
                    {order.shipAddrNo || "Global"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                £{Number(order.totalAmount).toLocaleString()}
              </TableCell>
              <TableCell className="pr-6 text-right">
                <Button
                  onClick={() => onAction(order)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
