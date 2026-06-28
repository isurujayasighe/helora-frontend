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
  MoreHorizontal,
  User,
  LogOut,
  Mail,
  ChevronRight,
  BadgeDollarSign,
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
        title: "Create Order",
        url: "/app/create-order-page",
        icon: ClipboardList,
      },
      {
        title: "Orders",
        icon: ReceiptText,
        children: [
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
     {
            title: "Customers",
            url: "/app/customers",
            icon: Users,
          },
          {
            title: "Blocks",
            url: "/app/blocks",
            icon: Shirt,
          },
      {
        title: "Payments",
        url: "/app/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Setup",
    items: [
      {
        title: "Garment Setup",
        icon: Scissors,
        children: [
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
          {
            title: "Measurements",
            url: "/app/measurements",
            icon: Ruler,
          },
        ],
      },
      {
        title: "Pricing",
        url: "/app/pricing",
        icon: BadgeDollarSign,
      },
    ],
  },
  {
    label: "Back Office",
    items: [
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
        title: "Settings",
        icon: MessageCircle,
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
      <SidebarHeader className="border-b border-sidebar-border/80 px-3 ">
        <BrandHeader />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {SIDEBAR_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
           
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

      <SidebarFooter className="border-t border-sidebar-border/80 p-2">
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
    <div className="flex h-10 items-center gap-3 group-data-[collapsible=icon]:justify-center">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-black/20">
        <Scissors className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-sm font-semibold leading-5 text-sidebar-foreground">
          Helora ERP
        </p>
        <p className="mt-0.5 truncate text-xs font-normal text-sidebar-foreground/60">
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
            "relative h-9 rounded-md px-2.5 text-sm font transition-colors",
            "group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-black/10"
              : "text-sidebar-foreground/72 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
          )}
        >
          <Link to={item.url!} className="flex min-w-0 items-center gap-3">
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-sidebar-primary" : "text-sidebar-foreground/60"
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
              "relative h-9 rounded-md px-2.5 text-sm  transition-colors",
              "group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-black/10"
                : "text-sidebar-foreground/72 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-sidebar-primary" : "text-sidebar-foreground/60"
              )}
            />

            <span className="truncate group-data-[collapsible=icon]:hidden">
              {item.title}
            </span>

            <ChevronRight className="ml-auto h-3.5 w-3.5 text-sidebar-foreground/50 transition-transform group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className="w-full group-data-[collapsible=icon]:hidden">
          <div
            className={cn(
              "relative ml-5 mt-1 space-y-0.5 border-l border-sidebar-border/80 py-1 pl-2"
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
        "relative flex h-8 min-w-0 items-center gap-2 rounded-md px-2.5 text-sm font-normal transition-colors",

        active
          ? "bg-sidebar-accent/80 text-sidebar-accent-foreground"
          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground"
      )}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {Icon ? (
          <Icon
            className={cn(
              "h-4 w-4",
              active ? "text-success" : "text-sidebar-foreground/50"
            )}
          />
        ) : (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-success" : "bg-sidebar-foreground/45"
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
                "h-11 rounded-md px-2 text-sidebar-foreground/72 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarFallback className="rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                  {getInitials(userName, userEmail)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {userName}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/58">{userEmail}</p>
              </div>

              <MoreHorizontal className="h-4 w-4 text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={10}
            className="w-64 rounded-md border-border p-1.5 shadow-md"
          >
            <DropdownMenuLabel className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-popover-foreground">
                {userName}
              </p>
              <p className="truncate text-sm font-normal text-muted-foreground">
                {userEmail}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer rounded-md px-3 py-2">
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer rounded-md px-3 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
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
