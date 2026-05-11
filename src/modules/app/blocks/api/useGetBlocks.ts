import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { Block } from "@/types/blocks";

export interface BlocksPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedBlocksData {
  items: Block[];
  pagination: BlocksPagination;
}

interface ListBlocksApiResponse {
  success: boolean;
  data: PaginatedBlocksData;
}

export type GetBlocksParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  customerId?: string;
  status?: string;
  includeCounts?: boolean;
  includeTotal?: boolean;
};

const getBlocks = async (
  params: GetBlocksParams
): Promise<ListBlocksApiResponse> => {
  const response = await covalentHubClient.get<ListBlocksApiResponse>(
    "/blocks",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search || undefined,
        categoryId: params.categoryId || undefined,
        customerId: params.customerId || undefined,
        status: params.status || undefined,
        includeCounts: params.includeCounts,
        includeTotal: params.includeTotal,
      },
    }
  );

  return response.data;
};

export const blocksQueryKeys = {
  all: ["blocks"] as const,
  list: (params: GetBlocksParams) => [...blocksQueryKeys.all, params] as const,
};

export const useGetBlocks = (params: GetBlocksParams) => {
  return useQuery({
    queryKey: blocksQueryKeys.list(params),
    queryFn: () => getBlocks(params),
    placeholderData: (previousData) => previousData,
  });
};
