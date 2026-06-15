"use client";

import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function DashboardPageHeader({
  title,
  description,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
