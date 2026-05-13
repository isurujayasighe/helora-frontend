import { MoreHorizontal, ShieldCheck, Trash2, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { User } from "../api/useUserDetails";

type UsersTableProps = {
  users: User[];
  isLoading?: boolean;
  canDelete?: boolean;
  onView: (user: User) => void;
  onDelete: (user: User) => void;
};

const statusClassName = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "INVITED":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "DISABLED":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const getRoleNames = (user: User) => {
  const roles = user.memberships
    ?.map((membership) => membership.role?.name)
    .filter(Boolean);

  return roles?.length ? Array.from(new Set(roles)).join(", ") : "-";
};

const getAccessText = (user: User) => {
  const activeAccess = user.memberships?.some((membership) => membership.isActive);
  return activeAccess ? "Access enabled" : "Access disabled";
};

export function UsersTable({
  users,
  isLoading,
  canDelete,
  onView,
  onDelete,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-lg bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
        <UserRound className="h-10 w-10 text-slate-400" />
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No users found
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting the search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="cursor-pointer"
              onClick={() => onView(user)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-slate-800">{user.userName}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {user.id}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-slate-600">{user.email}</TableCell>

              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  {getRoleNames(user)}
                </span>
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-2.5 py-1 font-bold",
                    statusClassName(user.status),
                  )}
                >
                  {user.status}
                </Badge>
              </TableCell>

              <TableCell className="text-slate-600">
                {getAccessText(user)}
              </TableCell>

              <TableCell className="text-slate-600">
                {formatDate(user.createdAt)}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        onView(user);
                      }}
                    >
                      View details
                    </DropdownMenuItem>

                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 focus:text-red-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(user);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove access
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

