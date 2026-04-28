import * as React from "react";

// UI Components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";
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
    <PermissionGate action="read" subject="all">
      <AnimatePresence mode="wait">
        <motion.div
          key="tenant-accounts"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-6 pb-10 p-2 lg:p-16 max-w-7xl mx-auto py-4 "
        >
          {/* ================= Page Header ================= */}

          <Card className="border border-slate-200">
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Role & Permissions</CardTitle>
                  <CardDescription>
                    Manage roles and their associated permissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="border-b border-slate-200">
                    <TabsList className="flex h-12 items-center justify-start bg-transparent p-0 gap-2">
                      {/* --- Role Registry Trigger --- */}
                      <TabsTrigger
                        value="roles"
                        className="relative h-12 flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm font-medium text-slate-500 transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                      >
                        Role Registry
                      </TabsTrigger>

                      {/* --- Page Resources Trigger --- */}
                      <TabsTrigger
                        value="resources"
                        className="relative h-12 flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm font-medium text-slate-500 transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                      >
                        Page Resources
                      </TabsTrigger>

                      {/* --- Access Policy Trigger --- */}
                      <TabsTrigger
                        value="permissions"
                        className="relative h-12 flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm font-medium text-slate-500 transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                      >
                        Access Policy
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* TAB CONTENT */}
                  <div className="mt-6">
                    <TabsContent
                      value="roles"
                      className="m-0 focus-visible:ring-0"
                    >
                      <RolesTabContent />
                    </TabsContent>

                    <TabsContent
                      value="resources"
                      className="m-0 focus-visible:ring-0"
                    >
                      <ResourcesTabContent />
                    </TabsContent>

                    <TabsContent
                      value="permissions"
                      className="m-0 focus-visible:ring-0"
                    >
                      <PermissionConfigPage />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}

/* ============================================================
   SUB-COMPONENT: ROLES TAB
============================================================ */

function RolesTabContent() {
  return (
    <Card className="gap-0">
      <CardHeader className="border-b bg-muted/5 ">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Role Definitions</CardTitle>
            <CardDescription className="text-xs">
              Define the functional roles (personas) that exist within the
              system.
            </CardDescription>
          </div>
          <CreateRoleDialog />
        </div>
      </CardHeader>
      <CardContent className="pl-4 pr-4 pt-4">
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
    <Card className="gap-0">
      <CardHeader className="border-b bg-muted/5 ">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Pages</CardTitle>
            <CardDescription className="text-xs">
              Define the functional pages
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-4 pr-4 pt-4">
        <ResourcesTable />
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SUB-COMPONENT: PERMISSIONS TAB (The Matrix)
============================================================ */
