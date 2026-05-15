import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { blocksQueryKeys } from "./useGetBlocks";
import { blockDetailsQueryKeys, type BlockDetails } from "./useGetBlockById";

export type UpdateBlockCustomerAssignmentPayload = {
  customerId: string;
  measurementId?: string;
  isDefault?: boolean;
};

type UpdateBlockCustomersPayload = {
  customers: UpdateBlockCustomerAssignmentPayload[];
};

type UpdateBlockCustomersVariables = {
  blockId: string;
  payload: UpdateBlockCustomersPayload;
};

type UpdateBlockCustomersApiResponse = {
  success: boolean;
  message?: string;
  data: BlockDetails;
};

const updateBlockCustomers = async ({
  blockId,
  payload,
}: UpdateBlockCustomersVariables): Promise<UpdateBlockCustomersApiResponse> => {
  const response =
    await covalentHubClient.patch<UpdateBlockCustomersApiResponse>(
      `/blocks/${blockId}/customers`,
      payload,
    );

  return response.data;
};

export const useUpdateBlockCustomers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBlockCustomers,
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
