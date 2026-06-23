import { Blocks, Eye, MoreHorizontal, Pencil, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Block } from "@/types/blocks";

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const statusVariant = (
  status?: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "INACTIVE":
      return "secondary";
    case "ARCHIVED":
      return "destructive";
    default:
      return "outline";
  }
};

type BlocksTableProps = {
  blocks: Block[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewBlock: (blockId: string) => void;
  onEditBlock: (blockId: string) => void;
  onAssignCustomers: (blockId: string) => void;
};

export function BlocksTable({
  blocks,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewBlock,
  onEditBlock,
  onAssignCustomers,
}: BlocksTableProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center border border-dashed bg-background p-8 text-center">
        <Blocks className="size-10 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          No blocks found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your search filters or add a new block.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="px-4">Block</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="px-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {blocks.map((block) => (
            <TableRow key={block.id}>
              <TableCell className="px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {block.blockNumber}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary">{block.category?.name || "-"}</Badge>
              </TableCell>

              <TableCell>
                {block.readyMadeSize || block.sizeLabel || "-"}
              </TableCell>

              <TableCell>{formatDate(block.createdAt)}</TableCell>

              <TableCell>{formatDate(block.lastUsedAt)}</TableCell>

              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {block._count?.orderItems ?? 0} orders
                </span>
              </TableCell>

              <TableCell>
                <Badge variant={statusVariant(block.status)}>
                  {block.status?.replaceAll("_", " ") || "-"}
                </Badge>
              </TableCell>

              <TableCell className="px-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open block actions</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewBlock(block.id)}>
                      <Eye className="size-4" />
                      View details
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => onEditBlock(block.id)}>
                      <Pencil className="size-4" />
                      Edit block
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onAssignCustomers(block.id)}
                    >
                      <UsersRound className="size-4" />
                      Assign customers
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page{" "}
          <span className="font-medium text-foreground">{currentPage}</span> of{" "}
          <span className="font-medium text-foreground">
            {Math.max(totalPages, 1)}
          </span>{" "}
          - <span className="font-medium text-foreground">{totalCount}</span>{" "}
          blocks
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= Math.max(totalPages, 1)}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
