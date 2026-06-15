import * as React from "react";
import { Link, Outlet, useMatches } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EnterpriseSidebar } from "./app-sidebar";
import { Header,  } from "@/components/layout/header";
import { Main } from "@/components/layout/main";

import { Bell, Package, FileText, UserRound, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "./profile-dropdown";

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
  return (
    <SidebarProvider defaultOpen={true}>
      <EnterpriseSidebar />

      <div
        id="content"
        className={cn(
          "ml-auto flex h-svh w-full max-w-full flex-col bg-background",
          "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]",
          "transition-[width] duration-150 ease-linear"
        )}
      >
        <Header fixed>
          <div className="flex w-full items-center gap-3 md:px-3 lg:px-4 xl:px-5">
            
            {/* <HeaderQuickSearch /> */}

            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-3 py-2 md:hidden">
               <Link
                to="/app/dashboard"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>
              <Link
                to="/app/orders"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <Package className="h-4 w-4" />
              </Link>

              <Link
                to="/app/orders"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <FileText className="h-4 w-4" />
              </Link>

              <Link
                to="/app/account"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <UserRound className="h-4 w-4" />
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-1 md:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md text-muted-foreground hover:bg-secondary hover:text-primary"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>

              <ProfileDropdown />
            </div>
          </div>
        </Header>

        <Main fixed={isFixedLayout}>
          <Outlet />
        </Main>
      </div>
    </SidebarProvider>
  );
}
