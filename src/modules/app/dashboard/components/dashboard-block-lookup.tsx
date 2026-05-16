"use client";

import * as React from "react";
import {
  ArrowRight,
  Boxes,
  Loader2,
  Search,
  Shirt,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useBlockLookup,
  type BlockLookupItem,
} from "@/modules/app/blocks/api/useBlockLookup";

function getCustomerSummary(block: BlockLookupItem) {
  const primaryCustomer = block.customerBlocks[0]?.customer;

  if (!primaryCustomer) {
    return "No customers assigned";
  }

  const extraCount = Math.max((block._count.customerBlocks ?? 0) - 1, 0);

  return extraCount
    ? `${primaryCustomer.fullName} +${extraCount} more`
    : primaryCustomer.fullName;
}

function getBlockMeta(block: BlockLookupItem) {
  return [
    block.category?.name,
    block.sizeLabel,
    block.readyMadeSize,
  ].filter(Boolean);
}

export function DashboardBlockLookupCard() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [selectedBlock, setSelectedBlock] =
    React.useState<BlockLookupItem | null>(null);

  const trimmedSearch = search.trim();

  const { data: blocks = [], isLoading: isBlocksLoading } = useBlockLookup({
    search: trimmedSearch,
    limit: 20,
  });

  const showBlockList = trimmedSearch.length > 0 && !selectedBlock;

  const handleClear = () => {
    setSearch("");
    setSelectedBlock(null);
  };

  const handleSelectBlock = (block: BlockLookupItem) => {
    setSelectedBlock(block);
    setSearch(block.blockNumber);
  };

  const handleOpenBlock = () => {
    if (!selectedBlock) return;

    navigate({
      to: "/app/blocks",
      search: {
        viewBlockId: selectedBlock.id,
      },
    });
  };

  return (
    <Card className="relative z-20 overflow-visible rounded-lg border-border bg-white">
      <CardContent className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px] sm:items-end">
          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Find Block
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Search by block number, category, customer, or size.
                </p>
              </div>

              {selectedBlock && (
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                  Block Selected
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={selectedBlock ? selectedBlock.blockNumber : search}
                onChange={(event) => {
                  setSelectedBlock(null);
                  setSearch(event.target.value);
                }}
                placeholder="Search block number, category or customer..."
                className={cn(
                  "h-12 w-full rounded-lg bg-white pl-11 pr-11 text-base font-semibold text-slate-900",
                  "placeholder:text-sm placeholder:font-medium placeholder:text-slate-400",
                )}
              />

              {(search || selectedBlock) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear block search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {showBlockList && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg border border-border bg-white shadow-xl">
                  {isBlocksLoading ? (
                    <div className="flex items-center gap-3 px-4 py-4 text-sm font-medium text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching blocks...
                    </div>
                  ) : blocks.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                        <Boxes className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-800">
                        No blocks found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try block number, category, customer name, or phone.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto p-2">
                      {blocks.map((block) => {
                        const meta = getBlockMeta(block);

                        return (
                          <button
                            key={block.id}
                            type="button"
                            onClick={() => handleSelectBlock(block)}
                            className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white shadow-sm">
                              <Shirt className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {block.blockNumber}
                                </p>
                                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                  {block.status}
                                </span>
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                                {meta.length > 0 && (
                                  <span className="inline-flex items-center gap-1 truncate">
                                    <Boxes className="h-3 w-3" />
                                    {meta.join(" / ")}
                                  </span>
                                )}

                                <span className="inline-flex items-center gap-1 truncate">
                                  <UserRound className="h-3 w-3" />
                                  {getCustomerSummary(block)}
                                </span>
                              </div>
                            </div>

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm ring-1 ring-slate-100 transition group-hover:text-slate-700">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            type="button"
            className={cn(
              "h-12 w-full rounded-lg px-6 text-sm font-semibold shadow-sm",
              "disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100",
            )}
            disabled={!selectedBlock}
            onClick={handleOpenBlock}
          >
            View Block
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
