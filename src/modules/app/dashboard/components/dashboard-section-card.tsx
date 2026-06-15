"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardSectionCardProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  contentClassName?: string;
};

export function DashboardSectionCard({
  title,
  icon: Icon,
  children,
  description,
  actionLabel,
  onAction,
  className,
  contentClassName,
}: DashboardSectionCardProps) {
  return (
    <Card size="sm" className={cn("min-h-0", className)}>
      <CardHeader className="border-b">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <CardTitle className="truncate text-sm">{title}</CardTitle>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {actionLabel && onAction && (
          <CardAction>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAction}
              className="text-muted-foreground"
            >
              {actionLabel}
              <ArrowRight className="size-3.5" />
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className={cn("px-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
