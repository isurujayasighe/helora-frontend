import { useQuery } from "@tanstack/react-query";

import { covalentHubClient } from "@/services/clients/covalent.client";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type BlockLinkCandidateCustomerLink = {
  customerId: string;
  measurementId: string | null;
  isDefault: boolean;
  assignedAt: string;
  measurementNumber: string | null;
  verificationStatus: string | null;
  measurementVersionNo: number | null;
};

export type BlockLinkCandidate = {
  id: string;
  blockNumber: string;
  readyMadeSize: string | null;
  sizeLabel: string | null;
  fitNotes: string | null;
  versionNo: number;
  description: string | null;
  status: string;
  lastUsedAt: string | null;
  remarks: string | null;
  createdAt: string;
  categoryId: string;
  categoryName: string;
  customerLinks: BlockLinkCandidateCustomerLink[];
  counts: {
    measurements: number;
    orderItems: number;
    customerBlocks: number;
  };
};

export type BlockLinkCandidatesParams = {
  search?: string;
  customerId?: string;
  categoryId?: string;
  onlyUnlinked?: boolean;
  enabled?: boolean;
};

export const blockLinkCandidateKeys = {
  all: ["blocks", "link-candidates"] as const,
  list: (params: BlockLinkCandidatesParams) =>
    [
      ...blockLinkCandidateKeys.all,
      {
        search: params.search?.trim() ?? "",
        customerId: params.customerId ?? "",
        categoryId: params.categoryId ?? "",
        onlyUnlinked: params.onlyUnlinked ?? true,
      },
    ] as const,
};

const getBlockLinkCandidates = async ({
  search,
  customerId,
  categoryId,
  onlyUnlinked = true,
}: BlockLinkCandidatesParams): Promise<BlockLinkCandidate[]> => {
  const response = await covalentHubClient.get<
    ApiResponse<BlockLinkCandidate[]>
  >("/blocks/link-candidates", {
    params: {
      search: search?.trim() || undefined,
      customerId,
      categoryId,
      onlyUnlinked: String(onlyUnlinked),
    },
  });

  return response.data.data ?? [];
};

export const useGetBlockLinkCandidates = ({
  enabled = true,
  ...params
}: BlockLinkCandidatesParams) => {
  return useQuery({
    queryKey: blockLinkCandidateKeys.list(params),
    queryFn: () => getBlockLinkCandidates(params),
    enabled: enabled && Boolean(params.customerId && params.categoryId),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
};
