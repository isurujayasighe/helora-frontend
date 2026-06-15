"use client";

import { Activity, Clock3 } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { DashboardActivityItem } from "../types";
import { DashboardSectionCard } from "./dashboard-section-card";

const iconToneClassNames = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
};

type TodaysActivityCardProps = {
  items: DashboardActivityItem[];
  updatedAtLabel: string;
  onViewAll?: () => void;
};

export function TodaysActivityCard({
  items,
  updatedAtLabel,
  onViewAll,
}: TodaysActivityCardProps) {
  return (
    <DashboardSectionCard
      title="Today's Activity"
      icon={Activity}
      actionLabel="View activity"
      onAction={onViewAll}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.label} className="flex min-w-0 gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                iconToneClassNames[item.tone ?? "default"],
              )}
            >
              <item.icon className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="text-lg font-semibold leading-none text-foreground">
                {item.value}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {item.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>

            {index < items.length - 1 && (
              <Separator
                orientation="vertical"
                className="ml-auto hidden sm:block"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock3 className="size-4" />
        <span>{updatedAtLabel}</span>
      </div>
    </DashboardSectionCard>
  );
}
