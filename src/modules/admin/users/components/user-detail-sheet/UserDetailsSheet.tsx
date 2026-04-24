import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Shield,
  History,
  Calendar,
  Loader2,
  Save,
  Pencil,
  X,
  Hash,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Imports ---
import { useCan } from "@/auth/rbac/useCan";
import { useGetUserById } from "../../api/useGetUserById";
import { useGetRoles } from "@/api/useGetRoles";
import { useUpdateUserRole } from "../../api/useChangeRole"; // 1. Import the hook

/* ------------------------------------------------------------------ */
/* Schema                                                             */
/* ------------------------------------------------------------------ */

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
});

interface Props {
  open: boolean;
  userId?: string;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function UserDetailsSheet({ open, userId, onClose }: Props) {
  // 1. State & Permissions
  const [mode, setMode] = useState<"view" | "edit">("view");
  const canEdit = useCan("update", "Users");

  // 2. Data Fetching
  const { data: user, isLoading: isUserLoading } = useGetUserById(userId);
  const { data: roles = [], isLoading: isRolesLoading } = useGetRoles();

  console.log("Fetched user details:", user);
  
  // 3. Mutations
  const { mutateAsync: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();

  // Reset to view mode when sheet closes or user changes
  useEffect(() => {
    if (open) {
      setMode("view");
    }
  }, [open, userId]);

  // 4. TanStack Form Setup
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
    },
    validators: {
      onChange: userFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!userId) return;

      try {
        // A. Call the Role Update Hook
        // We only call this if the role is selected.
        // Note: The hook handles success/error toasts internally.
        if (value.roleId) {
           await updateRole({ userId, roleId: value.roleId });
        }

        // B. Handle Name/Email update (Placeholder)
        // Since we only have the Role endpoint currently, we log this.
        // If you add a profile update hook later, call it here.
        if (value.name !== user?.userName || value.email !== user?.email) {
           console.log("TODO: Call updateProfile endpoint for:", value.name, value.email);
        }

        // C. Switch back to view mode on success
        setMode("view");
      } catch (error) {
        console.error("Failed to update user:", error);
        // Toast handled by hook
      }
    },
  });

  // Sync Data to Form
  useEffect(() => {
    if (user && mode === "edit") {
      form.reset({
        name: user.userName || "",
        email: user.email || "",
        roleId: user.environments?.[0]?.roles?.[0]?.roleId || "", 
      });
    }
  }, [user, mode, form]);

  const isLoading = isUserLoading || isRolesLoading;
  

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose() }>
      <SheetContent showCloseButton={false} className="w-full sm:max-w-lg p-0 gap-0 border-l shadow-2xl bg-white flex flex-col h-full">
        
        {/* ================= HEADER (Fixed) ================= */}
        <div className="bg-background border-b px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold leading-none">
                {mode === "view" ? "User Details" : "Edit User"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-1">
                {mode === "view" 
                  ? "View user profile and permissions." 
                  : "Update profile and access levels."}
              </SheetDescription>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-1">
            {mode === "view" && !isLoading && (
               <Badge 
                 variant={user?.isActive ? 'default' : 'secondary'} 
                 className={cn("mr-2 capitalize", user?.isActive && "bg-emerald-600 hover:bg-emerald-700")}
               >
                 {user?.isActive || 'Unknown'}
               </Badge>
            )}
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </SheetClose>
          </div>
        </div>

        {/* ================= CONTENT (Scrollable) ================= */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-background/50">
          <div className="p-6 space-y-8">
            
            {isLoading ? (
              /* Loading Skeleton */
              <div className="space-y-6">
                <div className="space-y-2">
                   <Skeleton className="h-4 w-20" />
                   <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                   <Skeleton className="h-4 w-20" />
                   <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            ) : mode === "view" ? (
              
              /* --- VIEW MODE CONTENT --- */
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Identity */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 bg-background">
                    <DetailRow label="Full Name" value={user?.userName} />
                    <DetailRow label="Email Address" value={user?.email} />
                  </div>
                </section>

                {/* Access */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Access Level</h3>
                  </div>
                  <div className="rounded-lg border p-4 bg-background">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground">Assigned Roles</span>
                      <div className="flex flex-wrap gap-2">
                        {user?.environments?.map((env) => (
                          <Badge key={env.environmentId} variant="outline" className="bg-slate-100 dark:bg-slate-800">
                            {env.environmentName}: {env.roles?.[0]?.roleName || "No Role"}
                          </Badge>
                        )) || <span className="text-sm text-slate-500">—</span>}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Metadata */}
                <SystemMetadata user={user} />
              </div>

            ) : (
              
              /* --- EDIT MODE FORM --- */
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }} 
                className="space-y-8 animate-in fade-in duration-300"
              >
                {/* Identity Fields */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Identity
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <form.Field
                      name="name"
                      children={(field) => (
                        <div className="grid gap-1.5">
                          <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                          <Input
                            id="name"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="bg-background"
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-[0.8rem] text-destructive font-medium">{field.state.meta.errors.join(", ")}</p>
                          )}
                        </div>
                      )}
                    />

                    <form.Field
                      name="email"
                      children={(field) => (
                        <div className="grid gap-1.5">
                          <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                          <Input
                            id="email"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="bg-background"
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-[0.8rem] text-destructive font-medium">{field.state.meta.errors.join(", ")}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </section>

                {/* Role Selection */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Access Control</h3>
                  </div>
                  
                  <form.Field
                    name="roleId"
                    children={(field) => (
                      <div className="grid gap-1.5">
                        <Label>System Role <span className="text-destructive">*</span></Label>
                        <Select
                          value={field.state.value}
                          onValueChange={field.handleChange}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex items-center gap-2 mt-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                           <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                           <p className="text-xs text-amber-700 dark:text-amber-400">
                             Changing role updates permissions immediately.
                           </p>
                        </div>

                        {field.state.meta.errors.length > 0 && (
                          <p className="text-[0.8rem] text-destructive font-medium">{field.state.meta.errors.join(", ")}</p>
                        )}
                      </div>
                    )}
                  />
                </section>

                {/* Metadata (Read Only) */}
                <div className="opacity-70 pointer-events-none grayscale">
                   <SystemMetadata user={user} />
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ================= FOOTER (Fixed) ================= */}
        <SheetFooter className="p-6 border-t bg-background mt-auto shrink-0 z-10 flex flex-row justify-between items-center sm:justify-between">
          
          {/* Left Side (Deactivate / Info) */}
          <div className="flex items-center">
             {mode === "edit" ? (
               <span className="text-xs text-muted-foreground italic hidden sm:block">* All fields are required</span>
             ) : null}
          </div>

          {/* Right Side (Actions) */}
          <div className="flex gap-3">
            {mode === "view" ? (
              <>
                <Button variant="ghost" onClick={onClose}>Close</Button>
                {canEdit && (
                  <Button onClick={() => setMode("edit")} className="min-w-25">
                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setMode("view")} type="button">
                  Cancel
                </Button>
                
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => {
                    const isBusy = isSubmitting || isUpdatingRole;
                    return (
                        <Button 
                        onClick={form.handleSubmit}
                        disabled={!canSubmit || isBusy}
                        className="min-w-32.5"
                        >
                        {isBusy ? (
                            <>
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                            Saving...
                            </>
                        ) : (
                            <>
                            <Save className="w-3.5 h-3.5 mr-2" />
                            Save Changes
                            </>
                        )}
                        </Button>
                    )
                  }}
                />
              </>
            )}
          </div>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Sub Components                                                     */
/* ------------------------------------------------------------------ */

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm text-foreground break-all">{value || "—"}</span>
    </div>
  );
}

function SystemMetadata({ user }: { user: any }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Hash className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">System Metadata</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 bg-muted/20">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground flex items-center gap-2">User ID</span>
          <span className="font-mono text-xs text-foreground">{user?.userId}</span>
        </div>
        <Separator className="bg-border/50" />
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <History className="w-3.5 h-3.5" /> Last Login
          </span>
          <span className="text-foreground">
            {user?.lastLoginAt 
              ? new Date(user.lastLoginAt).toLocaleString() 
              : "Never"}
          </span>
        </div>
        <Separator className="bg-border/50" />
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Created On
          </span>
          <span className="text-foreground">
            {user?.createdAt 
              ? new Date(user.createdAt).toLocaleDateString() 
              : "Unknown"}
          </span>
        </div>
      </div>
    </section>
  );
}