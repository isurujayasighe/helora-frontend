import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export type BlockLookupCustomer = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  town: string | null;
};

export type BlockLookupItem = {
  id: string;
  blockNumber: string;
  readyMadeSize: string | null;
  sizeLabel: string | null;
  status: string;
  category: {
    id: string;
    name: string;
  } | null;
  customerBlocks: Array<{
    isDefault: boolean;
    customer: BlockLookupCustomer;
  }>;
  _count: {
    customerBlocks: number;
    measurements: number;
    orderItems: number;
  };
};

type BlockLookupResponse = {
  success: boolean;
  data: BlockLookupItem[];
};

export type BlockLookupParams = {
  search?: string;
  limit?: number;
};

const lookupBlocks = async (
  params: BlockLookupParams,
): Promise<BlockLookupItem[]> => {
  const search = params.search?.trim();

  const response = await covalentHubClient.get<BlockLookupResponse>(
    "/blocks/lookup/search",
    {
      params: {
        search: search || undefined,
        limit: params.limit ?? 8,
      },
    },
  );

  return response.data.data ?? [];
};

export const blockLookupQueryKeys = {
  all: ["block-lookup"] as const,
  list: (params: BlockLookupParams) =>
    [
      ...blockLookupQueryKeys.all,
      {
        search: params.search?.trim() ?? "",
        limit: params.limit ?? 8,
      },
    ] as const,
};

export const useBlockLookup = (params: BlockLookupParams) => {
  const search = params.search?.trim() ?? "";

  return useQuery({
    queryKey: blockLookupQueryKeys.list({
      search,
      limit: params.limit,
    }),
    queryFn: () =>
      lookupBlocks({
        search,
        limit: params.limit,
      }),
    enabled: search.length >= 2,
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
};
