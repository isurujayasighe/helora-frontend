import * as React from "react";
import {
  Shield,
  Save,
  Lock,
  Check,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Settings,
  LayoutGrid,
  AlertCircle,
  ChevronDown,
  FilePlus,
  Layers,
  Users as UsersIcon,
  Building,
  Loader2,
  KeyRound,
  BarChart3,
  UserCog,
  PackageOpen,
  Ruler,
  ShoppingBag,
  Banknote,
  Clock3,
  MessageCircle,
  Tags,
  ScrollText,
  PanelsTopLeft,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { useGetRoles } from "@/api/useGetRoles";

import {
  type PermissionAction,
  type RolePermissionMatrixPage,
  useRolePermissionMatrix,
} from "../../api/useSystemRolePermissionById";

import { useUpdateSystemRolePermissions } from "../../api/useUpdateSystemRolePermission";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface PermissionState {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

const ACTIONS: PermissionAction[] = ["READ", "CREATE", "UPDATE", "DELETE"];

const EMPTY_PERMISSION_STATE: PermissionState = {
  canRead: false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function actionsToPermissionState(actions: PermissionAction[]): PermissionState {
  return {
    canRead: actions.includes("READ") || actions.includes("MANAGE"),
    canCreate: actions.includes("CREATE") || actions.includes("MANAGE"),
    canUpdate: actions.includes("UPDATE") || actions.includes("MANAGE"),
    canDelete: actions.includes("DELETE") || actions.includes("MANAGE"),
  };
}

function permissionStateToActions(state: PermissionState): PermissionAction[] {
  const actions: PermissionAction[] = [];

  if (state.canRead) actions.push("READ");
  if (state.canCreate) actions.push("CREATE");
  if (state.canUpdate) actions.push("UPDATE");
  if (state.canDelete) actions.push("DELETE");

  return actions;
}

function hasAnyPermission(state?: PermissionState) {
  if (!state) return false;

  return (
    state.canRead ||
    state.canCreate ||
    state.canUpdate ||
    state.canDelete
  );
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutGrid,
  UsersRound: UsersIcon,
  PackageOpen,
  Ruler,
  ShoppingBag,
  Users: UsersIcon,
  Banknote,
  UserRound: UsersIcon,
  Clock3,
  MessageCircle,
  BarChart3,
  Settings,
  UserCog,
  Shield,
  KeyRound,
  PanelsTopLeft,
  Tags,
  ScrollText,
};

function getPageIcon(page: RolePermissionMatrixPage): LucideIcon {
  if (page.icon && iconMap[page.icon]) {
    return iconMap[page.icon];
  }

  const lower = `${page.title} ${page.code}`.toLowerCase();

  if (lower.includes("user")) return UsersIcon;
  if (lower.includes("tenant") || lower.includes("company")) return Building;
  if (lower.includes("setting") || lower.includes("admin")) return Settings;
  if (lower.includes("permission")) return KeyRound;
  if (lower.includes("report")) return BarChart3;
  if (lower.includes("block")) return PackageOpen;
  if (lower.includes("measurement")) return Ruler;
  if (lower.includes("order")) return ShoppingBag;
  if (lower.includes("payment")) return Banknote;

  return LayoutGrid;
}

function sortPages(pages: RolePermissionMatrixPage[]) {
  return [...pages].sort((a, b) => {
    if (a.parentId && !b.parentId) return 1;
    if (!a.parentId && b.parentId) return -1;

    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }

    return a.sortOrder - b.sortOrder;
  });
}

/* ------------------------------------------------------------------ */
/* Main Page                                                          */
/* ------------------------------------------------------------------ */

export function PermissionConfigPage() {
  /**
   * IMPORTANT:
   * This assumes your useGetRoles response shape has `data`.
   *
   * If your RolesListResponse uses `items`, change this to:
   * select: (response) => response.items ?? []
   *
   * If your RolesListResponse uses `roles`, change this to:
   * select: (response) => response.roles ?? []
   */
  const { data: roles = [], isLoading: isRolesLoading } = useGetRoles({
    select: (response) => response.items ?? [],
  });

  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [hasChanges, setHasChanges] = React.useState(false);

  const {
    data: matrix,
    isLoading: isPermsLoading,
    isFetching: isPermsFetching,
  } = useRolePermissionMatrix(selectedRoleId);

  const { mutate: updatePermissions, isPending: isSaving } =
    useUpdateSystemRolePermissions();

  const pages = React.useMemo(
    () => sortPages(matrix?.pages ?? []),
    [matrix?.pages]
  );

  /**
   * Main fix:
   * Do not use page.actions here because your API currently returns only READ
   * inside each page. Use the global actions from matrix instead.
   */
  const availableActions = React.useMemo<PermissionAction[]>(() => {
    const serverActions = matrix?.actions ?? [];

    if (serverActions.length > 0) {
      return serverActions.filter((action) => action !== "MANAGE");
    }

    return ACTIONS;
  }, [matrix?.actions]);

  const [permissionsMap, setPermissionsMap] = React.useState<
    Record<string, PermissionState>
  >({});

  const [activePageIds, setActivePageIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!matrix?.pages) return;

    const nextPermissionsMap: Record<string, PermissionState> = {};
    const nextActivePageIds: string[] = [];

    matrix.pages.forEach((page) => {
      const permissionState = actionsToPermissionState(
        page.assignedActions ?? []
      );

      nextPermissionsMap[page.id] = permissionState;

      if (hasAnyPermission(permissionState)) {
        nextActivePageIds.push(page.id);
      }
    });

    setPermissionsMap(nextPermissionsMap);
    setActivePageIds(nextActivePageIds);
    setHasChanges(false);
  }, [matrix?.pages, selectedRoleId]);

  const currentRole = roles.find((role) => role.id === selectedRoleId);

  const isSuperAdmin =
    currentRole?.name === "Super Admin" ||
    currentRole?.name === "SYSTEM ADMIN" ||
    currentRole?.code === "SUPER_ADMIN" ||
    currentRole?.code === "SYSTEM_ADMIN";

  const selectedPages = React.useMemo(() => {
    return pages.filter((page) => activePageIds.includes(page.id));
  }, [pages, activePageIds]);

  const handlePermissionChange = (
    pageId: string,
    nextState: PermissionState
  ) => {
    setPermissionsMap((prev) => ({
      ...prev,
      [pageId]: nextState,
    }));

    if (hasAnyPermission(nextState)) {
      setActivePageIds((prev) =>
        prev.includes(pageId) ? prev : [...prev, pageId]
      );
    }

    setHasChanges(true);
  };

  const togglePage = (pageId: string) => {
    if (isSuperAdmin) return;

    setHasChanges(true);

    const isCurrentlyActive = activePageIds.includes(pageId);

    if (isCurrentlyActive) {
      setActivePageIds((prev) => prev.filter((id) => id !== pageId));

      setPermissionsMap((prev) => ({
        ...prev,
        [pageId]: EMPTY_PERMISSION_STATE,
      }));

      return;
    }

    setActivePageIds((prev) => [...prev, pageId]);

    setPermissionsMap((prev) => ({
      ...prev,
      [pageId]: prev[pageId] ?? {
        canRead: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      },
    }));
  };

  const handleSave = () => {
  if (!selectedRoleId) return;

  const assignments = activePageIds
    .map((pageId) => {
      const page = pages.find((item) => item.id === pageId);
      const permissions = permissionsMap[pageId] ?? EMPTY_PERMISSION_STATE;

      if (!page) return null;

      const actions = permissionStateToActions(permissions);

      if (actions.length === 0) return null;

      return {
        pageId: page.id,
        pageCode: page.code,
        actions,
      };
    })
    .filter(
      (
        item
      ): item is {
        pageId: string;
        pageCode: string;
        actions: PermissionAction[];
      } => Boolean(item)
    );

  updatePermissions(
    {
      roleId: selectedRoleId,
      payload: {
        assignments,
      },
    },
    {
      onSuccess: () => {
        setHasChanges(false);
      },
    }
  );
};

  const isLoadingMatrix = isPermsLoading || isPermsFetching;

  return (
    <div className="mx-auto space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Select Role
              </Label>

              <Select
                value={selectedRoleId}
                onValueChange={(value) => {
                  setSelectedRoleId(value);
                  setHasChanges(false);
                  setPermissionsMap({});
                  setActivePageIds([]);
                }}
                disabled={isRolesLoading || isSaving}
              >
                <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-blue-500/20 sm:w-64">
                  <SelectValue
                    placeholder={
                      isRolesLoading ? "Loading roles..." : "Select a role"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Select Pages

                {activePageIds.length > 0 && (
                  <span className="ml-1 rounded-full bg-blue-100 px-1.5 text-[9px] text-blue-700">
                    {activePageIds.length}
                  </span>
                )}
              </Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-between rounded-lg border-dashed border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 sm:w-64"
                    disabled={
                      !selectedRoleId ||
                      isLoadingMatrix ||
                      isSaving ||
                      isSuperAdmin
                    }
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-slate-500" />
                      {isLoadingMatrix
                        ? "Loading pages..."
                        : activePageIds.length === 0
                          ? "Select pages..."
                          : `${activePageIds.length} pages selected`}
                    </span>

                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="max-h-80 w-80 overflow-y-auto rounded-lg"
                  align="start"
                >
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Available Pages
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {pages.map((page) => (
                    <DropdownMenuCheckboxItem
                      key={page.id}
                      checked={activePageIds.includes(page.id)}
                      onCheckedChange={() => togglePage(page.id)}
                      onSelect={(event) => event.preventDefault()}
                      disabled={isSuperAdmin}
                      className="gap-2 rounded-lg"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {page.title}
                      </span>

                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                        {page.type}
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
            {hasChanges && (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600">
                <AlertCircle className="h-3.5 w-3.5" />
                Unsaved
              </span>
            )}

            <Button
              className="min-w-32 gap-2 rounded-lg bg-slate-900 shadow-sm hover:bg-slate-800"
              disabled={!hasChanges || isSuperAdmin || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {isSuperAdmin && selectedRoleId && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Super Admin permissions are locked. This role should keep full system
          access.
        </div>
      )}

      <div className="flex flex-col space-y-6">
        {!selectedRoleId ? (
          <EmptyState
            icon={Shield}
            title="Select a Role"
            description="Please select a role above to configure permissions."
          />
        ) : isLoadingMatrix ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : selectedPages.length === 0 ? (
          <EmptyState
            icon={FilePlus}
            title="No Pages Configured"
            description="This role has no page permissions assigned. Use the dropdown above to add pages."
          />
        ) : (
          <div className="space-y-6">
            {selectedPages.map((page) => {
              const currentPerms =
                permissionsMap[page.id] ?? EMPTY_PERMISSION_STATE;

              const Icon = getPageIcon(page);

              return (
                <ResourceGroup
                  key={page.id}
                  title={page.title}
                  badge={page.type}
                  icon={Icon}
                  onRemove={() => togglePage(page.id)}
                  isLocked={isSuperAdmin}
                >
                  <GranularPermissionRow
                    title={`${page.title} Access`}
                    description={
                      page.description || "General page access permissions"
                    }
                    permissions={currentPerms}
                    availableActions={availableActions}
                    isLocked={isSuperAdmin}
                    onChange={(nextPermissions) =>
                      handlePermissionChange(page.id, nextPermissions)
                    }
                  />
                </ResourceGroup>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub Components                                                     */
/* ------------------------------------------------------------------ */

function ResourceGroup({
  title,
  badge,
  icon: Icon,
  children,
  onRemove,
  isLocked,
}: {
  title: string;
  badge?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  onRemove: () => void;
  isLocked?: boolean;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-800">
              {title}
            </h3>

            {badge && (
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {badge}
              </p>
            )}
          </div>
        </div>

        {!isLocked && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 rounded-lg text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function GranularPermissionRow({
  title,
  description,
  permissions,
  availableActions,
  isLocked,
  onChange,
}: {
  title: string;
  description: string;
  permissions: PermissionState;
  availableActions: PermissionAction[];
  isLocked?: boolean;
  onChange: (nextState: PermissionState) => void;
}) {
  const { canRead, canCreate, canUpdate, canDelete } = permissions;

  const hasAction = (action: PermissionAction) =>
    availableActions.includes(action) || availableActions.includes("MANAGE");

  const toggle = (key: keyof PermissionState) => {
    if (isLocked) return;

    const nextPermissions = { ...permissions };
    nextPermissions[key] = !nextPermissions[key];

    /**
     * Create/Edit/Delete need View access.
     */
    if (
      (key === "canCreate" || key === "canUpdate" || key === "canDelete") &&
      nextPermissions[key]
    ) {
      nextPermissions.canRead = true;
    }

    /**
     * If View is removed, remove all other actions.
     */
    if (key === "canRead" && !nextPermissions.canRead) {
      nextPermissions.canCreate = false;
      nextPermissions.canUpdate = false;
      nextPermissions.canDelete = false;
    }

    onChange(nextPermissions);
  };

  const isFullControl = canRead && canCreate && canUpdate && canDelete;

  const toggleFullControl = () => {
    if (isLocked) return;

    if (isFullControl) {
      onChange({
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      });

      return;
    }

    onChange({
      canRead: hasAction("READ"),
      canCreate: hasAction("CREATE"),
      canUpdate: hasAction("UPDATE"),
      canDelete: hasAction("DELETE"),
    });
  };

  return (
    <div
      className={cn(
        "group flex flex-col justify-between p-6 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center",
        isLocked && "pointer-events-none opacity-60"
      )}
    >
      <div className="mb-4 w-full pr-6 sm:mb-0 sm:w-1/3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {title}
          {isLocked && <Lock className="h-3 w-3 text-slate-400" />}
        </h4>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-start gap-2 sm:justify-center sm:gap-3">
        <TooltipProvider delayDuration={0}>
          {hasAction("READ") && (
            <PermissionChip
              label="View"
              active={canRead}
              icon={Eye}
              colorClass="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              onClick={() => toggle("canRead")}
              disabled={isLocked}
            />
          )}

          {hasAction("CREATE") && (
            <PermissionChip
              label="Create"
              active={canCreate}
              icon={Plus}
              colorClass="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
              onClick={() => toggle("canCreate")}
              disabled={isLocked}
            />
          )}

          {hasAction("UPDATE") && (
            <PermissionChip
              label="Edit"
              active={canUpdate}
              icon={Pencil}
              colorClass="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
              onClick={() => toggle("canUpdate")}
              disabled={isLocked}
            />
          )}

          {hasAction("DELETE") && (
            <PermissionChip
              label="Delete"
              active={canDelete}
              icon={Trash2}
              colorClass="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200"
              onClick={() => toggle("canDelete")}
              disabled={isLocked}
            />
          )}
        </TooltipProvider>
      </div>

      <div className="mt-4 flex w-full items-center justify-end gap-3 border-t border-slate-100 pt-4 sm:mt-0 sm:w-1/6 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
        <span className="text-xs font-medium text-slate-500">Full Access</span>

        <Switch
          checked={isFullControl}
          onCheckedChange={toggleFullControl}
          disabled={isLocked}
          className="data-[state=checked]:bg-slate-900"
        />
      </div>
    </div>
  );
}

function PermissionChip({
  label,
  active,
  icon: Icon,
  colorClass,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  icon: LucideIcon;
  colorClass: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "relative flex h-12 w-14 flex-col items-center justify-center rounded-lg border transition-all duration-200 sm:h-14 sm:w-16",
            active
              ? `${colorClass} shadow-sm`
              : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50",
            disabled ? "cursor-not-allowed" : "cursor-pointer active:scale-95"
          )}
        >
          <Icon
            className={cn(
              "mb-1 h-4 w-4 sm:h-5 sm:w-5",
              active ? "stroke-[2.5px]" : "stroke-2"
            )}
          />

          <span className="text-[9px] font-semibold sm:text-[10px]">
            {label}
          </span>

          {active && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  colorClass.split(" ")[0]
                )}
              />

              <span
                className={cn(
                  "relative inline-flex h-4 w-4 items-center justify-center rounded-full text-white",
                  colorClass.split(" ")[0].replace("100", "600")
                )}
              >
                <Check className="h-2.5 w-2.5" />
              </span>
            </span>
          )}
        </button>
      </TooltipTrigger>

      <TooltipContent side="bottom" className="text-xs">
        Toggle <strong>{label}</strong>
      </TooltipContent>
    </Tooltip>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-20">
      <div className="text-center">
        <Icon className="mx-auto mb-4 h-10 w-10 text-slate-200" />

        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

        <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}