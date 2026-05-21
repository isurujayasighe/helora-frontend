// @/components/layout/profile-dropdown.tsx
"use client";

import { LogOut, User, ChevronDown } from "lucide-react";
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

import { useAuthStore } from "@/auth/store/authStore";
import { logout } from "@/auth/logout";
import { ProfileButtonSkeleton } from "@/components/common/profile-skeleton";

export function ProfileDropdown() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const activeCustomer = useAuthStore((state) => state.user);

  if (!user) {
    return <ProfileButtonSkeleton />;
  }

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "??";

  const activeCustomerName =
    (activeCustomer as any)?.name ||
    (activeCustomer as any)?.customerName ||
    (activeCustomer as any)?.displayName ||
    "Account";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group h-auto rounded-md px-2 py-1.5 transition-colors hover:bg-secondary"
        >
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="h-8 w-8 shrink-0 rounded-md">
              <AvatarFallback className="bg-primary text-[11px] font-normal text-white">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>

            <div className="hidden min-w-0 flex-col items-start text-left leading-tight md:flex">
              <span className="truncate text-[12px] font-medium text-slate-800">
                {user.email}
              </span>

              <span className="truncate text-[10px] text-slate-500">
                {activeCustomerName}
              </span>
            </div>

            <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180 md:block" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 rounded-md border-border p-1.5 shadow-xl"
        align="end"
        sideOffset={8}
      >
        <div className="mb-1 px-3 py-3">
          <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">
            Identity
          </p>

          <p className="truncate text-sm font-semibold text-slate-900">
            {user.email}
          </p>

          <p className="mt-1 truncate text-xs text-slate-500">
            {activeCustomerName}
          </p>
        </div>

        <DropdownMenuItem
          onClick={() => navigate({ to: "/app/profile" })}
          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <User className="h-3.5 w-3.5" />
          Profile Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-slate-50" />

        <DropdownMenuItem
          onClick={() => logout()}
          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-rose-500 focus:bg-rose-50 focus:text-rose-600"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
