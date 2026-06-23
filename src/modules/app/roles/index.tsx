import * as React from "react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ClipboardList,
  LayoutGrid,
  LockKeyhole,
  UsersRound,
} from "lucide-react";
import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";

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
    <PermissionGate action="read" subject="settings">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Staff Access"
              description="Manage what staff members can see and do in Helora ERP."
            />

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
            <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Access Setup</CardTitle>
                    <CardDescription>
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
                  <div className="border-b px-4">
                    <TabsList
                      className="grid w-full max-w-xl grid-cols-3"
                      variant="line"
                    >
                      <TabsTrigger value="roles">Staff Roles</TabsTrigger>
                      <TabsTrigger value="resources">System Areas</TabsTrigger>
                      <TabsTrigger value="permissions">Role Access</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <TabsContent value="roles" className="m-0 h-full">
                      <RolesTabContent />
                    </TabsContent>
                    <TabsContent value="resources" className="m-0 h-full">
                      <ResourcesTabContent />
                    </TabsContent>
                    <TabsContent value="permissions" className="m-0 h-full">
                      <PermissionTabContent />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SUB-COMPONENT: ROLES TAB
============================================================ */

function RolesTabContent() {
  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <UsersRound className="size-5 text-muted-foreground" />
              <CardTitle>Staff role list</CardTitle>
            </div>

            <CardDescription>
              Create simple roles for the people who work in the shop.
            </CardDescription>
          </div>

          <CreateRoleDialog />
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-auto p-4 gap-0">
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
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-muted-foreground" />
          <div>
            <CardTitle>System areas</CardTitle>
            <CardDescription>
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
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-5 text-muted-foreground" />
          <div>
            <CardTitle>Role access</CardTitle>
            <CardDescription>
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
