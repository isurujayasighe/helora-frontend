"use client";

import { CalendarDays, Loader2, MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardRecentOrder } from "../types";
import { formatDisplayDate } from "../utils";
import { DashboardSectionCard } from "./dashboard-section-card";

interface RecentOrdersTableCardProps {
  orders: DashboardRecentOrder[];
  isLoading?: boolean;
  className?: string;
  onViewAll?: () => void;
  onViewOrder?: (orderId: string) => void;
}

function getStatusBadgeVariant(status: string) {
  if (status === "Overdue") return "destructive";

  if (["Ready", "Delivered", "Completed"].includes(status)) {
    return "secondary";
  }

  if (["Confirmed", "Cutting", "Sewing", "In Progress"].includes(status)) {
    return "default";
  }

  return "outline";
}

export function RecentOrdersTableCard({
  orders,
  isLoading,
  className,
  onViewAll,
  onViewOrder,
}: RecentOrdersTableCardProps) {
  return (
    <DashboardSectionCard
      title="Recent Orders"
      icon={CalendarDays}
      actionLabel="View all orders"
      onAction={onViewAll}
      className={className}
      contentClassName="overflow-hidden"
    >
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Promised Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-40 text-center text-sm text-muted-foreground"
                >
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Loading recent orders...
                  </span>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <Empty className="h-40 border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <CalendarDays />
                      </EmptyMedia>
                      <EmptyTitle>No recent orders</EmptyTitle>
                      <EmptyDescription>
                        New orders will appear here after they are created.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold">
                    {order.orderNo}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="max-w-52 truncate">
                    {order.itemName}
                  </TableCell>
                  <TableCell>{order.quantity} pcs</TableCell>
                  <TableCell>{formatDisplayDate(order.promisedDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Open actions for ${order.orderNo}`}
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => onViewOrder?.(order.id)}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={onViewAll}>
                          View all orders
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {orders.length > 0 && (
        <div className="mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-muted-foreground"
          >
            View all recent orders
          </Button>
        </div>
      )}
    </DashboardSectionCard>
  );
}
