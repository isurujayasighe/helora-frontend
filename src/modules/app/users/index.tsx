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
import { CustomerStatCard } from "@/components/common/customer-stat-card";
import { DashboardPageHeader } from "../dashboard/components/dashboard-page-header";

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

  const canCreateSettingsUser = useCan("create", "settings-users");
  const canCreateAnyUser = useCan("create", "all");
  const canDeleteSettingsUser = useCan("delete", "settings-users");
  const canDeleteAnyUser = useCan("delete", "all");
  const canCreateUser = canCreateSettingsUser || canCreateAnyUser;
  const canDeleteUser = canDeleteSettingsUser || canDeleteAnyUser;

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

  const users = useMemo(() => data?.items ?? [], [data?.items]);
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
    const activeUsers = users.filter((user) => {
      return user.status === "ACTIVE" && user.isActive === true;
    }).length;

    const adminUsers = users.filter((user) => {
      const roleName = user.memberships
        ?.map((membership) => membership.role?.name)
        .join(" ");

      return String(roleName).toUpperCase().includes("ADMIN");
    }).length;

    const tailorUsers = users.filter((user) => {
      const roleName = user.memberships
        ?.map((membership) => membership.role?.name)
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
        userId: String(user.tenantUserId ?? user.userId ?? user.id),
        mode: "view",
        tab: "details",
        action: undefined,
      }),
    });
  };

  const closeUserSheet = () => {
    navigate({
      from: Route.fullPath,
      search: (prev) => ({
        ...prev,
        userId: undefined,
        mode: undefined,
        tab: undefined,
      }),
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
      search: (prev) => ({ ...prev, action: undefined }),
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    const selectedUserId =
      userToDelete?.userId ?? userToDelete?.id ?? userToDelete?.tenantUserId;

    if (!selectedUserId) return;

    const tenantId = userToDelete?.memberships?.[0]?.tenantId;

    if (!tenantId) return;

    deleteUser(
      { userId: selectedUserId, tenantId },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
          refetch();
        },
      },
    );
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
  const canGoPrevious =
    usersPagination.hasPreviousPage || pagination.pageIndex > 0;
  const canGoNext =
    usersPagination.hasNextPage || pagination.pageIndex + 1 < safeTotalPages;

  const selectedRoleLabel =
    roleFilter === "ALL"
      ? "All"
      : (roles.find((role) => role.id === roleFilter)?.name ?? "Role");

  return (
    <PermissionGate action="read" subject="settings-users">
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 md:p-6">
            <DashboardPageHeader
              title="Users"
              description="Manage Helora ERP users, roles, and shop access."
              actions={
                <>
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

                  <Button onClick={openCreateSheet} disabled={!canCreateUser}>
                    <Plus className="size-4" />
                    Create User
                  </Button>
                </>
              }
            />

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CustomerStatCard
                title="Total Users"
                value={userStats.total}
                description="All users in this tenant"
                icon={Users}
              />

              <CustomerStatCard
                title="Active Users"
                value={userStats.active}
                description="Can access Helora ERP"
                icon={UserCheck}
              />

              <CustomerStatCard
                title="Admins"
                value={userStats.admins}
                description="Users with admin access"
                icon={ShieldCheck}
              />

              <CustomerStatCard
                title="Tailors"
                value={userStats.tailors}
                description="Production users"
                icon={Store}
              />
            </div>

            {/* Toolbar */}
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-md">
                    <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
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
                      className="bg-background pl-9"
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
            <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>User Directory</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
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

              <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
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

                  <div className="rounded-md border px-3 py-1.5 text-sm font-medium">
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
            userToDelete?.userName ||
            [userToDelete?.firstName, userToDelete?.lastName]
              .filter(Boolean)
              .join(" ") ||
            userToDelete?.email
          }
        />
      </div>
    </PermissionGate>
  );
}
