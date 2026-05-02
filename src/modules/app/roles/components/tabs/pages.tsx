import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  LayoutGrid,
  Users,
  Settings,
  FileText,
  Building,
  Shield,
  Pencil,
  Trash2,
  Code,
  Calendar,
  Search,
  Route,
  Eye,
  EyeOff,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  PackageOpen,
  Ruler,
  ShoppingBag,
  Banknote,
  UserRound,
  Clock3,
  MessageCircle,
  BarChart3,
  UserCog,
  Tags,
  ScrollText,
  PanelsTopLeft,
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetPages } from "@/api/useGetPages";
import type { Page } from "@/modules/app/roles/types/pages.types";

const pageIconMap = {
  LayoutDashboard,
  UsersRound: Users,
  Users,
  Settings,
  FileText,
  Building,
  Shield,
  PackageOpen,
  Ruler,
  ShoppingBag,
  Banknote,
  UserRound,
  Clock3,
  MessageCircle,
  BarChart3,
  UserCog,
  KeyRound,
  Tags,
  ScrollText,
  PanelsTopLeft,
} as const;

function getPageIcon(page: Page) {
  const iconName = page.icon as keyof typeof pageIconMap | null;

  if (iconName && pageIconMap[iconName]) {
    return pageIconMap[iconName];
  }

  const text = `${page.title} ${page.code}`.toLowerCase();

  if (text.includes("user")) return Users;
  if (text.includes("setting")) return Settings;
  if (text.includes("role") || text.includes("permission")) return Shield;
  if (text.includes("payment")) return Banknote;
  if (text.includes("order")) return ShoppingBag;
  if (text.includes("employee")) return UserRound;
  if (text.includes("attendance")) return Clock3;
  if (text.includes("whatsapp")) return MessageCircle;
  if (text.includes("report")) return BarChart3;

  return LayoutGrid;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "N/A";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(dateString));
}

export function ResourcesTable() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useGetPages({
    params: {
      page,
      pageSize,
      q: search || undefined,
      sortBy: "sortOrder",
      sortOrder: "asc",
    },
  });

  const pages = useMemo(() => data?.items ?? [], [data?.items]);
  const meta = data?.meta;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pages & Navigation
            </h2>
            <p className="text-sm text-slate-500">
              Manage ERP sidebar pages, routes, visibility and page permissions.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search page name or code..."
              className="h-10 rounded-lg border-slate-200 bg-white pl-9"
            />
          </div>
        </div>
      </Card>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-70 pl-6">Page</TableHead>
              <TableHead className="w-45">Code</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="w-32.5">Type</TableHead>
              <TableHead className="w-35">Permissions</TableHead>
              <TableHead className="w-32.5">Visibility</TableHead>
              <TableHead className="w-35">Created</TableHead>
              <TableHead className="w-22.5 pr-6 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-56" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-lg" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-lg" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-sm text-slate-500"
                >
                  No pages found.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((pageItem) => {
                const Icon = getPageIcon(pageItem);

                return (
                  <TableRow
                    key={pageItem.id}
                    className="group transition-colors hover:bg-slate-50"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {pageItem.title}
                            </p>

                            {pageItem.parentId ? (
                              <Badge
                                variant="outline"
                                className="rounded-lg border-blue-200 bg-blue-50 px-2 py-0 text-[10px] font-semibold text-blue-700"
                              >
                                Child
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="rounded-lg border-slate-200 bg-slate-50 px-2 py-0 text-[10px] font-semibold text-slate-600"
                              >
                                Parent
                              </Badge>
                            )}
                          </div>

                          <p
                            className="line-clamp-1 text-xs text-slate-500"
                            title={pageItem.description ?? undefined}
                          >
                            {pageItem.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Code className="h-3.5 w-3.5 text-slate-400" />
                        <code className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                          {pageItem.code}
                        </code>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Route className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-1 font-medium">
                          {pageItem.routePath}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-lg border-slate-200 bg-white px-2.5 py-0.5 font-medium text-slate-600"
                      >
                        {pageItem.type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold">
                          {pageItem._count?.pagePermissions ??
                            pageItem.permissions?.length ??
                            0}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {pageItem.isActive ? (
                          <Badge className="rounded-lg bg-emerald-50 px-2 py-0.5 text-emerald-700 hover:bg-emerald-50">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="rounded-lg bg-red-50 px-2 py-0.5 text-red-700 hover:bg-red-50">
                            Inactive
                          </Badge>
                        )}

                        {pageItem.isVisible ? (
                          <Badge
                            variant="outline"
                            className="rounded-lg border-slate-200 bg-white px-2 py-0.5 text-slate-600"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Visible
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-lg border-slate-200 bg-white px-2 py-0.5 text-slate-500"
                          >
                            <EyeOff className="mr-1 h-3 w-3" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5 opacity-50" />
                        {formatDate(pageItem.createdAt)}
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
                          <DropdownMenuLabel>Manage Page</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4 text-slate-400" />
                            Edit Details
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <KeyRound className="mr-2 h-4 w-4 text-slate-400" />
                            Assign Permissions
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Page
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            {meta ? (
              <>
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {pages.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {meta.total}
                </span>{" "}
                pages
              </>
            ) : (
              "Showing pages"
            )}

            {isFetching && !isLoading ? (
              <span className="ml-2 text-xs text-slate-400">Updating...</span>
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
    </div>
  );
}