import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowUpDown, Layers } from "lucide-react"; // Removed SearchX unused
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
  onRowView?: (row: TData) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  onRowView,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { sorting, columnVisibility, rowSelection, pagination },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    manualPagination: true,
    enableRowSelection: true,
    enableColumnPinning: true,
    initialState: {
      columnPinning: { left: ["select"], right: ["actions"] },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    // CHANGE 1: Removed 'h-full'. Added 'w-full' and 'bg-white' to make it a self-contained card.
    <div className="flex flex-col w-full bg-white border rounded-md shadow-sm overflow-hidden">
      
      {/* CHANGE 2: Table Wrapper
         - Removed 'flex-1', 'absolute', 'h-full' (Stop forcing expansion).
         - Added 'min-h-[400px]' (Hybrid approach: Prevents collapse on empty state).
         - Added 'overflow-auto' (Allows scroll if rows exceed page height).
      */}
      <div className="overflow-auto">
        <Table>
          {/* Header */}
          <TableHeader className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur supports-backdrop-filter:bg-gray-50/60 border-b shadow-sm">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-none hover:bg-transparent">
                {hg.headers.map((header) => {
                  const column = header.column;
                  const canSort = column.getCanSort();
                  const sort = column.getIsSorted();
                  const pinned = column.getIsPinned();
                  const isAccessory = column.id === "select" || column.id === "actions";

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "text-xs font-semibold text-foreground capitalize h-10", // Fixed height for consistency
                        isAccessory ? "w-[1%] px-4 text-center" : "px-4",
                        pinned === "left" && "sticky left-0 z-50 bg-gray-50 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]",
                        pinned === "right" && "sticky right-0 z-50 bg-gray-50 shadow-[-1px_0_0_0_rgba(0,0,0,0.05)]"
                      )}
                      style={{
                        left: pinned === "left" ? `${header.getStart()}px` : undefined,
                        right: pinned === "right" ? `${header.getStart()}px` : undefined,
                      }}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2 select-none",
                          isAccessory && "justify-center",
                          canSort && "cursor-pointer hover:text-slate-900 transition-colors"
                        )}
                        onClick={canSort ? column.getToggleSortingHandler() : undefined}
                      >
                        {flexRender(column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="w-4">
                            {sort === "asc" && <ArrowUp className="h-3.5 w-3.5 text-slate-900" />}
                            {sort === "desc" && <ArrowDown className="h-3.5 w-3.5 text-slate-900" />}
                            {!sort && <ArrowUpDown className="h-3.5 w-3.5 opacity-20 group-hover:opacity-50 transition-opacity" />}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent border-b border-slate-100">
                  {columns.map((_col, j) => (
                    <TableCell key={j} className="px-4 py-4">
                      <Skeleton className="h-4 w-full rounded-sm bg-slate-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              <AnimatePresence initial={false}>
                {table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowView?.(row.original)}
                    className={cn(
                      "group border-b border-slate-100 transition-colors hover:bg-slate-50/50 cursor-pointer",
                      "data-[state=selected]:bg-slate-50"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const pinned = cell.column.getIsPinned();
                      const isAccessory = cell.column.id === "select" || cell.column.id === "actions";

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-3 text-sm truncate bg-white group-hover:bg-slate-50/50 transition-colors",
                            isAccessory ? "w-[1%] px-2 text-center" : "px-4",
                            pinned === "left" && "sticky left-0 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]",
                            pinned === "right" && "sticky right-0 z-20 shadow-[-1px_0_0_0_rgba(0,0,0,0.05)]",
                            "group-data-[state=selected]:bg-slate-50"
                          )}
                          style={{
                            left: pinned === "left" ? `${cell.column.getStart()}px` : undefined,
                            right: pinned === "right" ? `${cell.column.getAfter()}px` : undefined,
                          }}
                        >
                          <div className={cn(isAccessory && "flex justify-center")}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </TableCell>
                      );
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              // Empty State - Uses the remaining height of min-h-[400px]
              <TableRow>
                <TableCell colSpan={columns.length} className="h-87.5 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-2">
                      <Layers className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No records found</h3>
                    <p className="text-sm max-w-sm text-center text-slate-500">
                      We couldn't find any records matching your search. Try adjusting your filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Now naturally flows at the bottom of the table content */}
      <div className="flex-none p-2 border-t border-slate-200 bg-white z-10">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}