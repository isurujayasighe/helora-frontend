"use client";

import { ClipboardList } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DashboardPipelineStage } from "../types";
import { DashboardSectionCard } from "./dashboard-section-card";

const dotToneClassNames = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  destructive: "bg-destructive",
};

type OrderPipelineCardProps = {
  stages: DashboardPipelineStage[];
  totalOrders: number;
  isLoading?: boolean;
  onViewAll?: () => void;
};

export function OrderPipelineCard({
  stages,
  totalOrders,
  isLoading,
  onViewAll,
}: OrderPipelineCardProps) {
  return (
    <DashboardSectionCard
      title="Order Pipeline"
      icon={ClipboardList}
      actionLabel="View all orders"
      onAction={onViewAll}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stages.map((stage) => (
          <div key={stage.label} className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  dotToneClassNames[stage.tone ?? "default"],
                )}
              />
              <span className="truncate text-xs font-medium text-muted-foreground">
                {stage.label}
              </span>
            </div>

            <div>
              <p className="text-lg font-semibold text-foreground">
                {isLoading ? "..." : stage.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "-" : `${stage.percent}%`}
              </p>
            </div>

            <Progress value={isLoading ? 0 : stage.percent} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">Total Orders</span>
        <span className="text-sm font-semibold text-foreground">
          {isLoading ? "..." : totalOrders}
        </span>
      </div>
    </DashboardSectionCard>
  );
}
