import * as React from "react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  ClipboardList,
  LayoutGrid,
  LockKeyhole,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";

import { RolesTable } from "./components/tabs/roles";
import { ResourcesTable } from "./components/tabs/pages";
import { PermissionConfigPage } from "./components/tabs/permission";
import { CreateRoleDialog } from "./components/createRoleDialog";

/* ============================================================
   MAIN PAGE WRAPPER
============================================================ */

export default function AccessControlPage() {
  const [activeTab, setActiveTab] = React.useState("roles");

  return (
    <PermissionGate action="read" subject="Dashboard">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-access-control"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Staff Access
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Manage what staff members can see and do in Helora ERP.
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="w-fit rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-600"
              >
                <Store className="mr-1.5 h-3.5 w-3.5" />
                Helora ERP
              </Badge>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AccessInfoCard
                title="Staff Roles"
                description="Create roles like Owner, Manager, Cashier, Tailor, or Staff."
                icon={UsersRound}
              />

              <AccessInfoCard
                title="System Areas"
                description="Group access by areas like Customers, Orders, Measurements, and Reports."
                icon={LayoutGrid}
              />

              <AccessInfoCard
                title="Role Access"
                description="Choose what each role can view, add, change, or remove."
                icon={LockKeyhole}
              />
            </div>

            {/* Main Content */}
            <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100 px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950">
                      Access Setup
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      Set up staff roles first, then decide which system areas
                      each role can use.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
                <Tabs
  value={activeTab}
  onValueChange={setActiveTab}
  className="flex h-full min-h-0 flex-col"
>
  <div className="border-b border-slate-100 bg-white px-4 py-3">
    <TabsList className="grid h-10 w-full max-w-xl grid-cols-3 rounded-lg bg-slate-100 p-1">
      <TabsTrigger
        value="roles"
        className="rounded-lg font-bold text-slate-600 transition data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
      >
        Staff Roles
      </TabsTrigger>

      <TabsTrigger
        value="resources"
        className="rounded-lg font-bold text-slate-600 transition data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
      >
        System Areas
      </TabsTrigger>

      <TabsTrigger
        value="permissions"
        className="rounded-lg font-bold text-slate-600 transition data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
      >
        Role Access
      </TabsTrigger>
    </TabsList>
  </div>

  <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
    <TabsContent value="roles" className="m-0 h-full focus-visible:ring-0">
      <RolesTabContent />
    </TabsContent>

    <TabsContent value="resources" className="m-0 h-full focus-visible:ring-0">
      <ResourcesTabContent />
    </TabsContent>

    <TabsContent value="permissions" className="m-0 h-full focus-visible:ring-0">
      <PermissionTabContent />
    </TabsContent>
  </div>
</Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </PermissionGate>
  );
}

/* ============================================================
   SUB-COMPONENT: INFO CARD
============================================================ */

function AccessInfoCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="font-black text-slate-950">{title}</p>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SUB-COMPONENT: TAB TRIGGER
============================================================ */

function AccessTabTrigger({
  value,
  icon: Icon,
  title,
  description,
}: {
  value: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="h-auto justify-start rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:bg-slate-50 data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
    >
      <div className="flex w-full items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 data-[state=active]:bg-white/10">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black">{title}</p>
          <p className="mt-0.5 text-xs font-semibold opacity-70">
            {description}
          </p>
        </div>
      </div>
    </TabsTrigger>
  );
}

/* ============================================================
   SUB-COMPONENT: ROLES TAB
============================================================ */

function RolesTabContent() {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-base font-black text-slate-950">
                Staff role list
              </CardTitle>
            </div>

            <CardDescription className="mt-1 text-sm font-medium text-slate-500">
              Create simple roles for the people who work in the shop.
            </CardDescription>
          </div>

          <CreateRoleDialog />
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-auto p-4">
        <RolesTable />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SUB-COMPONENT: RESOURCES TAB
============================================================ */

function ResourcesTabContent() {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-slate-600" />
          <div>
            <CardTitle className="text-base font-black text-slate-950">
              System areas
            </CardTitle>
            <CardDescription className="mt-1 text-sm font-medium text-slate-500">
              These are the main parts of Helora ERP where access can be given.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-auto p-4">
        <ResourcesTable />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SUB-COMPONENT: PERMISSIONS TAB
============================================================ */

function PermissionTabContent() {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-slate-600" />
          <div>
            <CardTitle className="text-base font-black text-slate-950">
              Role access
            </CardTitle>
            <CardDescription className="mt-1 text-sm font-medium text-slate-500">
              Select what each staff role can view, add, change, or remove.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-auto p-4">
        <PermissionConfigPage />
      </CardContent>
    </Card>
  );
}