import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { useCan } from "@/auth/rbac/useCan";
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
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
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

import { UserDetailsSheet } from "./components/user-detail-sheet/UserDetailsSheet";
import { CreateUserDialog } from "./components/create-user-sheet/create-user-sheet";
import { DeleteUserDialog } from "./components/deleteUserDialog";
import { UsersTable } from "./components/users-table";

import { useUsersQuery, type User } from "./api/useUserDetails";
import { useDeleteUser } from "./api/useDeleteUser";
import { Route } from "@/routes/_authenticated/app/users/route";
import { useGetRoles } from "@/api/useGetRoles";

type UserStatusFilter = "ALL" | "ACTIVE" | "INVITED" | "DISABLED";

const STATUS_FILTERS: Array<{
  label: string;
  value: UserStatusFilter;
}> = [
  { label: "All users", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Invited", value: "INVITED" },
  { label: "Disabled", value: "DISABLED" },
];

export default function HeloraUsersPage() {
  const navigate = useNavigate();

  const { userId, action } = Route.useSearch();

  const canCreateUser =
    useCan("create", "settings-users") || useCan("create", "all");
  const canDeleteUser =
    useCan("delete", "settings-users") || useCan("delete", "all");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { data: rolesResponse } = useGetRoles();
  const roles = rolesResponse?.items ?? [];

  const { data, isLoading, isRefetching, refetch } = useUsersQuery({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    roleId: roleFilter === "ALL" ? undefined : roleFilter,
  });

  const users = data?.items ?? [];
  const totalUsers = data?.total ?? 0;
  const usersPagination = data?.pagination ?? {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const userStats = useMemo(() => {
    const activeUsers = users.filter((user: any) => {
      return user.status === "ACTIVE" && user.isActive === true;
    }).length;

    const adminUsers = users.filter((user: any) => {
      const roleName = user.memberships
        ?.map((membership: any) => membership.role?.name)
        .join(" ");

      return String(roleName).toUpperCase().includes("ADMIN");
    }).length;

    const tailorUsers = users.filter((user: any) => {
      const roleName = user.memberships
        ?.map((membership: any) => membership.role?.name)
        .join(" ");

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

    const tenantId = userToDelete?.memberships?.[0]?.tenantId;

    if (!tenantId) return;

    deleteUser({ userId: selectedUserId, tenantId }, {
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

  const safeTotalPages = Math.max(usersPagination.totalPages || 1, 1);
  const canGoPrevious = usersPagination.hasPreviousPage || pagination.pageIndex > 0;
  const canGoNext =
    usersPagination.hasNextPage || pagination.pageIndex + 1 < safeTotalPages;

  const selectedRoleLabel =
    roleFilter === "ALL"
      ? "All"
      : roles.find((role) => role.id === roleFilter)?.name ?? "Role";

  return (
    <PermissionGate action="read" subject="settings-users">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
          <div className="flex h-full flex-col gap-4 p-3 md:p-5">
            {/* Header */}
            <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                      Users
                    </h1>
                    <p className="text-sm font-normal text-slate-500">
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
                  className="h-9 rounded-md bg-white"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
                  />
                </Button>

                <Button
                  onClick={openCreateSheet}
                  disabled={!canCreateUser}
                  className="h-9 rounded-md"
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
            <Card className="rounded-md border-slate-200">
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
                      className="h-9 rounded-md border-slate-200 bg-slate-50 pl-9 font-normal shadow-none focus-visible:bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-9 rounded-md bg-white"
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
                          className="h-9 rounded-md bg-white"
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Role
                          <Badge
                            variant="secondary"
                            className="ml-2 rounded-lg bg-slate-100 text-slate-700"
                          >
                            {selectedRoleLabel}
                          </Badge>
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuCheckboxItem
                          checked={roleFilter === "ALL"}
                          onCheckedChange={() => {
                            setRoleFilter("ALL");
                            setPagination((prev) => ({
                              ...prev,
                              pageIndex: 0,
                            }));
                          }}
                        >
                          All roles
                        </DropdownMenuCheckboxItem>

                        {roles.map((role) => (
                          <DropdownMenuCheckboxItem
                            key={role.id}
                            checked={roleFilter === role.id}
                            onCheckedChange={() => {
                              setRoleFilter(role.id);
                              setPagination((prev) => ({
                                ...prev,
                                pageIndex: 0,
                              }));
                            }}
                          >
                            {role.name}
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
                        className="h-9 rounded-md text-slate-500 hover:text-slate-900"
                      >
                        Clear
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-md bg-white"
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
                    <CardTitle className="text-base font-semibold text-slate-950">
                      User Directory
                    </CardTitle>
                    <p className="mt-1 text-sm font-normal text-slate-500">
                      View users, check access, and manage Helora ERP accounts.
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded px-3 py-1 font-medium text-slate-600 sm:inline-flex"
                  >
                    {totalUsers} users
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
                <UsersTable
                  users={users}
                  isLoading={isLoading}
                  canDelete={canDeleteUser}
                  onView={openUserSheet}
                  onDelete={handleDeleteClick}
                />
              </CardContent>

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {users.length} of {totalUsers} users
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-md"
                    disabled={!canGoPrevious || isLoading || isRefetching}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        pageIndex: Math.max(prev.pageIndex - 1, 0),
                      }))
                    }
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                    {usersPagination.page} / {safeTotalPages}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-md"
                    disabled={!canGoNext || isLoading || isRefetching}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        pageIndex: Math.min(
                          prev.pageIndex + 1,
                          safeTotalPages - 1,
                        ),
                      }))
                    }
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

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
    <Card className="rounded-md border-slate-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-normal text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
