import { CalendarDays, Eye, Pencil, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Block } from "@/types/blocks";
import { cn } from "@/lib/utils";

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const statusClassName = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "INACTIVE":
      return "border-amber-100 bg-amber-50 text-amber-700";
    case "ARCHIVED":
      return "border-slate-100 bg-slate-50 text-slate-700";
    default:
      return "border-slate-100 bg-slate-50 text-slate-700";
  }
};

type BlocksTableProps = {
  blocks: Block[];
  onViewBlock: (blockId: string) => void;
  onEditBlock: (blockId: string) => void;
};

export function BlocksTable({
  blocks,
  onViewBlock,
  onEditBlock,
}: BlocksTableProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <UserRound className="h-10 w-10 text-slate-400" />
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No blocks found
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Try changing your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Block No</th>
              <th className="px-4 py-3 font-semibold">Created Date</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Last Used Date</th>
              <th className="px-4 py-3 font-semibold">Ready Made Size</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {blocks.map((block) => (
              <tr key={block.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {block.blockNumber}
                    </span>

                    {block.customerBlocks?.some((item) => item.isDefault) && (
                      <span
                        title="Default block"
                        className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100"
                      />
                    )}
                  </div>

                  {block.description && (
                    <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                      {block.description}
                    </p>
                  )}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    {formatDate(block.createdAt)}
                  </span>
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {block.category?.name || "-"}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {formatDate(block.lastUsedAt)}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {block.readyMadeSize || "-"}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold",
                      statusClassName(block.status)
                    )}
                  >
                    {block.status}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5"
                      onClick={() => onViewBlock(block.id)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => onEditBlock(block.id)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}