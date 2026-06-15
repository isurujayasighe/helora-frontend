"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Order } from "@/types/orders";
import {
  formatCurrency,
  formatDisplayDate,
  formatOrderStatus,
  getOrderQuantity,
  getOrderTitle,
} from "../utils";

type DashboardOrdersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  countLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: LucideIcon;
  orders: Order[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  tone?: "default" | "destructive";
  onPageChange: (page: number) => void;
  onViewAll: () => void;
  onViewOrder: (orderId: string) => void;
};

export function DashboardOrdersSheet({
  open,
  onOpenChange,
  title,
  description,
  countLabel,
  emptyTitle,
  emptyDescription,
  emptyIcon: EmptyIcon,
  orders,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  tone = "default",
  onPageChange,
  onViewAll,
  onViewOrder,
}: DashboardOrdersSheetProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </div>

            <Badge variant={tone === "destructive" ? "destructive" : "outline"}>
              {totalItems} {countLabel}
            </Badge>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <Empty className="h-48 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <EmptyIcon />
                </EmptyMedia>
                <EmptyTitle>{emptyTitle}</EmptyTitle>
                <EmptyDescription>{emptyDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          #{order.orderNumber}
                        </p>
                        <Badge
                          variant={
                            tone === "destructive" ? "destructive" : "outline"
                          }
                        >
                          {formatOrderStatus(order.status, order.promisedDate)}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-foreground">
                        {order.customer?.fullName ?? "-"}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {getOrderTitle(order)}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Promised {formatDisplayDate(order.promisedDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 border-t pt-3 text-xs text-muted-foreground sm:grid-cols-3">
                    <div>
                      <span className="font-medium text-foreground">Qty:</span>{" "}
                      {getOrderQuantity(order)}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        Order date:
                      </span>{" "}
                      {formatDisplayDate(order.orderDate)}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        Balance:
                      </span>{" "}
                      {formatCurrency(order.balanceAmount)}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewOrder(order.id)}
                    >
                      View details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {safeTotalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= safeTotalPages || isLoading}
              onClick={() =>
                onPageChange(Math.min(currentPage + 1, safeTotalPages))
              }
            >
              Next
            </Button>

            <Button type="button" size="sm" onClick={onViewAll}>
              View all
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
