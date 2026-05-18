import { useMemo, useState } from "react";
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
  Search,
  KeyRound,
  ChevronLeft,
  ChevronRight,
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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";

import { useDeleteRole } from "../../api/useDeleteRole";
import { useGetRoles } from "@/api/useGetRoles";

const SYSTEM_ROLE_CODES = ["SUPER_ADMIN", "ADMIN", "MANAGER"];
const SYSTEM_ROLE_NAMES = ["Super Admin", "System Admin", "Admin", "Manager"];

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function getRoleInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function RolesTable() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useGetRoles({
    params: {
      page,
      pageSize,
      q: search || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  });

  const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteRole();

  const [roleToDelete, setRoleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const roles = useMemo(() => {
    return (data?.items ?? []).map((role) => {
      const isSystemRole =
        SYSTEM_ROLE_CODES.includes(role.code) ||
        SYSTEM_ROLE_NAMES.includes(role.name);

      return {
        id: role.id,
        code: role.code,
        name: role.name,
        desc: role.description || "No description provided",
        type: isSystemRole ? "System" : "Custom",
        assignedUsersCount: role._count?.memberships ?? 0,
        permissionsCount: role._count?.rolePermissions ?? 0,
        date: formatDate(role.updatedAt),
        initials: [getRoleInitials(role.name)],
      };
    });
  }, [data?.items]);

  const meta = data?.meta;

  const handleDeleteClick = (role: { id: string; name: string }) => {
    setRoleToDelete(role);
    setDeleteConfirmation("");
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    await deleteRole({ roleId: roleToDelete.id });
    setRoleToDelete(null);
    setDeleteConfirmation("");
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <PermissionGate action="read" subject="settings">
      <AnimatePresence mode="wait">
        <motion.div
          key="roles-table"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <Card className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Roles & Access Levels
                </h2>
                <p className="text-sm text-slate-500">
                  Manage ERP roles, assigned users and permission counts.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search role name or code..."
                  className="h-10 rounded-lg border-slate-200 bg-white pl-9"
                />
              </div>
            </div>
          </Card>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-90 pl-6">
                    Role Identity
                  </TableHead>
                  <TableHead className="w-37.5">Type</TableHead>
                  <TableHead>Assigned Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-25 pr-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-52" />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-sm text-slate-500"
                    >
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow
                      key={role.id}
                      className="group transition-colors hover:bg-slate-50"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white",
                              role.type === "System"
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 text-slate-500",
                            )}
                          >
                            <Shield className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {role.name}
                              </p>

                              <Badge
                                variant="outline"
                                className="rounded-lg border-slate-200 bg-slate-50 px-2 py-0 text-[10px] font-semibold text-slate-500"
                              >
                                {role.code}
                              </Badge>
                            </div>

                            <p className="line-clamp-1 text-xs text-slate-500">
                              {role.desc}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {role.type === "System" ? (
                          <Badge className="gap-1.5 rounded-lg bg-slate-900 px-2.5 py-0.5 font-medium text-white hover:bg-slate-900">
                            <Lock className="h-3 w-3" />
                            System
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1.5 rounded-lg border-slate-200 bg-white px-2.5 py-0.5 font-medium text-slate-600"
                          >
                            Custom
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2 overflow-hidden">
                            {role.assignedUsersCount > 0 ? (
                              role.initials.map((initial, index) => (
                                <Avatar
                                  key={`${role.id}-${index}`}
                                  className="inline-block h-6 w-6 border-2 border-white ring-1 ring-slate-200"
                                >
                                  <AvatarFallback className="bg-slate-100 text-[9px] font-semibold text-slate-600">
                                    {initial}
                                  </AvatarFallback>
                                </Avatar>
                              ))
                            ) : (
                              <span className="text-xs italic text-slate-400">
                                -
                              </span>
                            )}
                          </div>

                          <span className="text-sm font-medium text-slate-700">
                            {role.assignedUsersCount}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium">
                            {role.permissionsCount}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <History className="h-3.5 w-3.5 opacity-50" />
                          {role.date}
                        </div>
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Manage Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4 text-slate-400" />
                              Edit Permissions
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4 text-slate-400" />
                              Duplicate Role
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4 text-slate-400" />
                              View Assignees
                            </DropdownMenuItem>

                            {role.type !== "System" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                  onClick={() => handleDeleteClick(role)}
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

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                {meta ? (
                  <>
                    Showing{" "}
                    <span className="font-medium text-slate-700">
                      {roles.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-slate-700">
                      {meta.total}
                    </span>{" "}
                    roles
                  </>
                ) : (
                  "Showing roles"
                )}

                {isFetching && !isLoading ? (
                  <span className="ml-2 text-xs text-slate-400">
                    Updating...
                  </span>
                ) : null}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={!meta?.hasPreviousPage || isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>

                <div className="min-w-20 text-center text-sm font-medium text-slate-600">
                  Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={!meta?.hasNextPage || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setRoleToDelete(null);
            setDeleteConfirmation("");
          }
        }}
      >
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            </div>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <span className="font-semibold text-slate-900">
                "{roleToDelete?.name}"
              </span>{" "}
              role and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-4">
            <Label
              htmlFor="confirm-role-name"
              className="text-xs font-semibold text-slate-700"
            >
              Type{" "}
              <span className="select-all font-mono text-red-600">
                {roleToDelete?.name}
              </span>{" "}
              to confirm
            </Label>

            <Input
              id="confirm-role-name"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="Enter role name"
              autoComplete="off"
              className="rounded-lg"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteConfirmation !== roleToDelete?.name || isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
              className="border-red-600 bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  );
}