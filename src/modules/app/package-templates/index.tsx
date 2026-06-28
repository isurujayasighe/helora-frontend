"use client";

import * as React from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";

import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";
import {
  useDeactivatePackageTemplate,
  usePackageTemplatesQuery,
  type PackageTemplate,
} from "./api/package-template-api";
import { PackageTemplateDialog } from "./components/package-template-dialog";
import { PackageTemplateStatsCards } from "./components/package-template-stats";
import { PackageTemplateTable } from "./components/package-template-table";

export default function PackageTemplatesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<PackageTemplate | null>(null);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const {
    data: templates = [],
    isLoading,
    isFetching,
    refetch,
  } = usePackageTemplatesQuery({
    search: debouncedSearch || undefined,
  });
  const deactivateTemplate = useDeactivatePackageTemplate();

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const stats = React.useMemo(() => {
    const active = templates.filter((template) => template.isActive).length;
    const items = templates.reduce(
      (sum, template) => sum + template.items.length,
      0,
    );
    const optional = templates.reduce(
      (sum, template) =>
        sum + template.items.filter((item) => item.isOptional).length,
      0,
    );

    return {
      total: templates.length,
      active,
      items,
      optional,
    };
  }, [templates]);

  const openCreate = () => {
    setSelectedTemplate(null);
    setDialogOpen(true);
  };

  const openEdit = (template: PackageTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeactivate = async (template: PackageTemplate) => {
    const confirmed = window.confirm(
      `Deactivate ${template.name}? It will no longer appear as an active set in Order Builder.`,
    );

    if (!confirmed) return;

    try {
      await deactivateTemplate.mutateAsync(template.id);
      toast.success("Garment set deactivated.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Garment set could not be deactivated.";
      toast.error(message);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  return (
    <PermissionGate action="read" subject="settings-categories">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Garment Sets"
              description="Manage uniform packages and the garment or accessory items included in each set."
              actions={
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => refetch()}
                    disabled={isLoading || isFetching}
                  >
                    <RefreshCw
                      className={cn("size-4", isFetching && "animate-spin")}
                    />
                    Refresh
                  </Button>

                  <Button type="button" onClick={openCreate}>
                    <Plus className="size-4" />
                    New Set
                  </Button>
                </>
              }
            />

            <PackageTemplateStatsCards stats={stats} />

            <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Garment Set Directory</CardTitle>

                    <CardDescription>
                      Use these sets when building uniform orders with multiple
                      parts.
                    </CardDescription>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search garment sets..."
                        className="pl-9 bg-background"
                      />
                    </div>

                    {debouncedSearch && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearFilters}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "min-h-0 flex-1 overflow-auto p-0",
                  isFetching && "opacity-70",
                )}
              >
                <PackageTemplateTable
                  templates={templates}
                  isLoading={isLoading}
                  isDeactivating={deactivateTemplate.isPending}
                  onEdit={openEdit}
                  onDeactivate={handleDeactivate}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <PackageTemplateDialog
          open={dialogOpen}
          template={selectedTemplate}
          onClose={closeDialog}
        />
      </div>
    </PermissionGate>
  );
}
