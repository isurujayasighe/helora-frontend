"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Grid2x2,
  Plus,
  Shirt,
  TriangleAlert,
  Users,
} from "lucide-react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { cn } from "@/lib/utils";
import { UpcomingPromisedOrders } from "./components/promissed-orders";
import { RecentOrdersTableCard } from "./components/recent-orders-table";
import { Button } from "@/components/ui/button";
import { CreateOrderDialog } from "@/components/layout/create-order-dialog";
import { useNavigate } from "@tanstack/react-router";
import { DashboardCustomerSearchCard } from "./components/dashboard-customer-search";
import { DashboardBlockLookupCard } from "./components/dashboard-block-lookup";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [recentOrdersPage, setRecentOrdersPage] = useState(1);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const navigate = useNavigate();

  const upcomingOrders = [
    {
      id: "1",
      title: "Men's Oxford Blazers",
      units: 8,
      orderNo: "ORD-3012",
      date: "2026-10-26",
    },
    {
      id: "2",
      title: "Silk Evening Gown",
      units: 1,
      orderNo: "ORD-3021",
      date: "2026-10-27",
    },
    {
      id: "3",
      title: "Cotton Polo Batch",
      units: 45,
      orderNo: "ORD-2999",
      date: "2026-10-28",
    },
    {
      id: "4",
      title: "Uniform Embroidery",
      units: 120,
      orderNo: "ORD-3005",
      date: "2026-10-29",
    },
  ];

  const recentOrders = [
    {
      id: "1",
      orderNo: "ORD-3012",
      customerName: "St. Anne Hospital",
      itemName: "Men's Oxford Blazers",
      quantity: 8,
      promisedDate: "2026-10-26",
      status: "Pending" as const,
    },
    {
      id: "2",
      orderNo: "ORD-3021",
      customerName: "Royal Academy",
      itemName: "Silk Evening Gown",
      quantity: 1,
      promisedDate: "2026-10-27",
      status: "In Progress" as const,
    },
    {
      id: "3",
      orderNo: "ORD-2999",
      customerName: "Greenwood College",
      itemName: "Cotton Polo Batch",
      quantity: 45,
      promisedDate: "2026-10-28",
      status: "Completed" as const,
    },
    {
      id: "4",
      orderNo: "ORD-3005",
      customerName: "City Medical Unit",
      itemName: "Uniform Embroidery",
      quantity: 120,
      promisedDate: "2026-10-29",
      status: "Overdue" as const,
    },
  ];

  const dashboardStats = useMemo(
    () => [
      {
        title: "Total Customers",
        value: "1,284",
        description: "Customers saved in Helora",
        badge: "+12%",
        icon: Users,
      },
      {
        title: "Active Blocks",
        value: "42",
        description: "Reusable tailoring blocks",
        badge: "Stable",
        icon: Grid2x2,
      },
      {
        title: "Pending Orders",
        value: "156",
        description: "Orders waiting or in progress",
        badge: "8 New",
        icon: CalendarClock,
      },
      {
        title: "Overdue Orders",
        value: "23",
        description: "Promised date already passed",
        badge: "Urgent",
        icon: TriangleAlert,
        danger: true,
      },
    ],
    []
  );

  return (
    <PermissionGate action="read" subject="dashboard">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
          <div className={cn("flex h-full flex-col gap-4 p-4 md:p-5")}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                  <Shirt className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Track customers, orders, production blocks, and promised deliveries.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-lg bg-white"
                  onClick={() => navigate({ to: "/app/customers" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>

                <Button
                  className="h-10 rounded-md"
                  onClick={() => setIsCreateOrderOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Order
                </Button>

                <Button
                  variant="outline"
                  className="h-10 rounded-lg bg-white"
                  onClick={() => navigate({ to: "/app/blocks" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Block
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardStats.map((stat) => (
                <DashboardStatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  badge={stat.badge}
                  icon={stat.icon}
                  danger={stat.danger}
                />
              ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              <DashboardCustomerSearchCard />
              <DashboardBlockLookupCard />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
              <UpcomingPromisedOrders orders={upcomingOrders} />

              <RecentOrdersTableCard
                orders={recentOrders}
                currentPage={recentOrdersPage}
                totalPages={5}
                onPageChange={setRecentOrdersPage}
              />
            </div>
          </div>

        <CreateOrderDialog
          open={isCreateOrderOpen}
          onOpenChange={setIsCreateOrderOpen}
          onSubmit={async (payload) => {
            console.log("Create order payload", payload);
            // await createOrderMutation.mutateAsync(payload);
          }}
        />
      </div>
    </PermissionGate>
  );
}

function DashboardStatCard({
  title,
  value,
  description,
  badge,
  icon: Icon,
  danger,
}: {
  title: string;
  value: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  danger?: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-md border-border bg-white",
        danger && "border-red-200"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-normal text-slate-500">{title}</p>

              <Badge
                variant="secondary"
                className={cn(
                  "px-2 py-0.5 text-xs font-semibold",
                  danger
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {badge}
              </Badge>
            </div>

            <p
              className={cn(
                "mt-2 text-2xl font-semibold tracking-tight text-slate-950",
                danger && "text-red-600"
              )}
            >
              {value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>

          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700",
              danger && "bg-red-50 text-red-600"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
