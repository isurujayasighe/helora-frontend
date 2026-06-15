"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardStatItem } from "../types";

const iconToneClassNames = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
};

export function DashboardStatCard({
  title,
  value,
  description,
  badge,
  icon: Icon,
  tone = "default",
  supportingText,
  onClick,
}: DashboardStatItem) {
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      size="sm"
      className={cn(
        "min-h-32 transition-colors",
        onClick && "cursor-pointer hover:bg-muted/50",
        tone === "destructive" && "ring-destructive/30",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <p
              className={cn(
                "mt-2 text-2xl font-semibold tracking-tight text-foreground",
                tone === "destructive" && "text-destructive",
              )}
            >
              {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>

            {supportingText && (
              <p className="mt-3 text-xs text-muted-foreground">
                {supportingText}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            <Badge
              variant={tone === "destructive" ? "destructive" : "secondary"}
            >
              {badge}
            </Badge>

            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                iconToneClassNames[tone],
              )}
            >
              <Icon className="size-5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
