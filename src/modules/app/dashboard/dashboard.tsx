"use client";

import { useState } from "react";
import {
  Grid2x2,
  TriangleAlert,
  Users,
  CalendarClock,
  Plus,
} from "lucide-react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { GroupedStatCard } from "./components/stat-card";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";
import { cn } from "@/lib/utils";
import { UpcomingPromisedOrders } from "./components/promissed-orders";
import { RecentOrdersTableCard } from "./components/recent-orders-table";
import { Button } from "@/components/ui/button";
import { CreateOrderDialog } from "@/components/layout/create-order-dialog";
import { useNavigate } from "@tanstack/react-router";

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

  return (
    <PermissionGate action="read" subject="Users">
      <AnimatePresence mode="wait">
        <motion.div
          key="account"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "mx-auto w-full space-y-6 px-4 py-4 pb-10 sm:px-6 sm:py-6 lg:px-8 xl:px-10"
          )}
        >
          <section className="py-2">
           <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
  <div className="max-w-3xl">
    <h2 className="text-xl font-semibold tracking-tight text-gray-700 sm:text-xl lg:text-2xl">
      Dashboard Overview
    </h2>

    <p className="text-xs leading-6 text-slate-500 sm:text-sm">
      Real time overview of tailoring orders, invoices and account status.
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
    <Button
      variant="outline"
      className="h-10  border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
      onClick={() => navigate({ to: "/app/customers" })}
    ><Plus className="mr-2 h-3.5 w-3.5" />
      Add Customer
    </Button>

    <Button
      variant="outline"
      className="h-10  border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
      onClick={() => setIsCreateOrderOpen(true)}
    ><Plus className="mr-2 h-3.5 w-3.5" />
      Create Order
    </Button>

    <CreateOrderDialog
  open={isCreateOrderOpen}
  onOpenChange={setIsCreateOrderOpen}
  onSubmit={async (payload) => {
    console.log("Create order payload", payload);
    // await createOrderMutation.mutateAsync(payload)
  }}
/>

    <Button
      variant="outline"
      className="h-10  border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
      onClick={() => navigate({ to: "/app/blocks" })}
    >
      <Plus className="mr-2 h-3.5 w-3.5" />
      Add Block
    </Button>
  </div>
</div>
          </section>

          <section className="relative">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <GroupedStatCard
                    title="Total Customers"
                    value="1,284"
                    icon={Users}
                    iconVariant="blue"
                    badge="+12%"
                    badgeVariant="success"
                  />

                  <GroupedStatCard
                    title="Active Blocks"
                    value="42"
                    icon={Grid2x2}
                    iconVariant="orange"
                    badge="Stable"
                    badgeVariant="neutral"
                  />

                  <GroupedStatCard
                    title="Pending Orders"
                    value="156"
                    icon={CalendarClock}
                    iconVariant="purple"
                    badge="8 New"
                    badgeVariant="purple"
                  />

                  <GroupedStatCard
                    title="Overdue Promised"
                    value="23"
                    icon={TriangleAlert}
                    iconVariant="danger"
                    badge="Urgent"
                    badgeVariant="danger"
                    accent="danger"
                    valueVariant="danger"
                  />
              </div>
            
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
            <div className="min-w-0">
              <UpcomingPromisedOrders orders={upcomingOrders} />
            </div>

            <div className="min-w-0">
              <RecentOrdersTableCard
                orders={recentOrders}
                currentPage={recentOrdersPage}
                totalPages={5}
                onPageChange={setRecentOrdersPage}
              />
            </div>
          </section>
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}