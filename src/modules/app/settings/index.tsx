import { useMemo, useState } from "react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  ClipboardList,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { settingsCategories } from "./constants/settings-constants";
import type { SettingsCategory } from "./types/settings.types";
import {
  useHeloraSettingsQuery,
  useUpdateHeloraSettings,
} from "./api/settings-api";
import { SettingCard } from "./components/settings-card";
import { SettingsEditDialog } from "./components/settings-edit-dialog";
import { CustomerStatCard } from "@/components/common/customer-stat-card";
import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";

export default function SettingsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<SettingsCategory | null>(null);

  const {
    data: settings,
    isLoading,
    isRefetching,
    refetch,
  } = useHeloraSettingsQuery();

  const updateSettings = useUpdateHeloraSettings();

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return settingsCategories;

    return settingsCategories.filter((category) => {
      return (
        category.title.toLowerCase().includes(normalizedSearch) ||
        category.description.toLowerCase().includes(normalizedSearch) ||
        category.badge.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search]);

  const summary = useMemo(() => {
    if (!settings) {
      return {
        shopName: "Helora ERP",
        orders: "Not configured",
        attendance: "Not configured",
        print: "Not configured",
      };
    }

    return {
      shopName: settings.business.shopName,
      orders: `${settings.orders.orderPrefix} / ${settings.orders.groupOrderPrefix}`,
      attendance: `${settings.attendance.workStartTime} - ${settings.attendance.workEndTime}`,
      print: settings.prints.tailorPrintSize,
    };
  }, [settings]);

  return (
    <PermissionGate action="read" subject="settings">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Settings"
              description="Configure your garment shop, orders, measurements, attendance, printing, and messages."
              actions={
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading || isRefetching}
                >
                  <RefreshCw
                    className={`size-4 ${isRefetching ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CustomerStatCard
                title="Business"
                value={summary.shopName}
                description="Current shop profile"
                icon={Building2}
              />

              <CustomerStatCard
                title="Orders"
                value={summary.orders}
                description="Order number prefixes"
                icon={ClipboardList}
              />

              <CustomerStatCard
                title="Attendance"
                value={summary.attendance}
                description="Default working time"
                icon={Timer}
              />

              <CustomerStatCard
                title="Tailor Print"
                value={summary.print}
                description="Default tailor copy size"
                icon={FileText}
              />
            </div>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search settings..."
                    className="bg-background pl-9"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Settings Directory</CardTitle>
                    <CardDescription>
                      Open a settings area and update how Helora ERP works for
                      your shop.
                    </CardDescription>
                  </div>

                  <div className="hidden size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex">
                    <ShieldCheck className="size-5" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-4">
                {isLoading ? (
                  <SettingsLoadingGrid />
                ) : filteredCategories.length ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCategories.map((category) => (
                      <SettingCard
                        key={category.id}
                        category={category}
                        onOpen={() => setSelectedCategory(category)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-72 flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Search className="h-7 w-7" />
                    </div>

                    <h3 className="mt-4 text-lg font-black text-slate-950">
                      No settings found
                    </h3>
                    <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
                      Try searching for orders, attendance, print, WhatsApp, or
                      measurements.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {settings && (
          <SettingsEditDialog
            open={Boolean(selectedCategory)}
            category={selectedCategory}
            settings={settings}
            isSaving={updateSettings.isPending}
            onClose={() => setSelectedCategory(null)}
            onSave={async (nextSettings) => {
              await updateSettings.mutateAsync(nextSettings);
            }}
          />
        )}
      </div>
    </PermissionGate>
  );
}

function SettingsLoadingGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="h-44 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}
