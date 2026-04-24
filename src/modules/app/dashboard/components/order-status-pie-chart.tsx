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

type OrderItem = {
  id?: string | number;
  state?: string;
};

type OrdersStatusPieCardProps = {
  orderData: {
    items?: OrderItem[];
  } | null | undefined;
  isLoading?: boolean;
};

const chartConfig = {
  processing: { label: "Processing", color: "#3b82f6" },
  delivered: { label: "Delivered", color: "#22c55e" },
  invoiced: { label: "Invoiced", color: "#f59e0b" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
};

function normalizeOrderState(state?: string) {
  const value = (state ?? "").trim().toLowerCase();
  if (value === "processing") return "processing";
  if (value === "delivered" || value === "completed") return "delivered";
  if (value === "invoiced") return "invoiced";
  if (value === "cancelled" || value === "canceled") return "cancelled";
  return null;
}

function buildChartData(items: OrderItem[] = []) {
  const counts = { processing: 0, delivered: 0, invoiced: 0, cancelled: 0 };
  for (const order of items) {
    const key = normalizeOrderState(order.state);
    if (key) counts[key] += 1;
  }
  return [
    { key: "processing", name: "Processing", value: counts.processing, fill: chartConfig.processing.color },
    { key: "delivered", name: "Delivered", value: counts.delivered, fill: chartConfig.delivered.color },
    { key: "invoiced", name: "Invoiced", value: counts.invoiced, fill: chartConfig.invoiced.color },
    { key: "cancelled", name: "Cancelled", value: counts.cancelled, fill: chartConfig.cancelled.color },
  ].filter((item) => item.value > 0);
}

export function OrdersStatusPieCard({ orderData, isLoading }: OrdersStatusPieCardProps) {
  if (isLoading) return <OrdersStatusPieSkeleton />;

  const items = orderData?.items ?? [];
  const chartData = buildChartData(items);
  const totalOrders = items.length;

  if (chartData.length === 0) return null;

  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200 ring-0  shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-[#1963FF]" />
          <CardTitle className="text-lg font-bold  ">
            Order Status
          </CardTitle>
        </div>
        <CardDescription className="text-xs">Live status of recent fulfillments</CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {/* --- FLEX LAYOUT: Matches image_80f2c1.png --- */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          
          {/* 1. LEFT: DONUT CHART */}
          <div className="relative aspect-square w-full max-w-50 shrink-0">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={85}
                  strokeWidth={5}
                  stroke="#fff"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} className="transition-opacity hover:opacity-80" />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-[#070B3F] text-2xl font-black tracking-tighter">
                              {totalOrders}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-slate-400 text-[10px] font-bold uppercase tracking-widest">
                              Orders
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
          <div className="flex w-full flex-col justify-center gap-1">
            {chartData.map((entry) => (
              <div key={entry.key} className="group flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                  <span className="text-xs font-bold text-slate-500 transition-colors group-hover:text-[#070B3F]">
                    {entry.name}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-[#070B3F] tabular-nums">
                    {entry.value}
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

function OrdersStatusPieSkeleton() {
  return (
    <Card >
      <div className="flex flex-col gap-8 md:flex-row">
        <Skeleton className="mx-auto h-40 w-40 rounded-full" />
        <div className="flex flex-1 flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </Card>
  );
}