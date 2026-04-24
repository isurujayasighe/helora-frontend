"use client";

import { Pie, PieChart, Cell, Label } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type InvoiceOverviewPieCardProps = {
  invoiceData:
    | {
        invoiceAmounts?: {
          totalOutstanding?: number;
          totalPaid?: number;
          totalOverDue?: number;
          totalCancelled?: number;
        };
      }
    | null
    | undefined;
  isLoading?: boolean;
};

const chartConfig = {
  outstanding: { label: "Outstanding", color: "#f59e0b" },
  overdue: { label: "Overdue", color: "#ef4444" },
  paid: { label: "Paid", color: "#22c55e" },
  cancelled: { label: "Cancelled", color: "#64748b" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0, // Compact for legend
  }).format(amount);
}

export function InvoiceOverviewPieCard({
  invoiceData,
  isLoading,
}: InvoiceOverviewPieCardProps) {
  if (isLoading) return <InvoiceOverviewPieSkeleton />;

  const outstanding = invoiceData?.invoiceAmounts?.totalOutstanding ?? 0;
  const overdue = Math.min(
    invoiceData?.invoiceAmounts?.totalOverDue ?? 0,
    outstanding,
  );
  const paid = invoiceData?.invoiceAmounts?.totalPaid ?? 0;
  const cancelled = invoiceData?.invoiceAmounts?.totalCancelled ?? 0;
  const total = outstanding + paid + cancelled;

  if (total === 0) return null;

  const mainChartData = [
    {
      key: "outstanding",
      name: "Outstanding",
      value: outstanding,
      fill: chartConfig.outstanding.color,
    },
    { key: "paid", name: "Paid", value: paid, fill: chartConfig.paid.color },
    {
      key: "cancelled",
      name: "Cancelled",
      value: cancelled,
      fill: chartConfig.cancelled.color,
    },
  ].filter((item) => item.value > 0);

  // Data for the outer ring to highlight Overdue as part of Outstanding
  const overdueOuterData = [
    { key: "overdue", value: overdue, fill: chartConfig.overdue.color },
    { key: "remaining", value: total - overdue, fill: "transparent" },
  ];

  return (
     <Card className="overflow-hidden rounded-xl border border-slate-200  shadow-none ring-0">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-[#1963FF]" />
          <CardTitle className="text-lg font-bold  ">
            Invoice Status
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Invoice amount distribution
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* 1. LEFT: DONUT CHART (Double Ring) */}
          <div className="relative aspect-square w-full max-w-50 shrink-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(v, n) => [formatCurrency(Number(v)), n]}
                    />
                  }
                />

                {/* Outer Ring: Overdue Highlight */}
                <Pie
                  data={overdueOuterData}
                  dataKey="value"
                  innerRadius={88}
                  outerRadius={95}
                  strokeWidth={0}
                  isAnimationActive={false}
                >
                  {overdueOuterData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>

                {/* Main Ring */}
                <Pie
                  data={mainChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={84}
                  strokeWidth={4}
                  stroke="#fff"
                >
                  {mainChartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.fill}
                      className="transition-opacity hover:opacity-80"
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-[#070B3F] text-xl font-black tracking-tighter"
                            >
                              {formatCurrency(total)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-slate-400 text-[9px] font-bold uppercase tracking-widest"
                            >
                              Invoiced
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* 2. RIGHT: VERTICAL LEGEND (Matches image_80f2c1 Style) */}
          <div className="flex w-full flex-col justify-center gap-3">
            {[
              { ...chartConfig.outstanding, val: outstanding },
              { ...chartConfig.overdue, val: overdue },
              { ...chartConfig.paid, val: paid },
            ].map((entry) => (
              <div
                key={entry.label}
                className="group flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs font-bold text-slate-500 transition-colors group-hover:text-[#070B3F]">
                    {entry.label}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-[#070B3F] tabular-nums">
                    {formatCurrency(entry.val)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceOverviewPieSkeleton() {
  return (
    <Card>
      <div className="flex flex-col gap-8 md:flex-row">
        <Skeleton className="mx-auto h-40 w-40 rounded-full" />
        <div className="flex flex-1 flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </Card>
  );
}
