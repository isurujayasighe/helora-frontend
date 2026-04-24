import * as React from "react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link, useMatchRoute, useParams } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { useAppMenu, type MenuItem } from "@/api/useAppNavigationMenu";
import { DynamicIcon } from "@/components/icon-map";
import { useTenantStore } from "@/store/tenantstore";
import { BrandLogo } from "../sidebar-brand-logo";
import { cn } from "@/lib/utils";
import customerportallogo from "@/assets/customerportal-logo.png";
/* ------------------------------------------------------------------ */
/* Main Sidebar Component                                             */
/* ------------------------------------------------------------------ */

export function AppSideBar(props: React.ComponentProps<typeof Sidebar>) {
  const params = useParams({ strict: false });
  const tenantId = (params as any).tenantId || "system";

  const tenant = useTenantStore((state) => state.tenant);
  const { data: menuItems, isLoading } = useAppMenu();

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      side="left"
      className="border-r border-sidebar-border bg-amber-600"
      {...props}
    >
      {/* --- 1. Header (Brand Color Support) --- */}
      <SidebarHeader className="p-4 flex flex-col items-center justify-center border-b border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Replaced SidebarMenuButton with a div */}
            <div
              className="
                flex items-center gap-2 w-full p-2 
                transition-all duration-200 
                
                /* --- CENTER LOGO FIX --- */
                group-data-[collapsible=icon]:p-0! 
                group-data-[collapsible=icon]:justify-center!
              "
            >
              {/* Logo Container */}
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg shadow-md shadow-indigo-200">
                {tenant?.logo ? (
                  <img
                    src={customerportallogo}
                    alt="Hutchinsons Logo"
                    className="w-full h-auto "
                  />
                ) : (
                  <BrandLogo />
                )}
              </div>

              {/* Text Container: Hidden when collapsed */}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium text-sidebar-foreground">
                  {tenant?.companyName || "System"}
                </span>
                <span className="truncate text-xs font-medium text-sidebar-foreground capitalize">
                  {tenant?.environmentName || "Production"}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* --- 2. Content --- */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="capitalize tracking-widest text-[12px] font-medium text-sidebar-foreground px-4 mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 px-2">
              {isLoading ? (
                <MenuSkeleton />
              ) : (
                menuItems?.map((item, index) => (
                  <RecursiveMenuItem
                    key={item.title + index}
                    item={item}
                    tenantId={tenantId}
                  />
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* --- 3. Footer --- */}
      <SidebarFooter className="p-2">
        {/* <div className="bg-white/50 rounded-xl border border-sidebar-border p-1 shadow-sm">
            <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-white"
                    >
                    <Avatar className="h-8 w-8 rounded-lg border-2 border-white shadow-sm">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="rounded-lg bg-indigo-50 text-indigo-600 font-bold">
                            {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-sidebar-foreground">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuItem className="cursor-pointer gap-2">
                        <User className="h-4 w-4 text-indigo-500" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2">
                        <Settings className="h-4 w-4 text-indigo-500" />
                        Settings
                    </DropdownMenuItem>
                    <div className="h-px bg-sidebar-border my-1" />
                    <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            </SidebarMenu>
        </div> */}
      </SidebarFooter>

      {/* <SidebarRail /> */}
    </Sidebar>
  );
}

/* ------------------------------------------------------------------ */
/* Recursive Menu Item Renderer                                       */
/* ------------------------------------------------------------------ */

function RecursiveMenuItem({
  item,
  tenantId,
}: {
  item: MenuItem;
  tenantId: string;
}) {
  const { state, isMobile } = useSidebar();
  const [isHovered, setIsHovered] = React.useState(false);
  const hasChildren = item.items && item.items.length > 0;

  // 1. COLLAPSED STATE: Hover Popover
  if (hasChildren && state === "collapsed" && !isMobile) {
    return (
      <div
        className="relative flex justify-center w-full px-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <DropdownMenu open={isHovered} onOpenChange={setIsHovered}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              isActive={isHovered}
              className={cn(
                "h-11 w-11 rounded-xl justify-center transition-all duration-300",
                // Background changes to foreground (dark) on hover, icon becomes white
                isHovered
                  ? "bg-white text-white shadow-lg scale-105"
                  : "text-white hover:bg-slate-100",
              )}
            >
              <DynamicIcon
                name={item.icon}
                className={cn(
                  "size-6 transition-colors",
                  isHovered ? "text-white" : "text-slate-400",
                )}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={16}
            className={cn(
              "min-w-64 p-2 shadow-xl border-slate-200 bg-white text-slate-900 animate-in fade-in slide-in-from-left-2 duration-200",
              "before:absolute before:-left-4 before:top-0 before:h-full before:w-4", // Safety Bridge
            )}
          >
            <div className="px-3 py-2 mb-2 flex items-center gap-2 border-b border-slate-100">
              <DynamicIcon
                name={item.icon}
                className="size-4 text-indigo-600"
              />
              <span className="text-xs font-bold tracking-tight uppercase text-slate-500">
                {item.title}
              </span>
            </div>

            <div className="space-y-1">
              {item.items?.map((subItem) => (
                <DropdownMenuItem key={subItem.title} asChild>
                  <Link
                    to={subItem.url}
                    params={{ tenantId }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-indigo-50 hover:text-blue-700 focus:bg-blue-100 focus:text-white"
                  >
                    {subItem.icon && (
                      <DynamicIcon
                        name={subItem.icon}
                        className="size-4 opacity-70"
                      />
                    )}
                    <span className="flex-1">{subItem.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // 2. EXPANDED / MOBILE Accordion
  if (hasChildren) {
    return (
      <Collapsible asChild className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="hover:bg-slate-100 text-slate-700 font-medium">
              <DynamicIcon
                name={item.icon}
                className="size-5 text-slate-400 group-hover/collapsible:text-indigo-600"
              />
              <span className="text-[13.5px]">{item.title}</span>
              <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90 text-slate-400" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="border-l border-slate-200 ml-4 pl-2">
              {item.items?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarLink
                    to={subItem.url}
                    params={{ tenantId }}
                    label={subItem.title}
                    icon={
                      subItem.icon ? <DynamicIcon name={subItem.icon} /> : null
                    }
                  />
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarLink
        to={item.url}
        params={{ tenantId }}
        label={item.title}
        tooltip={!isMobile && state === "collapsed" ? item.title : undefined}
        icon={<DynamicIcon name={item.icon} />}
      />
    </SidebarMenuItem>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar Link Helper                                                */
/* ------------------------------------------------------------------ */

function SidebarLink({
  to,
  params,
  icon,
  label,
  tooltip,
}: {
  to: string;
  params?: Record<string, any>;
  icon?: React.ReactNode;
  label: string;
  tooltip?: string;
}) {
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({ to, fuzzy: true });

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={tooltip}
      className={cn(
        "relative transition-all duration-200 text-[13.5px] font-medium h-10 mb-1 pl-4",
        "border-l-2 border-transparent", // Left border placeholder
        isActive
          ? "bg-white text-white "
          : "text-white hover:bg-slate-100 hover:text-slate-100 hover:border-slate-300",
      )}
    >
      <Link to={to} params={params} className="flex items-center gap-3">
        {React.isValidElement(icon)
          ? React.cloneElement(
              icon as React.ReactElement<{ className?: string }>,
              {
                className: cn(
                  "size-5 transition-colors",
                  // Icon forces to white (background color relative to bg-foreground)
                  isActive
                    ? "text-white"
                    : "text-white group-hover:text-slate-600",
                  (icon.props as { className?: string }).className,
                ),
              },
            )
          : null}
        <span className={cn(isActive && "text-white")}>{label}</span>
      </Link>
    </SidebarMenuButton>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                           */
/* ------------------------------------------------------------------ */

function MenuSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 animate-pulse">
      {/* 1. Section Header Skeleton */}
      <div className="mb-2">
        <div className="h-3 w-20 bg-sidebar-accent/50 rounded-sm mb-4 opacity-50" />{" "}
        {/* "Main Menu" Label */}
      </div>

      {/* 2. Menu Items with Varying Widths */}
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2">
            {/* Icon Placeholder */}
            <div className="size-8 rounded-lg bg-sidebar-accent/70 shrink-0" />

            {/* Text Placeholder (Randomized widths) */}
            <div
              className="h-4 rounded-md bg-sidebar-accent/60"
              style={{
                width: `${Math.floor(Math.random() * (70 - 40 + 1) + 40)}%`,
              }} // Random width 40-70%
            />
          </div>
        ))}
      </div>

      {/* 3. Divider line */}
      <div className="h-px w-full bg-sidebar-border/50 my-2" />

      {/* 4. Secondary Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="size-8 rounded-lg bg-sidebar-accent/70 shrink-0" />
          <div className="h-4 w-1/2 rounded-md bg-sidebar-accent/60" />
        </div>
      </div>
    </div>
  );
}
