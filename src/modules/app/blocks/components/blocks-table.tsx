import {
  Box,
  Eye,
  MoreVertical,
  Pencil,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      return "bg-teal-100 text-teal-700";
    case "INACTIVE":
      return "bg-slate-200 text-slate-600";
    case "ARCHIVED":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
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
      <div className="flex min-h-80 flex-col items-center justify-center bg-white p-8 text-center">
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
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-210 table-fixed text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="w-[22%] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                Block No
              </th>
              <th className="w-[15%] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                Created Date
              </th>
              <th className="w-[14%] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                Category
              </th>
              <th className="w-[17%] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                Last Used
              </th>
              <th className="w-[10%] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                Size
              </th>
              <th className="w-[12%] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                Status
              </th>
              <th className="w-[10%] px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {blocks.map((block) => (
              <tr key={block.id} className="h-14 hover:bg-slate-50/70">
                <td className="px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-slate-300">
                      <Box className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <button
                        type="button"
                        className="block max-w-full truncate text-sm font-black text-slate-950 underline-offset-4 hover:text-primary hover:underline"
                        onClick={() => onViewBlock(block.id)}
                      >
                        {block.blockNumber}
                      </button>

                      <p className="mt-0.5 max-w-48 truncate text-xs font-medium text-slate-500">
                        {block.description || block.fitNotes || "Reusable block"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3 text-sm font-medium text-slate-700">
                  {formatDate(block.createdAt)}
                </td>

                <td className="px-5 py-3">
                  <span className="inline-flex max-w-full rounded-sm bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
                    <span className="truncate">{block.category?.name || "-"}</span>
                  </span>
                </td>

                <td className="px-5 py-3 text-sm font-medium text-slate-700">
                  {formatDate(block.lastUsedAt)}
                </td>

                <td className="px-5 py-3 text-sm font-black text-slate-950">
                  {block.readyMadeSize || block.sizeLabel || "-"}
                </td>

                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase leading-none",
                      statusClassName(block.status)
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {block.status?.toLowerCase()}
                  </span>
                </td>

                <td className="px-5 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 rounded-md text-slate-500 hover:text-slate-900"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onViewBlock(block.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onEditBlock(block.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit block items
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
