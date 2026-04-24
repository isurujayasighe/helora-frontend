import * as React from "react";
import { Link, Outlet, useMatches } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar"; // Ensure SidebarTrigger is imported
import { AppSideBar } from "./app-sidebar";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";

// --- Icons ---
import { Bell, Building2, Package, FileText, UserRound, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "./profile-dropdown";
import { useTenantStore } from "@/store/tenantstore";

// Types
type RouteStaticData = {
  title?: string;
  actions?: React.ReactNode;
  layout?: "default" | "fixed";
};

export function AuthenticatedLayout() {
  const matches = useMatches();
  const current = matches[matches.length - 1];
  const staticData = current?.staticData as RouteStaticData | undefined;
  const isFixedLayout = staticData?.layout === "fixed";
  const tenant = useTenantStore((state) => state.tenant);
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSideBar />

      <div
        id="content"
        className={cn(
          // Layout & Positioning
          "ml-auto w-full max-w-full flex h-svh flex-col",
          // Transition Logic for Sidebar
          "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]",
          "transition-[width] duration-200 ease-linear",
          // Background Color (Subtle gray to make white cards pop)
        )}
      >
        {/* ================= HEADER ================= */}
        <Header fixed>
          <div className="flex w-full items-center md:px-4 lg:px-4 xl:px-4">
            {/* Left */}
            <div className="flex items-start gap-2 rounded-md py-1.5">
                {tenant?.logo ? (
                  <img
                    src={tenant.logo}
                    alt={`${tenant.companyName ?? "Organization"} logo`}
                    className="max-h-9 w-auto object-bottom sm:max-h-12 md:max-h-10"
                  />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-3 py-2 md:hidden">
               <Link
                to="/app/dashboard"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>
              <Link
                to="/app/orders"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <Package className="h-4 w-4" />
              </Link>

              <Link
                to="/app/invoices"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <FileText className="h-4 w-4" />
              </Link>

              <Link
                to="/app/account"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <UserRound className="h-4 w-4" />
              </Link>
            </div>

            {/* Right */}
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-1 md:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>

              <ProfileDropdown />
            </div>
          </div>

          {/* Mobile quick navigation */}
        </Header>

        {/* ================= PAGE CONTENT ================= */}
        <Main fixed={isFixedLayout}>
          <Outlet />
        </Main>
      </div>
    </SidebarProvider>
  );
}
