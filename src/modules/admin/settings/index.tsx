"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { fadeUp } from "@/components/motions/MotionFade";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import separate tab components
import { SecurityTab } from "./components/tab/security-tab";
import { cn } from "@/lib/utils";
import { NotificationsTab } from "./components/tab/notification-tab";
import { InvoiceTab } from "./components/tab/invoice-tab";
import { CommunicationTab } from "./components/tab/communication-tab";
import { DataPrivacyTab } from "./components/tab/data-privacy-tab";
// Import others once created...

const triggerStyles = cn(
  "pb-3 text-sm font-medium transition-all border-b-2 border-transparent rounded-none px-0 bg-transparent shadow-none",
  "data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:shadow-none",
  "text-muted-foreground hover:text-slate-900"
);

export default function SettingsPage() {
  return (
    <PermissionGate action="read" subject="all">
      <AnimatePresence mode="wait">
        <motion.div
          key="settings-container"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-6 pb-10 p-2 lg:p-8 max-w-7xl mx-auto py-4"
        >
          <div className="max-w-4xl mx-auto min-h-screen p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your organization preferences and billing details.
              </p>
            </div>

            {/* shadcn-ui Tabs Implementation */}
            <Tabs defaultValue="notifications" className="w-full">
              {/* Mobile Responsiveness: 
                  - 'overflow-x-auto' allows swiping through tabs on small screens
                  - 'scrollbar-hide' (if you have the plugin) or standard CSS to keep it clean
              */}
              <div className="w-full overflow-x-auto pb-1">
                <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0 gap-6">
                  <TabsTrigger
                    value="notifications"
                    className={triggerStyles}
                  >
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="invoices"
                    className={triggerStyles}
                  >
                    Invoice & Payments
                  </TabsTrigger>
                  <TabsTrigger
                    value="communication"
                    className={triggerStyles}
                  >
                    Communication
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className={triggerStyles}
                  >
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="dataPrivacy"
                    className={triggerStyles}
                  >
                    Data Privacy
                  </TabsTrigger>
                </TabsList>
              </div>

              <Card className="mt-6 border border-slate-200">
                <CardContent className="pt-6">
                  <TabsContent value="notifications">
                   <NotificationsTab />
                  </TabsContent>
                  
                  <TabsContent value="invoices">
                    <InvoiceTab />
                  </TabsContent>
                  
                  <TabsContent value="communication">
                    <CommunicationTab />
                  </TabsContent>
                  
                  <TabsContent value="security">
                    <SecurityTab />
                  </TabsContent>
                  
                  <TabsContent value="dataPrivacy">
                    <DataPrivacyTab/>
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}