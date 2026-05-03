import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Boxes,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Ruler,
  Scissors,
  Settings,
  ShieldCheck,
  Shirt,
  Tags,
  User,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/auth/store/authStore";

type SidebarChildItem = {
  title: string;
  url: string;
  icon?: React.ElementType;
};

type SidebarItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  children?: SidebarChildItem[];
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    url: "/app/customers",
    icon: Users,
  },
  {
    title: "Orders",
    icon: ClipboardList,
    children: [
      {
        title: "All Orders",
        url: "/app/orders",
        icon: ClipboardList,
      },
      {
        title: "Group Orders",
        url: "/app/group-orders",
        icon: Boxes,
      },
    ],
  },
  {
    title: "Production",
    icon: Scissors,
    children: [
      {
        title: "Blocks",
        url: "/app/blocks",
        icon: Shirt,
      },
      {
        title: "Measurements",
        url: "/app/measurements",
        icon: Ruler,
      },
      {
        title: "Category",
        url: "/app/category",
        icon: Tags,
      },
    ],
  },
  {
    title: "Payments",
    url: "/app/payments",
    icon: CreditCard,
  },
  {
    title: "Staff",
    icon: User,
    children: [
      {
        title: "Employees",
        url: "/app/employees",
        icon: User,
      },
      {
        title: "Attendance",
        url: "/app/attendance",
        icon: CalendarClock,
      },
    ],
  },
  {
    title: "WhatsApp",
    url: "/app/whatsapp",
    icon: MessageCircle,
  },
  {
    title: "Reports",
    url: "/app/reports",
    icon: BarChart3,
  },
  {
    title: "Administration",
    icon: ShieldCheck,
    children: [
      {
        title: "Users",
        url: "/app/users",
        icon: Users,
      },
      {
        title: "Roles & Access",
        url: "/app/role-permission",
        icon: ShieldCheck,
      },
      {
        title: "Settings",
        url: "/app/settings",
        icon: Settings,
      },
    ],
  },
];

function isActiveRoute(pathname: string, url?: string) {
  if (!url) return false;
  return pathname === url || pathname.startsWith(`${url}/`);
}

function isGroupActive(pathname: string, item: SidebarItem) {
  if (item.url && isActiveRoute(pathname, item.url)) {
    return true;
  }

  return (
    item.children?.some((child) => isActiveRoute(pathname, child.url)) ?? false
  );
}

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return "HG";
}

function getUserName(user: any) {
  if (!user) return "Helora User";

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.name || user.email || "Helora User";
}

export function EnterpriseSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const userName = getUserName(user);
  const userEmail = user?.email ?? "admin@helora.local";

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      variant="sidebar"
      className="border-r border-slate-800 bg-slate-950 text-slate-300"
      {...props}
    >
      <SidebarHeader className="border-b border-slate-800 px-4 py-2">
        <BrandHeader />
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup className="mt-4 p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {SIDEBAR_ITEMS.map((item) => (
                <EnterpriseSidebarItem
                  key={item.title}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800 p-3">
        <UserFooter
          userName={userName}
          userEmail={userEmail}
          onLogout={logout}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function BrandHeader() {
  return (
    <div className="flex h-12 items-center gap-3 group-data-[collapsible=icon]:justify-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
        <Scissors className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-base font-bold leading-5 text-white">
          Helora ERP
        </p>
        <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Garment operations
        </p>
      </div>
    </div>
  );
}

function EnterpriseSidebarItem({
  item,
  pathname,
}: {
  item: SidebarItem;
  pathname: string;
}) {
  const { state, isMobile } = useSidebar();

  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const active = isGroupActive(pathname, item);

  if (!hasChildren) {
    return (
      <SidebarMenuItem
        className={cn(
          "relative flex w-full min-w-0 flex-col",
          "group-data-[collapsible=icon]:items-center"
        )}
      >
        <SidebarMenuButton
          asChild
          tooltip={!isMobile && state === "collapsed" ? item.title : undefined}
          isActive={active}
          className={cn(
            "relative h-11 rounded-lg px-3 text-sm font-semibold transition-all",
            "before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:content-['']",
            "group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
            active
              ? "bg-white/10 text-white before:bg-indigo-500"
              : "text-slate-500 before:bg-transparent hover:bg-white/5 hover:text-slate-200"
          )}
        >
          <Link to={item.url!} className="flex min-w-0 items-center gap-3">
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-white" : "text-slate-500"
              )}
            />

            <span className="truncate group-data-[collapsible=icon]:hidden">
              {item.title}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={active} className="group/collapsible">
      <SidebarMenuItem
        className={cn(
          "relative flex w-full min-w-0 flex-col",
          "group-data-[collapsible=icon]:items-center"
        )}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={
              !isMobile && state === "collapsed" ? item.title : undefined
            }
            isActive={active}
            className={cn(
              "relative h-11 rounded-lg px-3 text-sm font-semibold transition-all",
              "before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:content-['']",
              "group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0",
              active
                ? "bg-white/10 text-white before:bg-indigo-500"
                : "text-slate-500 before:bg-transparent hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-white" : "text-slate-500"
              )}
            />

            <span className="truncate group-data-[collapsible=icon]:hidden">
              {item.title}
            </span>

            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className="w-full group-data-[collapsible=icon]:hidden">
          <div
            className={cn(
              "relative ml-5 mt-1 space-y-1 border-l border-slate-800 py-1 pl-4"
            )}
          >
            {item.children?.map((child) => (
              <ChildSidebarLink
                key={child.title}
                child={child}
                pathname={pathname}
              />
            ))}
          </div>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function ChildSidebarLink({
  child,
  pathname,
}: {
  child: SidebarChildItem;
  pathname: string;
}) {
  const active = isActiveRoute(pathname, child.url);
  const Icon = child.icon;

  return (
    <Link
      to={child.url}
      className={cn(
        "relative flex h-10 min-w-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all",

        /**
         * Small horizontal connector from left vertical line to child nav.
         */
        "before:absolute before:-left-4 before:top-1/2 before:h-px before:w-4 before:-translate-y-1/2 before:bg-slate-800 before:content-['']",

        /**
         * Active indicator on right side.
         */
        "after:absolute after:right-0 after:top-1/2 after:h-6 after:w-1 after:-translate-y-1/2 after:rounded-l-full after:content-['']",

        active
          ? "bg-indigo-500/10 text-indigo-300 after:bg-indigo-500"
          : "text-slate-500 after:bg-transparent hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {Icon ? (
          <Icon
            className={cn(
              "h-4 w-4",
              active ? "text-indigo-300" : "text-slate-500"
            )}
          />
        ) : (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-indigo-300" : "bg-slate-600"
            )}
          />
        )}
      </div>

      <span className="truncate">{child.title}</span>
    </Link>
  );
}

function UserFooter({
  userName,
  userEmail,
  onLogout,
}: {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem
        className={cn(
          "relative flex w-full min-w-0 flex-col",
          "group-data-[collapsible=icon]:items-center"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "h-12 rounded-lg px-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white data-[state=open]:bg-slate-900 data-[state=open]:text-white",
                "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  {getInitials(userName, userEmail)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-semibold text-slate-100">
                  {userName}
                </p>
                <p className="truncate text-xs text-slate-500">{userEmail}</p>
              </div>

              <MoreHorizontal className="h-4 w-4 text-slate-500 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={10}
            className="w-64 rounded-lg border-slate-200 p-1.5 shadow-lg"
          >
            <DropdownMenuLabel className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {userName}
              </p>
              <p className="truncate text-xs font-normal text-slate-500">
                {userEmail}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2">
              <User className="mr-2 h-4 w-4 text-slate-500" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2">
              <Settings className="mr-2 h-4 w-4 text-slate-500" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer rounded-lg px-3 py-2 text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}