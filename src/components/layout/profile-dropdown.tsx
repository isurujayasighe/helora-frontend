// @/components/layout/profile-dropdown.tsx
"use client";

import { useMemo, useEffect } from "react";
import { LogOut, Check, User, ChevronDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/auth/store/authStore";
import { logout } from "@/auth/logout";
import { useGetCustomerProfile, type Customer } from "@/api/useGetCustomers";
import { ProfileButtonSkeleton } from "@/components/common/profile-skeleton"; // Import the skeleton

export function ProfileDropdown() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const activeCustomerFromStore = useAuthStore((state) => state.activeCustomer);
  const switchCustomer = useAuthStore((state) => state.switchCustomer);
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);

  // 1. Fetch Customers
  const { data: rawCustomers, isSuccess, isLoading } = useGetCustomerProfile();

  const customers = useMemo(() => {
    if (!rawCustomers) return [];

    // If the API returned the array directly
    if (Array.isArray(rawCustomers)) return rawCustomers;

    // If the API returned the { success, data, error } wrapper
    if (rawCustomers && Array.isArray((rawCustomers as any).data)) {
      return (rawCustomers as any).data;
    }

    return [];
  }, [rawCustomers]);

  useEffect(() => {
    if (isSuccess && customers.length > 0 && accessToken) {
      const hasAvailableCustomers =
        useAuthStore.getState().availableCustomers.length > 0;
      if (!hasAvailableCustomers) {
        setAuth(accessToken, customers);
      }
    }
  }, [customers, accessToken, setAuth, isSuccess]);

  console.log("Fetched Customers:", rawCustomers);

  console.log("Active Customer from Store:", user);

  const activeCustomerId = activeCustomerFromStore?.customerId || null;

  const activeCustomerDisplay = useMemo(
    () => customers.find((c: Customer) => c.customerId === activeCustomerId),
    [customers, activeCustomerId],
  );

  // 2. RENDER SKELETON WHILE LOADING
  // We keep the container visible but show the shimmer effect
  if (!user || isLoading) {
    return <ProfileButtonSkeleton />;
  }

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "??";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group h-auto rounded-xl px-2 py-1.5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className=" bg-primary text-[11px] font-normal text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="hidden min-w-0 md:flex flex-col items-start text-left leading-tight">
              <span className="truncate text-[12px] font-medium text-slate-800">
                {user.name}
              </span>
              <span className="truncate text-[10px] text-slate-500">
                {activeCustomerDisplay?.name || "Select Account"}
              </span>
            </div>

            <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180 md:block" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-1.5 shadow-2xl border-slate-100 rounded-xl"
        align="end"
        sideOffset={8}
      >
        <div className="px-3 py-3 mb-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">
            Identity
          </p>
          <p className="text-sm font-black text-slate-900 truncate">
            {user.name}
          </p>
        </div>

        <DropdownMenuItem
          onClick={() => navigate({ to: "/app/profile" })}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 rounded-md cursor-pointer hover:bg-slate-50"
        >
          <User className="w-3.5 h-3.5" /> Profile Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-slate-50" />

        <div className="px-3 py-2">
          <p className="text-xs font-medium tracking-widest text-slate-900  mb-2 flex items-center gap-1.5">
            <span className="h-1 w-1 bg-primary rounded-full" />
            Switch Customer
          </p>
          <ScrollArea
            className={cn(
              "flex flex-col",
              customers.length > 4 ? "h-48" : "h-auto",
            )}
          >
            <div className="space-y-0.5">
              {customers.map((customer: Customer) => {
                const isActive = customer.customerId === activeCustomerId;
                return (
                  <DropdownMenuItem
                    key={customer.customerId}
                    onSelect={() => switchCustomer(customer.customerId)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer transition-all",
                      isActive
                        ? "bg-slate-900 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-100/50",
                    )}
                  >
                    <span className="text-xs truncate">{customer.name}</span>
                    {isActive && <Check className="h-3 w-3 text-white" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-slate-50" />

        <DropdownMenuItem
          onClick={() => logout()}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 focus:bg-rose-50 focus:text-rose-600 rounded-md cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
