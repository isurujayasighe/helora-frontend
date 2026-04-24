"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  to?: string;
  badge?: string;
  badgeVariant?: "success" | "neutral" | "purple" | "danger";
  iconVariant?: "blue" | "orange" | "purple" | "danger";
  accent?: "none" | "danger";
  valueVariant?: "default" | "danger";
}

const badgeStyles = {
  success: "bg-emerald-50 text-emerald-600",
  neutral: "bg-slate-100 text-slate-500",
  purple: "bg-violet-50 text-violet-600",
  danger: "bg-red-50 text-red-500",
};

const iconStyles = {
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-violet-50 text-violet-600",
  danger: "bg-red-50 text-red-500",
};

export function GroupedStatCard({
  title,
  value,
  icon: Icon,
  to,
  badge,
  badgeVariant = "neutral",
  iconVariant = "blue",
  accent = "none",
  valueVariant = "default",
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "overflow-hidden rounded-lg border border-slate-200 p-0 bg-white shadow-none transition-all hover:border-slate-300 hover:shadow-sm",
        accent === "danger" && "border-l-[3px] border-l-red-500"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconStyles[iconVariant]
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>

          {badge ? (
            <div
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
                badgeStyles[badgeVariant]
              )}
            >
              {badge}
            </div>
          ) : null}
        </div>

        <div className="mt-5 space-y-1.5">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3
            className={cn(
              "text-[28px] font-semibold leading-none tracking-tight text-slate-950",
              valueVariant === "danger" && "text-red-500"
            )}
          >
            {value}
          </h3>
        </div>
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }

  return content;
}