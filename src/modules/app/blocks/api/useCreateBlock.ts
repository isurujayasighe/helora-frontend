import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { blocksQueryKeys } from "./useGetBlocks";
import type { Block } from "@/types/blocks";

export type CreateBlockCustomerPayload = {
  customerId: string;
  isDefault?: boolean;
};

export type CreateBlockPayload = {
  categoryId: string;
  blockNumber: string;
  readyMadeSize?: string;
  sizeLabel?: string;
  fitNotes?: string;
  versionNo?: number;
  previousBlockId?: string;
  description?: string;
  status?: string;
  remarks?: string;
  legacyId?: number;
  customers: CreateBlockCustomerPayload[];
};

type CreateBlockApiResponse = {
  success: boolean;
  message?: string;
  data: Block;
};

const createBlock = async (
  payload: CreateBlockPayload
): Promise<CreateBlockApiResponse> => {
  const response = await covalentHubClient.post<CreateBlockApiResponse>(
    "/blocks",
    payload
  );

  return response.data;
};

export const useCreateBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blocksQueryKeys.all,
      });
    },
  });
};