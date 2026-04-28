import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { fadeUp } from "@/components/motions/MotionFade";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  ChevronDown,
  Download,
  MoreVerticalIcon,
  ListFilter,
  RefreshCw,
} from "lucide-react";
import { DataTable } from "./components/data-table/user-table";
import { useState } from "react";
import { useUsersQuery, type User } from "./api/useUserDetails";
import { usersColumns } from "./components/data-table/user-column";
import { useCan } from "@/auth/rbac/useCan";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "@/routes/_authenticated/admin/users/route";
import { UserDetailsSheet } from "./components/user-detail-sheet/UserDetailsSheet";
import { CreateUserSheet } from "./components/create-user-sheet/create-user-sheet";
import { useDeleteUser } from "./api/useDeleteUser";
import { DeleteUserDialog } from "./components/deleteUserDialog";

export default function SystemUserPage() {
  const navigate = useNavigate();
  
  // 1. Read State from URL Search Params
  // Make sure your route definition includes these in the validateSearch schema
  const { userId, action } = Route.useSearch();

  const [search, setSearch] = useState("");
  const isSuperAdmin = useCan("manage", "all");
  const canDelete = useCan("delete", "all");
  const canCreateAccount = useCan("create", "all");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, refetch, isRefetching } = useUsersQuery({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search,
  });

  // --- Navigation Handlers ---

  const openUserSheet = (user: User) => {
    navigate({
      // Explicitly tell the search function which route we are targeting
      from: Route.fullPath, 
      search: (prev) => ({
        ...prev,
        userId: String(user.tenantUserId),
        mode: "view",
        tab: "details",
        action: undefined,
      }),
    });
  };

  const closeUserSheet = () => {
    navigate({
      from: Route.fullPath,
      search: (prev) => {
        // This is the safest way to clear params in TanStack Router
        const { userId, mode, tab, ...rest } = prev;
        return rest;
      },
    });
  };

  const handleCreateUser = () => {
    navigate({
      from: Route.fullPath,
      search: (prev) => ({
        ...prev,
        action: "create",
        userId: undefined,
      }),
    });
  };

  const closeCreateSheet = () => {
    navigate({
      from: Route.fullPath,
      search: (prev: any) => ({
        ...prev,
        action: undefined,
      }),
    });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete?.userId) {
      deleteUser(userToDelete.userId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  return (
    <PermissionGate action="read" subject="all">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key="tenant-accounts"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col h-full gap-4 "
          >
            {/* Toolbar */}
            <div className="flex-none flex flex-col gap-4 md:flex-row md:items-center justify-between">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9 bg-white shadow-sm h-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  className="border-0 font-bold"
                  onClick={() => refetch()}
                  disabled={isLoading || isRefetching}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 mr-2 ${isRefetching ? "animate-spin" : ""}`}
                  />
                  <span>Refresh</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 text-sm font-bold">
                      <ListFilter className="h-4 w-4 mr-2" />
                      Filter
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>All Users</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  onClick={handleCreateUser}
                  className="font-semibold h-8"
                  disabled={!canCreateAccount}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Invite Users
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <DataTable
                data={data?.items ?? []}
                columns={usersColumns({
                  isSuperAdmin,
                  onView: openUserSheet,
                  onDelete: handleDeleteClick,
                  canDelete: canDelete,
                })}
                pageCount={Math.ceil((data?.total ?? 0) / pagination.pageSize)}
                pagination={pagination}
                onPaginationChange={setPagination}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Create User Sheet - Controlled by URL 'action' */}
        <CreateUserSheet
          open={action === "create"}
          onClose={closeCreateSheet}
        />

        {/* User Details Sheet - Controlled by URL 'userId' */}
        <UserDetailsSheet
          open={!!userId}
          userId={userId}
          onClose={closeUserSheet}
        />

        {/* Delete Confirmation */}
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          isPending={isDeleting}
          userName={userToDelete?.userName}
        />
      </div>
    </PermissionGate>
  );
}