import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface Props<T> {
  table: Table<T>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<T>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: Props<T>) {
  const {
    pageIndex,
    pageSize,
  } = table.getState().pagination;

  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-0">
      {/* Left: page info */}
      <span className="text-sm text-muted-foreground">
        Page <strong>{pageIndex + 1}</strong> of{" "}
        <strong>{pageCount}</strong>
      </span>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* First */}
        <Button
          variant="outline"
           size="sm"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Next */}
        <Button
          variant="outline"
           size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>

        {/* Go to page */}
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Go to</span>
          <Input
            type="number"
            min={1}
            max={pageCount}
            value={pageIndex + 1}
            onChange={(e) => {
              const value = e.target.value;
              const page = value ? Number(value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 h-8"
          />
        </div>

        {/* Page size */}
        <Select
          value={String(pageSize)}
          onValueChange={(value) =>
            table.setPageSize(Number(value))
          }
        >
          <SelectTrigger className="h-8 w-30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                Show {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
