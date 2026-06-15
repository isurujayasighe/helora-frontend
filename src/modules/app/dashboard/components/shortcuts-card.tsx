"use client";

import { LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DashboardShortcutItem } from "../types";
import { DashboardSectionCard } from "./dashboard-section-card";

type ShortcutsCardProps = {
  shortcuts: DashboardShortcutItem[];
};

export function ShortcutsCard({ shortcuts }: ShortcutsCardProps) {
  return (
    <DashboardSectionCard
      title="Shortcuts"
      icon={LayoutGrid}
      description="Frequently used tools and workspaces"
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {shortcuts.map((shortcut) => (
          <Button
            key={shortcut.label}
            type="button"
            variant="outline"
            className="h-12 justify-start"
            onClick={shortcut.onClick}
          >
            <shortcut.icon className="size-4" />
            <span className="truncate">{shortcut.label}</span>
          </Button>
        ))}
      </div>
    </DashboardSectionCard>
  );
}
