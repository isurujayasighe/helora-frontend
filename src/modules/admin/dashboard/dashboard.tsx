import * as React from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  FileText,
  CreditCard,
  Package,
  Loader,
  Box,
  RefreshCcw,
} from "lucide-react";

import { useCan } from "@/auth/rbac/useCan";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { fadeUp } from "@/components/motions/MotionFade";

/* ------------------------------------------------------------------ */
/* Mock Data                                                          */
/* ------------------------------------------------------------------ */

const RECENT_INVOICES = [
  {
    id: "INV-2023-005",
    date: "Oct 21, 2023",
    amount: "£1,200.00",
    status: "Overdue",
    statusColor: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  {
    id: "INV-2023-004",
    date: "Oct 10, 2023",
    amount: "£850.00",
    status: "Unpaid",
    statusColor: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  },
  {
    id: "INV-2023-003",
    date: "Sep 28, 2023",
    amount: "£2,450.00",
    status: "Paid",
    statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  {
    id: "INV-2023-002",
    date: "Sep 15, 2023",
    amount: "£400.00",
    status: "Paid",
    statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  {
    id: "INV-2023-001",
    date: "Aug 30, 2023",
    amount: "£2,100.00",
    status: "Paid",
    statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
];

const RECENT_ORDERS = [
  {
    id: "#ORD-9923",
    product: "SaaS Enterprise Plan",
    date: "Oct 22",
    status: "Processing",
    icon: <FileText className="h-4 w-4 text-blue-600" />,
    iconBg: "bg-blue-100",
    statusColor: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  {
    id: "#ORD-9922",
    product: "Add-on: Analytics",
    date: "Oct 18",
    status: "Completed",
    icon: <FileText className="h-4 w-4 text-purple-600" />,
    iconBg: "bg-purple-100",
    statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  {
    id: "#ORD-9921",
    product: "Hardware Kit",
    date: "Oct 12",
    status: "Delivered",
    icon: <Box className="h-4 w-4 text-slate-600" />,
    iconBg: "bg-slate-100",
    statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  {
    id: "#ORD-9920",
    product: "SaaS Pro Plan",
    date: "Sep 30",
    status: "Active",
    icon: <FileText className="h-4 w-4 text-blue-600" />,
    iconBg: "bg-blue-100",
    statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  {
    id: "#ORD-9919",
    product: "Consultation Hr",
    date: "Sep 15",
    status: "Completed",
    icon: <FileText className="h-4 w-4 text-amber-600" />,
    iconBg: "bg-amber-100",
    statusColor: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
];

const QUICK_LINKS = [
  {
    label: "Invoices",
    icon: <FileText className="h-6 w-6 text-blue-600" />,
    href: "/invoices",
    color: "bg-blue-50 border-blue-100",
  },
  {
    label: "Orders",
    icon: <Package className="h-6 w-6 text-emerald-600" />,
    href: "/orders",
    color: "bg-emerald-50 border-emerald-100",
  },
  {
    label: "My Account",
    icon: <CreditCard className="h-6 w-6 text-purple-600" />,
    href: "/account",
    color: "bg-purple-50 border-purple-100",
  },
];

/* ------------------------------------------------------------------ */
/* Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const userName = "Sarah Jenkins";
  const userEmail = "sarah@techflow.com";
  const accountId = "TF-8829";

  const canReadDashboard = useCan("read", "dashboard");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  if (!canReadDashboard) return <Link to="/">Unauthorized</Link>;

  return (
    <PermissionGate action="read" subject="dashboard">
      <div className="flex h-full flex-col overflow-auto  bg-slate-50/50">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center"
            >
              <Loader className="h-10 w-10 animate-spin text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="w-full space-y-6"
            >
              {/* --- HEADER --- */}
              {/* <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                      Dashboard Overview
                    </h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={() => setLoading(true)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      <span className="sr-only">Refresh Dashboard</span>
                    </Button>
                  </div>
                  <p className="text-muted-foreground">
                    Welcome back, here's what's happening with your account today.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 border">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Oct 24, 2023
                  </span>
                </div>
              </div> */}

              
              {/* --- TOP SECTION (Balance & Profile) --- */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* 1. BALANCE CARD (Spans 2 columns) */}
                <Card className="flex flex-col justify-between md:col-span-2">
                  <CardContent className="p-8">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                      <div className="space-y-4">
                        {/* Label Row with Refresh Icon */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Total Outstanding Balance
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <RefreshCcw className="h-3.5 w-3.5" />
                            <span className="sr-only">Refresh Balance</span>
                          </Button>
                        </div>

                        {/* Amount & Badge Stacked Vertically */}
                        <div className="flex flex-col items-start gap-2">
                          <h2 className="text-5xl font-bold tracking-tight text-slate-900">
                            $2,450.00
                          </h2>
                          <Badge
                            variant="secondary"
                            className="bg-red-50 text-red-600 hover:bg-red-50 border-red-100"
                          >
                            Due in 3 days
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-500">
                          Last payment received:{" "}
                          <span className="font-medium text-slate-900">
                            $500.00
                          </span>{" "}
                          on Oct 15, 2023
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. PROFILE CARD (Spans 1 column) */}
                <Card >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          SJ
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-900">
                          {userName}
                        </span>
                        <span className="text-sm text-slate-500">
                          {userEmail}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                          Company
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          TechFlow Solutions
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                          Account ID
                        </p>
                        <p className="mt-1 inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-800">
                          {accountId}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* --- QUICK NAVIGATION (Mobile Optimized) --- */}
              <div className="grid grid-cols-3 gap-6">
                {QUICK_LINKS.map((link) => (
                  <Link key={link.label} to={link.href} className="group">
                    <Card className="h-full border hover:border-blue-400 transition-all active:scale-95 cursor-pointer">
                      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                        <div
                          className={`mb-3 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full ${link.color}`}
                        >
                          {link.icon}
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-slate-700 group-hover:text-blue-700">
                          {link.label}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>


              {/* --- BOTTOM SECTION (Tables) --- */}
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                {/* 3. RECENT INVOICES */}
                <Card >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-500" />
                      <CardTitle className="text-lg font-bold">
                        Recent Invoices
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                      asChild
                    >
                      <Link to="/app/orders">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-4 px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                        <div className="col-span-1">Number</div>
                        <div className="col-span-1">Date</div>
                        <div className="col-span-1 text-right">Amount</div>
                        <div className="col-span-1 text-right">Status</div>
                      </div>

                      {/* Rows with Gap */}
                      <div className="flex flex-col gap-3">
                        {RECENT_INVOICES.map((inv) => (
                          <div
                            key={inv.id}
                            className="grid grid-cols-4 items-center rounded-lg border border-slate-100 px-3 py-3 hover:bg-slate-50 hover:border-slate-200 transition-all bg-white"
                          >
                            <div className="col-span-1 font-medium text-slate-900 truncate text-sm">
                              {inv.id}
                            </div>
                            <div className="col-span-1 text-sm text-slate-500">
                              {inv.date}
                            </div>
                            <div className="col-span-1 text-right text-sm font-medium text-slate-900">
                              {inv.amount}
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <Badge
                                variant="secondary"
                                className={`${inv.statusColor} border-0`}
                              >
                                {inv.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. RECENT ORDERS */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-slate-500" />
                      <CardTitle className="text-lg font-bold">
                        Recent Orders
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                      asChild
                    >
                      <Link to="/app/orders">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 px-2 py-2 text-xs font-semibold text-slate-500 uppercase">
                        <div className="col-span-3">Order ID</div>
                        <div className="col-span-5">Product</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2 text-right">Status</div>
                      </div>
                      
                      <Separator className="opacity-50" />

                      {/* Table Rows (Standard List Style for Orders) */}
                      <div className="flex flex-col gap-0">
                        {RECENT_ORDERS.map((ord) => (
                          <div
                            key={ord.id}
                            className="grid grid-cols-12 items-center rounded-lg px-2 py-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="col-span-3 font-medium text-slate-900 text-sm">
                              {ord.id}
                            </div>
                            <div className="col-span-5 flex items-center gap-2">
                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${ord.iconBg}`}
                              >
                                {ord.icon}
                              </div>
                              <span className="text-sm text-slate-700 truncate">
                                {ord.product}
                              </span>
                            </div>
                            <div className="col-span-2 text-sm text-slate-500">
                              {ord.date}
                            </div>
                            <div className="col-span-2 flex justify-end">
                              <Badge
                                variant="secondary"
                                className={`${ord.statusColor} border-0 whitespace-nowrap`}
                              >
                                {ord.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PermissionGate>
  );
}