import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Button asChild variant="outline" size="icon" className="mt-1 rounded-lg">
          <Link to="/app/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Order
            </h1>

            <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">
              Measurement first flow
            </Badge>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Search customer, collect order measurements, save the order, and
            link the block later from the block page.
          </p>
        </div>
      </div>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  action,
}: SectionCardProps) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Icon className="h-4 w-4" />
            </div>
          )}

          <div className="min-w-0">
            <CardTitle className="text-sm font-bold text-slate-900">
              {title}
            </CardTitle>

            {description && (
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            )}
          </div>
        </div>

        {action}
      </CardHeader>

      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

type SummaryMetricProps = {
  label: string;
  value: string | number;
  strong?: boolean;
};

export function SummaryMetric({ label, value, strong }: SummaryMetricProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={cn(
          "mt-1 text-sm font-bold",
          strong ? "text-slate-950" : "text-slate-700",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100",
        props.className,
      )}
    />
  );
}