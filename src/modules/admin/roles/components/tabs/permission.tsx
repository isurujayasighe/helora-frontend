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
} from "lucide-react";

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

// --- HOOKS (Ensure paths are correct) ---
import { useGetRoles } from "@/api/useGetRoles";
import { useGetPages } from "@/api/useGetPages";
import { useSystemRolePermissions } from "../../api/useSystemRolePermissionById";
import { useUpdateSystemRolePermissions } from "../../api/useUpdateSystemRolePermission";

/* ============================================================
   TYPES
============================================================ */
interface PermissionState {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

/* ============================================================
   MAIN PAGE COMPONENT
============================================================ */

export function PermissionConfigPage() {
  // 1. Fetch Master Data
  const { data: roles = [], isLoading: isRolesLoading } = useGetRoles();
  const { data: allPages = [], isLoading: isPagesLoading } = useGetPages();

  // 2. Local UI State
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [hasChanges, setHasChanges] = React.useState(false);

  // 3. API Hooks
  const { data: existingPermissions = [], isLoading: isPermsLoading } = 
    useSystemRolePermissions(selectedRoleId);
    
  console.log("Fetched Permissions for Role ID", selectedRoleId, existingPermissions);
  const { mutate: updatePermissions, isPending: isSaving } = 
    useUpdateSystemRolePermissions();

  // 4. MASTER STATE
  const [permissionsMap, setPermissionsMap] = React.useState<Record<string, PermissionState>>({});
  const [activePageIds, setActivePageIds] = React.useState<string[]>([]);

  // 5. EFFECT: Initialize State from API (STABILIZED)
  React.useEffect(() => {
    // Only proceed if we have a valid array
    if (!Array.isArray(existingPermissions)) return;

    // A. Prepare the new data derived from API
    const newMap: Record<string, PermissionState> = {};
    const newActiveIds: string[] = [];

    existingPermissions.forEach((p) => {
      newActiveIds.push(p.id);
      newMap[p.id] = {
        canRead: p.canRead,
        canCreate: p.canCreate,
        canUpdate: p.canUpdate,
        canDelete: p.canDelete,
      };
    });

    // B. Update ACTIVE PAGES (Only if different)
    setActivePageIds((prev) => {
      const sortedPrev = [...prev].sort();
      const sortedNew = [...newActiveIds].sort();
      return JSON.stringify(sortedPrev) === JSON.stringify(sortedNew) ? prev : newActiveIds;
    });

    // C. Update PERMISSIONS MAP (Only if different) -> THIS FIXES THE INFINITE LOOP
    setPermissionsMap((prev) => {
      // If the data is identical to what we already have, return 'prev'
      // This ensures React skips the update and doesn't re-render
      if (JSON.stringify(prev) === JSON.stringify(newMap)) {
        return prev;
      }
      return newMap;
    });

    // Reset dirty flag when loading fresh data for a role
    setHasChanges(false);

  }, [existingPermissions, selectedRoleId]);

  const currentRole = roles.find((r) => r.id === selectedRoleId);
  const isSuperAdmin = 
    currentRole?.name === "Super Admin" || 
    currentRole?.name === "SYSTEM ADMIN";

  // --- HANDLERS ---

  const handlePermissionChange = (pageId: string, newState: PermissionState) => {
    setPermissionsMap((prev) => ({
      ...prev,
      [pageId]: newState,
    }));
    setHasChanges(true);
  };

  const togglePage = (pageId: string) => {
    setHasChanges(true);
    
    // Initialize default permissions if adding a new page
    if (!activePageIds.includes(pageId) && !permissionsMap[pageId]) {
      setPermissionsMap(prev => ({
        ...prev,
        [pageId]: { canRead: true, canCreate: false, canUpdate: false, canDelete: false }
      }));
    }

    setActivePageIds((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleSave = () => {
    if (!selectedRoleId) return;

    // Construct Payload from active pages only
    const pagesPayload = activePageIds.map((pageId) => {
      const perms = permissionsMap[pageId];
      return {
        pageId: pageId,
        canRead: perms?.canRead ?? false,
        canCreate: perms?.canCreate ?? false,
        canUpdate: perms?.canUpdate ?? false,
        canDelete: perms?.canDelete ?? false,
      };
    });

    updatePermissions(
      { 
        roleId: selectedRoleId, 
        payload: { pages: pagesPayload } 
      },
      {
        onSuccess: () => {
          setHasChanges(false);
        }
      }
    );
  };

  const getPageIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("user")) return UsersIcon;
    if (lower.includes("tenant") || lower.includes("company")) return Building;
    if (lower.includes("setting") || lower.includes("admin")) return Settings;
    return LayoutGrid;
  };

  return (
    <div>
      <div className="mx-auto space-y-6">
        
        {/* --- TOP ACTION BAR --- */}
        <div className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:items-end">
            
            {/* ROLE SELECTOR */}
            <div className="space-y-1.5 flex-1 sm:flex-none">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                1. Select Role
              </Label>
              <Select
                value={selectedRoleId}
                onValueChange={(val) => {
                  setSelectedRoleId(val);
                  // Effects will handle loading data
                }}
                disabled={isRolesLoading || isSaving}
              >
                <SelectTrigger className="w-full sm:w-60 h-10 bg-slate-50 border-slate-200 focus:ring-blue-500/20">
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

            {/* PAGE SELECTOR */}
            <div className="space-y-1 flex-1 sm:flex-none">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                2. Add Pages
                {activePageIds.length > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 rounded-full text-[9px]">
                    {activePageIds.length}
                  </span>
                )}
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-full sm:w-60 justify-between bg-white border-slate-200 border-dashed text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    disabled={
                      !selectedRoleId || isPagesLoading || isPermsLoading || isSaving
                    }
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-500" />
                      {isPagesLoading || isPermsLoading
                        ? "Loading..."
                        : activePageIds.length === 0
                          ? "Select pages..."
                          : `${activePageIds.length} pages selected`}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-60 max-h-75 overflow-y-auto"
                  align="start"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Available Modules
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allPages.map((page) => (
                    <DropdownMenuCheckboxItem
                      key={page.pageId}
                      checked={activePageIds.includes(page.pageId)}
                      onCheckedChange={() => togglePage(page.pageId)}
                      onSelect={(e) => e.preventDefault()}
                      disabled={isSuperAdmin}
                    >
                      {page.pageName}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* SAVE ACTIONS */}
          <div className="flex items-center gap-3 justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
            {hasChanges && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                Unsaved
              </span>
            )}
            <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />
            <Button
              className="bg-slate-900 hover:bg-slate-800 shadow-sm gap-2 min-w-25"
              disabled={!hasChanges || isSuperAdmin || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* --- PERMISSION MATRIX --- */}
        <div className="flex flex-col space-y-6">
          {!selectedRoleId ? (
            <EmptyState
              icon={Shield}
              title="Select a Role"
              description="Please select a role above to configure permissions."
            />
          ) : isPermsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : activePageIds.length === 0 ? (
            <EmptyState
              icon={FilePlus}
              title="No Pages Configured"
              description="This role has no permissions assigned. Use the dropdown above to add pages."
            />
          ) : (
            <div className="space-y-6">
              {activePageIds.map((pageId) => {
                const page = allPages.find((p) => p.pageId === pageId);
                if (!page) return null;

                // Safely get current permission state from map
                const currentPerms = permissionsMap[pageId] || {
                  canRead: false,
                  canCreate: false,
                  canUpdate: false,
                  canDelete: false,
                };

                const Icon = getPageIcon(page.pageName);

                return (
                  <ResourceGroup
                    key={page.pageId}
                    title={page.pageName}
                    icon={Icon}
                    onRemove={() => togglePage(pageId)}
                    isLocked={isSuperAdmin}
                  >
                    <GranularPermissionRow
                      title={`${page.pageName} Access`}
                      description={page.description || "General access permissions"}
                      permissions={currentPerms}
                      isLocked={isSuperAdmin}
                      // Pass changes back to parent
                      onChange={(newPerms) => handlePermissionChange(pageId, newPerms)}
                    />
                  </ResourceGroup>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENTS (Pure & Controlled)
============================================================ */

function ResourceGroup({ title, icon: Icon, children, onRemove, isLocked }: any) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-md border text-slate-500 shadow-sm">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        </div>
        {!isLocked && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

// CONTROLLED COMPONENT: No local state, no useEffect.
function GranularPermissionRow({
  title,
  description,
  permissions,
  isLocked,
  onChange,
}: {
  title: string;
  description: string;
  permissions: PermissionState;
  isLocked?: boolean;
  onChange: (newState: PermissionState) => void;
}) {
  
  const { canRead, canCreate, canUpdate, canDelete } = permissions;

  const toggle = (key: keyof PermissionState) => {
    if (isLocked) return;
    
    const newPerms = { ...permissions };
    newPerms[key] = !newPerms[key];

    // Logic: Auto-enable Read if Write/Create/Delete is enabled
    if ((key === "canCreate" || key === "canUpdate" || key === "canDelete") && newPerms[key]) {
      newPerms.canRead = true;
    }

    // Logic: Auto-disable others if Read is disabled
    if (key === "canRead" && !newPerms.canRead) {
      newPerms.canCreate = false;
      newPerms.canUpdate = false;
      newPerms.canDelete = false;
    }

    onChange(newPerms);
  };

  const isFullControl = canRead && canCreate && canUpdate && canDelete;

  const toggleFullControl = () => {
    if (isLocked) return;
    if (isFullControl) {
      onChange({ canRead: false, canCreate: false, canUpdate: false, canDelete: false });
    } else {
      onChange({ canRead: true, canCreate: true, canUpdate: true, canDelete: true });
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors group ${isLocked ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="w-full sm:w-1/3 pr-6 mb-4 sm:mb-0">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          {title}
          {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
        </h4>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>

      <div className="flex-1 flex items-center justify-start sm:justify-center gap-2 sm:gap-3">
        <TooltipProvider delayDuration={0}>
          <PermissionChip label="View" active={canRead} icon={Eye} colorClass="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" onClick={() => toggle("canRead")} disabled={isLocked} />
          <PermissionChip label="Create" active={canCreate} icon={Plus} colorClass="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" onClick={() => toggle("canCreate")} disabled={isLocked} />
          <PermissionChip label="Edit" active={canUpdate} icon={Pencil} colorClass="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200" onClick={() => toggle("canUpdate")} disabled={isLocked} />
          <PermissionChip label="Delete" active={canDelete} icon={Trash2} colorClass="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200" onClick={() => toggle("canDelete")} disabled={isLocked} />
        </TooltipProvider>
      </div>

      <div className="w-full sm:w-1/6 flex justify-end items-center gap-3 border-l-0 sm:border-l pl-0 sm:pl-6 border-slate-100 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0">
        <span className="text-xs font-medium text-slate-500">Full Access</span>
        <Switch checked={isFullControl} onCheckedChange={toggleFullControl} disabled={isLocked} className="data-[state=checked]:bg-slate-900" />
      </div>
    </div>
  );
}

function PermissionChip({ label, active, icon: Icon, colorClass, onClick, disabled }: any) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onClick} disabled={disabled} className={`relative flex flex-col items-center justify-center w-14 h-12 sm:w-16 sm:h-14 rounded-lg border transition-all duration-200 ${active ? `${colorClass} shadow-sm` : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"} ${disabled ? "cursor-not-allowed" : "cursor-pointer active:scale-95"}`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${active ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className="text-[9px] sm:text-[10px] font-semibold">{label}</span>
          {active && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass.split(" ")[0]}`}></span>
              <span className={`relative inline-flex rounded-full h-4 w-4 items-center justify-center text-white ${colorClass.split(" ")[0].replace("100", "600")}`}>
                <Check className="w-2.5 h-2.5" />
              </span>
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">Toggle <strong>{label}</strong></TooltipContent>
    </Tooltip>
  );
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="w-full flex items-center justify-center pt-20 pb-12">
      <div className="text-center">
        <Icon className="w-10 h-10 text-slate-200 mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">{description}</p>
      </div>
    </div>
  );
}