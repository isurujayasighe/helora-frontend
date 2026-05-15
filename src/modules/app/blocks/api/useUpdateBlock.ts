import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { Block } from "@/types/blocks";
import { blocksQueryKeys } from "./useGetBlocks";
import { blockDetailsQueryKeys } from "./useGetBlockById";

export type UpdateBlockCustomerPayload = {
  customerId: string;
  measurementId?: string;
  isDefault?: boolean;
};

export type UpdateBlockPayload = {
  categoryId?: string;
  blockNumber?: string;
  readyMadeSize?: string;
  sizeLabel?: string;
  fitNotes?: string;
  versionNo?: number;
  previousBlockId?: string;
  description?: string;
  status?: string;
  remarks?: string;
  legacyId?: number;
  customers?: UpdateBlockCustomerPayload[];
};

type UpdateBlockVariables = {
  blockId: string;
  payload: UpdateBlockPayload;
};

type UpdateBlockApiResponse = {
  success: boolean;
  message?: string;
  data: Block;
};

const updateBlock = async ({
  blockId,
  payload,
}: UpdateBlockVariables): Promise<UpdateBlockApiResponse> => {
  const response = await covalentHubClient.patch<UpdateBlockApiResponse>(
    `/blocks/${blockId}`,
    payload
  );

  return response.data;
};

export const useUpdateBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBlock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: blocksQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: blockDetailsQueryKeys.detail(variables.blockId),
      });
    },
  });
};
