"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { DashboardSearchScope } from "../types";
import { DashboardSearch } from "./dashboard-search";

type DashboardQuickFindDialogProps = {
  open: boolean;
  value: string;
  scope: DashboardSearchScope;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onScopeChange: (scope: DashboardSearchScope) => void;
  onSubmit: () => void;
};

export function DashboardQuickFindDialog({
  open,
  value,
  scope,
  onOpenChange,
  onValueChange,
  onScopeChange,
  onSubmit,
}: DashboardQuickFindDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Find</DialogTitle>
          <DialogDescription>
            Search orders, customers, or production blocks from one place.
          </DialogDescription>
        </DialogHeader>

        <DashboardSearch
          value={value}
          scope={scope}
          onValueChange={onValueChange}
          onScopeChange={onScopeChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
