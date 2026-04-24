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
  Calendar
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Import the Hook
import { useGetPages } from "@/api/useGetPages"; 

export function ResourcesTable() {
  // 2. Fetch Data
  const { data: pages = [], isLoading } = useGetPages();

  console.log("Fetched Pages:", pages); // Debug log to verify data structure

  // 3. Helper to determine Icon based on page name
  const getPageIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("user")) return Users;
    if (lower.includes("setting") || lower.includes("admin")) return Settings;
    if (lower.includes("invoice") || lower.includes("finance")) return FileText;
    if (lower.includes("tenant")) return Building;
    if (lower.includes("role") || lower.includes("permission")) return Shield;
    return LayoutGrid; // Default
  };

  // 4. Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-sm border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-6 w-62.5">Page Name</TableHead>
            <TableHead className="w-45">Page Code</TableHead>
            <TableHead className="w-75">Description</TableHead>
            <TableHead className="w-37.5">Created Date</TableHead>
            <TableHead className="text-right pr-6 w-25">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // --- LOADING SKELETON ---
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : pages.length === 0 ? (
            // --- EMPTY STATE ---
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No pages found.
              </TableCell>
            </TableRow>
          ) : (
            // --- DATA ROWS ---
            pages.map((page) => {
              const Icon = getPageIcon(page.pageName);

              return (
                <TableRow key={page.pageId} className="group hover:bg-muted/50 transition-colors">
                  
                  {/* 1. Page Name with Icon */}
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">
                        {page.pageName}
                      </span>
                    </div>
                  </TableCell>

                  {/* 2. Page Code */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Code className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
                       <code className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground border">
                         {page.pageCode}
                       </code>
                    </div>
                  </TableCell>

                  {/* 3. Description */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground line-clamp-1" title={page.description}>
                      {page.description || "No description provided"}
                    </span>
                  </TableCell>

                  {/* 4. Created Date */}
                  <TableCell>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 opacity-50" />
                        {formatDate(page.createdAt)}
                     </div>
                  </TableCell>

                  {/* 5. Rich Actions Menu */}
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-45">
                        <DropdownMenuLabel>Manage Page</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
    </div>
  );
}