import { useState } from "react";
import {
  MoreHorizontal,
  Shield,
  Users,
  Lock,
  Pencil,
  Trash2,
  Copy,
  History,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";
import { Skeleton } from "@/components/ui/skeleton";

// --- Hooks ---
import { useGetRoles } from "@/api/useGetRoles";
import { useDeleteRole } from "../../api/useDeleteRole";

export function RolesTable() {
  // 1. Fetch Data
  const { data: apiRoles = [], isLoading } = useGetRoles();
  
  // 2. Delete Hook
  const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteRole();

  // 3. Local State for Dialog
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // 4. Map Data (same logic as before)
  const roles = apiRoles.map((role) => ({
    id: role.id,
    name: role.name,
    desc: role.description || "No description provided",
    type: ["Super Admin", "System Admin", "Admin", "Read-Only Viewer"].includes(role.name)
      ? "System"
      : "Custom",
    count: 0,
    date: "N/A",
    initials: [],
  }));

  // 5. Handlers
  const handleDeleteClick = (role: { id: string; name: string }) => {
    setRoleToDelete(role);
    setDeleteConfirmation(""); // Reset input
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole({ roleId: roleToDelete.id });
      setRoleToDelete(null); // Close dialog on success
    } catch (error) {
      // Error handling is managed by the hook's onError (toast)
    }
  };

  return (
    <PermissionGate action="read" subject="all">
      <AnimatePresence mode="wait">
        <motion.div
          key="roles-table"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Header Section (if needed) */}
        </motion.div>

        <div className="rounded-sm border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-6 w-87.5">Role Identity</TableHead>
                <TableHead className="w-37.5">Type</TableHead>
                <TableHead>Assigned Users</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right pr-6 w-25">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // --- LOADING SKELETON (Unchanged) ---
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                         <Skeleton className="h-4 w-10" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : roles.length === 0 ? (
                 // --- EMPTY STATE ---
                 <TableRow>
                   <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                     No roles found.
                   </TableCell>
                 </TableRow>
              ) : (
                // --- DATA ROWS ---
                roles.map((role) => (
                  <TableRow
                    key={role.id}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    {/* Identity */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background",
                            role.type === "System"
                              ? "text-purple-600 border-purple-200 bg-purple-50"
                              : "text-muted-foreground"
                          )}
                        >
                          <Shield className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                            {role.name}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {role.desc}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell>
                      {role.type === "System" ? (
                        <Badge
                          variant="secondary"
                          className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 gap-1.5 px-2.5 py-0.5 shadow-none font-medium"
                        >
                          <Lock className="h-3 w-3" /> System
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground gap-1.5 px-2.5 py-0.5 font-medium bg-background"
                        >
                          Custom
                        </Badge>
                      )}
                    </TableCell>

                    {/* Users (Mocked Logic) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 overflow-hidden">
                          {role.initials.length > 0 ? (
                            role.initials.slice(0, 3).map((initial: string, i: number) => (
                              <Avatar
                                key={i}
                                className="inline-block h-6 w-6 border-2 border-background ring-1 ring-muted"
                              >
                                <AvatarFallback className="text-[9px] bg-muted font-medium text-muted-foreground">
                                  {initial}
                                </AvatarFallback>
                              </Avatar>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              -
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <History className="h-3.5 w-3.5 opacity-50" />
                        {role.date}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-45">
                          <DropdownMenuLabel>Manage Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                            Duplicate Role
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            View Assignees
                          </DropdownMenuItem>
                          {role.type !== "System" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                onClick={() => handleDeleteClick(role)} // Open Dialog
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Role
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- DELETE CONFIRMATION DIALOG --- */}
        <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <AlertDialogTitle>Delete Role?</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                <span className="font-semibold text-foreground mx-1">
                  "{roleToDelete?.name}"
                </span>
                role and remove it from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4 space-y-3">
                <Label htmlFor="confirm-role-name" className="text-xs font-semibold">
                    Type <span className="font-mono text-red-600 select-all">{roleToDelete?.name}</span> to confirm
                </Label>
                <Input 
                    id="confirm-role-name"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Enter role name"
                    autoComplete="off"
                />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteConfirmation !== roleToDelete?.name || isDeleting}
                onClick={(e) => {
                    e.preventDefault(); // Prevent auto-close
                    handleConfirmDelete();
                }}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AnimatePresence>
    </PermissionGate>
  );
}