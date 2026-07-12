import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { blocksQueryKeys } from "./useGetBlocks";
import { blockDetailsQueryKeys, type BlockDetails } from "./useGetBlockById";

type RemoveBlockCustomerVariables = {
  blockId: string;
  customerId: string;
};

type RemoveBlockCustomerApiResponse = {
  success: boolean;
  message?: string;
  data: BlockDetails;
};

const removeBlockCustomer = async ({
  blockId,
  customerId,
}: RemoveBlockCustomerVariables): Promise<RemoveBlockCustomerApiResponse> => {
  const response =
    await covalentHubClient.delete<RemoveBlockCustomerApiResponse>(
      `/blocks/${blockId}/customers/${customerId}`,
    );

  return response.data;
};

export const useRemoveBlockCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeBlockCustomer,
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
