import { useMemo, useState } from "react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";
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
  Settings,
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

export default function SettingsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<SettingsCategory | null>(null);

  const { data: settings, isLoading, isRefetching, refetch } =
    useHeloraSettingsQuery();

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
    <PermissionGate action="read" subject="Settings">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-settings"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <Settings className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Settings
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Configure your garment shop, orders, measurements,
                    attendance, printing, and messages.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                className="h-9 rounded-lg bg-white font-bold"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isRefetching ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SettingsSummaryCard
                title="Business"
                value={summary.shopName}
                description="Current shop profile"
                icon={Building2}
              />

              <SettingsSummaryCard
                title="Orders"
                value={summary.orders}
                description="Order number prefixes"
                icon={ClipboardList}
              />

              <SettingsSummaryCard
                title="Attendance"
                value={summary.attendance}
                description="Default working time"
                icon={Timer}
              />

              <SettingsSummaryCard
                title="Tailor Print"
                value={summary.print}
                description="Default tailor copy size"
                icon={FileText}
              />
            </div>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search settings..."
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950">
                      Settings Dashboard
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      Open a settings area and update how Helora ERP works for
                      your shop.
                    </CardDescription>
                  </div>

                  <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 sm:flex">
                    <ShieldCheck className="h-5 w-5" />
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
          </motion.div>
        </AnimatePresence>

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

function SettingsSummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
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