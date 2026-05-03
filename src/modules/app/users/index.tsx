import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { useCan } from "@/auth/rbac/useCan";
import { fadeUp } from "@/components/motions/MotionFade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Download,
  ListFilter,
  MoreVerticalIcon,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { DataTable } from "./components/data-table/user-table";
import { usersColumns } from "./components/data-table/user-column";
import { UserDetailsSheet } from "./components/user-detail-sheet/UserDetailsSheet";
import { CreateUserDialog } from "./components/create-user-sheet/create-user-sheet";
import { DeleteUserDialog } from "./components/deleteUserDialog";

import { useUsersQuery, type User } from "./api/useUserDetails";
import { useDeleteUser } from "./api/useDeleteUser";
import { Route } from "@/routes/_authenticated/app/users/route";

type UserStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type UserRoleFilter =
  | "ALL"
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "STAFF"
  | "TAILOR";

const STATUS_FILTERS: Array<{
  label: string;
  value: UserStatusFilter;
}> = [
  { label: "All users", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const ROLE_FILTERS: Array<{
  label: string;
  value: UserRoleFilter;
}> = [
  { label: "All roles", value: "ALL" },
  { label: "Owner", value: "OWNER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Staff", value: "STAFF" },
  { label: "Tailor", value: "TAILOR" },
];

export default function HeloraUsersPage() {
  const navigate = useNavigate();

  const { userId, action } = Route.useSearch();

  const canManageAll = useCan("manage", "all");
  const canCreateUser =
    useCan("create", "settings-users") || useCan("create", "all");
  const canDeleteUser =
    useCan("delete", "settings-users") || useCan("delete", "all");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("ALL");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const { data, isLoading, isRefetching, refetch } = useUsersQuery({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search,

    /**
     * Add these to your hook only if backend supports them.
     * If not supported yet, remove these two fields and filter server-side later.
     */
    status: statusFilter === "ALL" ? undefined : statusFilter,
    role: roleFilter === "ALL" ? undefined : roleFilter,
  } as any);

  const users = data?.items ?? [];
  const totalUsers = data?.total ?? 0;

  const userStats = useMemo(() => {
    const activeUsers = users.filter((user: any) => {
      return user.status === "ACTIVE" || user.isActive === true;
    }).length;

    const adminUsers = users.filter((user: any) => {
      const roleName =
        user.roleName ||
        user.role ||
        user.accessLevel ||
        user.membershipRole ||
        "";

      return String(roleName).toUpperCase().includes("ADMIN");
    }).length;

    const tailorUsers = users.filter((user: any) => {
      const roleName =
        user.roleName ||
        user.role ||
        user.accessLevel ||
        user.membershipRole ||
        "";

      return String(roleName).toUpperCase().includes("TAILOR");
    }).length;

    return {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      tailors: tailorUsers,
    };
  }, [users, totalUsers]);

  const openUserSheet = (user: User) => {
    navigate({
      from: Route.fullPath,
      search: (prev) => ({
        ...prev,
        userId: String(
          (user as any).tenantUserId ??
            (user as any).userId ??
            (user as any).id,
        ),
        mode: "view",
        tab: "details",
        action: undefined,
      }),
    });
  };

  const closeUserSheet = () => {
    navigate({
      from: Route.fullPath,
      search: (prev: any) => {
        const { userId, mode, tab, ...rest } = prev;
        return rest;
      },
    });
  };

  const openCreateSheet = () => {
    navigate({
      from: Route.fullPath,
      search: (prev) => ({
        ...prev,
        action: "create",
        userId: undefined,
        mode: undefined,
        tab: undefined,
      }),
    });
  };

  const closeCreateSheet = () => {
    navigate({
      from: Route.fullPath,
      search: (prev: any) => {
        const { action, ...rest } = prev;
        return rest;
      },
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    const selectedUserId =
      (userToDelete as any)?.userId ??
      (userToDelete as any)?.id ??
      (userToDelete as any)?.tenantUserId;

    if (!selectedUserId) return;

    deleteUser(selectedUserId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        refetch();
      },
    });
  };

  const resetFilters = () => {
    setStatusFilter("ALL");
    setRoleFilter("ALL");
    setSearch("");
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  return (
    <PermissionGate action="read" subject="settings-users">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-users"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                      Users
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                      Manage Helora ERP users, roles, and shop access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isLoading || isRefetching}
                  className="h-9 rounded-xl bg-white font-bold"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
                  />
                </Button>

                <Button
                  onClick={openCreateSheet}
                  disabled={!canCreateUser}
                  className="h-9 rounded-lg font-bold shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <UserStatCard
                title="Total Users"
                value={userStats.total}
                description="All users in this tenant"
                icon={Users}
              />

              <UserStatCard
                title="Active Users"
                value={userStats.active}
                description="Can access Helora ERP"
                icon={UserCheck}
              />

              <UserStatCard
                title="Admins"
                value={userStats.admins}
                description="Users with admin access"
                icon={ShieldCheck}
              />

              <UserStatCard
                title="Tailors"
                value={userStats.tailors}
                description="Production users"
                icon={Store}
              />
            </div>

            {/* Toolbar */}
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPagination((prev) => ({
                          ...prev,
                          pageIndex: 0,
                        }));
                      }}
                      placeholder="Search by name, email, phone or role..."
                      className="h-10 rounded-2xl border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 rounded-2xl bg-white font-bold"
                        >
                          <ListFilter className="mr-2 h-4 w-4" />
                          Status
                          <Badge
                            variant="secondary"
                            className="ml-2 rounded-lg bg-slate-100 text-slate-700"
                          >
                            {statusFilter === "ALL" ? "All" : statusFilter}
                          </Badge>
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {STATUS_FILTERS.map((item) => (
                          <DropdownMenuCheckboxItem
                            key={item.value}
                            checked={statusFilter === item.value}
                            onCheckedChange={() => {
                              setStatusFilter(item.value);
                              setPagination((prev) => ({
                                ...prev,
                                pageIndex: 0,
                              }));
                            }}
                          >
                            {item.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 rounded-2xl bg-white font-bold"
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Role
                          <Badge
                            variant="secondary"
                            className="ml-2 rounded-lg bg-slate-100 text-slate-700"
                          >
                            {roleFilter === "ALL" ? "All" : roleFilter}
                          </Badge>
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {ROLE_FILTERS.map((item) => (
                          <DropdownMenuCheckboxItem
                            key={item.value}
                            checked={roleFilter === item.value}
                            onCheckedChange={() => {
                              setRoleFilter(item.value);
                              setPagination((prev) => ({
                                ...prev,
                                pageIndex: 0,
                              }));
                            }}
                          >
                            {item.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {(search ||
                      statusFilter !== "ALL" ||
                      roleFilter !== "ALL") && (
                      <Button
                        variant="ghost"
                        onClick={resetFilters}
                        className="h-10 rounded-2xl font-bold text-slate-500 hover:text-slate-900"
                      >
                        Clear
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-2xl bg-white"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Users
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-slate-200">
              <CardHeader className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-950">
                      User Directory
                    </CardTitle>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      View users, check access, and manage Helora ERP accounts.
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-xl px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {totalUsers} users
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
                <DataTable
                  data={users}
                  columns={usersColumns({
                    isSuperAdmin: canManageAll,
                    onView: openUserSheet,
                    onDelete: handleDeleteClick,
                    canDelete: canDeleteUser,
                  })}
                  pageCount={Math.ceil(totalUsers / pagination.pageSize)}
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <CreateUserDialog
          open={action === "create"}
          onClose={closeCreateSheet}
        />

        <UserDetailsSheet
          open={!!userId}
          userId={userId}
          onClose={closeUserSheet}
        />

        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          isPending={isDeleting}
          userName={
            (userToDelete as any)?.userName ||
            (userToDelete as any)?.fullName ||
            (userToDelete as any)?.name
          }
        />
      </div>
    </PermissionGate>
  );
}

function UserStatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
