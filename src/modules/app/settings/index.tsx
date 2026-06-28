import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, PackagePlus, Ruler, Search, Tags } from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";

const settingsDirectoryItems = [
  {
    title: "Categories",
    description:
      "Manage garment categories used for orders, blocks, and measurements.",
    url: "/app/category",
    icon: Tags,
  },
  {
    title: "Garment Sets",
    description:
      "Create reusable package templates for multi-item uniform orders.",
    url: "/app/package-templates",
    icon: PackagePlus,
  },
  {
    title: "Measurements",
    description: "Configure measurement fields and garment sizing setup.",
    url: "/app/measurements",
    icon: Ruler,
  },
];

export default function SettingsPage() {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return settingsDirectoryItems;

    return settingsDirectoryItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search]);

  return (
    <PermissionGate action="read" subject="settings">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Settings"
              description="Open garment setup areas for categories, garment sets, and measurements."
            />

            <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Settings Directory</CardTitle>

                    <CardDescription>
                      Choose a setup area to manage garment configuration.
                    </CardDescription>
                  </div>

                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search settings..."
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-4">
                {filteredItems.length ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredItems.map((item) => (
                      <SettingsDirectoryCard key={item.url} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
                    <Search className="size-10 text-muted-foreground" />

                    <h3 className="mt-4 text-lg font-semibold">
                      No settings found
                    </h3>

                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                      Try searching for categories, garment sets, or
                      measurements.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

function SettingsDirectoryCard({
  item,
}: {
  item: (typeof settingsDirectoryItems)[number];
}) {
  const Icon = item.icon;

  return (
    <Card className="transition-colors hover:bg-muted/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-5" />
          </div>

          <Button asChild variant="ghost" size="icon-sm">
            <Link to={item.url}>
              <ArrowRight className="size-4" />
              <span className="sr-only">Open {item.title}</span>
            </Link>
          </Button>
        </div>

        <div>
          <CardTitle className="text-base">{item.title}</CardTitle>
          <CardDescription className="mt-1">{item.description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
