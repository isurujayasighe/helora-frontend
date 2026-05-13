import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Blocks,
  CalendarCheck2,
  ClipboardList,
  CreditCard,
  Gauge,
  MessageCircle,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Ruler,
  Scissors,
  Settings,
  ShieldCheck,
  Shirt,
  Tags,
  UserCog,
  Users,
  UserRound,
  UserRoundCheck,
  ChevronDown,
  MoreHorizontal,
  User,
  LogOut,
  Mail,
} from "lucide-react";


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

type SidebarGroupSection = {
  label: string;
  items: SidebarItem[];
};

const SIDEBAR_GROUPS: SidebarGroupSection[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "Dashboard",
        url: "/app/dashboard",
        icon: Gauge,
      },
      {
        title: "Customers",
        url: "/app/customers",
        icon: Users,
      },
      {
        title: "Orders",
        icon: ReceiptText,
        children: [
          {
            title: "Create Order",
            url: "/app/create-order-page",
            icon: ClipboardList,
          },
          {
            title: "All Orders",
            url: "/app/orders",
            icon: PackageCheck,
          },
          {
            title: "Group Orders",
            url: "/app/group-orders",
            icon: Blocks,
          },
        ],
      },
    ],
  },
  {
    label: "Operations",
    items: [
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
            title: "Categories",
            url: "/app/category",
            icon: Tags,
          },
          {
            title: "Garment Sets",
            url: "/app/package-templates",
            icon: PackagePlus,
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
        icon: UserRoundCheck,
        children: [
          {
            title: "Employees",
            url: "/app/employees",
            icon: UserRound,
          },
          {
            title: "Attendance",
            url: "/app/attendance",
            icon: CalendarCheck2,
          },
        ],
      },
      {
        title: "Communication",
        icon: MessageCircle,
        children: [
          {
            title: "Email",
            url: "/app/emails",
            icon: Mail,
          },
          {
            title: "WhatsApp",
            url: "/app/whatsapp",
            icon: MessageCircle,
          },
        ],
      },
      {
        title: "Reports",
        url: "/app/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        title: "Administration",
        icon: ShieldCheck,
        children: [
          {
            title: "Users",
            url: "/app/users",
            icon: UserCog,
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
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border px-4 py-2">
        <BrandHeader />
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        {SIDEBAR_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="p-0 pb-3">
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase text-muted-foreground group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <EnterpriseSidebarItem
                    key={item.title}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
        <Scissors className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-sm font-bold leading-5 text-[#344054]">
          Helora ERP
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
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
            "relative h-10 rounded-lg px-3 text-sm font-medium transition-all",
            "group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
            active
              ? "bg-[#eef4ff] text-[#175cd3] shadow-[inset_0_0_0_1px_rgb(23_92_211/0.12)]"
              : "text-muted-foreground hover:bg-[#f8fbff] hover:text-[#344054]"
          )}
        >
          <Link to={item.url!} className="flex min-w-0 items-center gap-3">
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-[#175cd3]" : "text-muted-foreground"
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
              "relative h-10 rounded-lg px-3 text-sm font-medium transition-all",
              "group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0",
              active
                ? "bg-[#eef4ff] text-[#175cd3] shadow-[inset_0_0_0_1px_rgb(23_92_211/0.12)]"
                : "text-muted-foreground hover:bg-[#f8fbff] hover:text-[#344054]"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-[#175cd3]" : "text-muted-foreground"
              )}
            />

            <span className="truncate group-data-[collapsible=icon]:hidden">
              {item.title}
            </span>

            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className="w-full group-data-[collapsible=icon]:hidden">
          <div
            className={cn(
              "relative ml-5 mt-1 space-y-1 border-l border-sidebar-border py-1 pl-3"
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
        "relative flex h-9 min-w-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-all",

        active
          ? "bg-[#ecfdf3] text-[#027a48]"
          : "text-muted-foreground hover:bg-[#f8fbff] hover:text-[#344054]"
      )}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {Icon ? (
          <Icon
            className={cn(
              "h-4 w-4",
              active ? "text-[#027a48]" : "text-muted-foreground"
            )}
          />
        ) : (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-primary" : "bg-muted-foreground"
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
                "h-12 rounded-lg px-2 text-muted-foreground transition-colors hover:bg-[#f2f4f7] hover:text-primary data-[state=open]:bg-[#f2f4f7] data-[state=open]:text-primary",
                "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-xs font-bold text-white">
                  {getInitials(userName, userEmail)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-semibold text-[#344054]">
                  {userName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              </div>

              <MoreHorizontal className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={10}
            className="w-64 rounded-lg border-border p-1.5 shadow-lg"
          >
            <DropdownMenuLabel className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-[#344054]">
                {userName}
              </p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                {userEmail}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2">
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
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
