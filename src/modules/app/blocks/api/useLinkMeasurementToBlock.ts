import { useMutation, useQueryClient } from "@tanstack/react-query";

import { measurementKeys } from "@/api/useGetLatestMeasurement";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { blockDetailsQueryKeys } from "./useGetBlockById";
import { blocksQueryKeys } from "./useGetBlocks";

type LinkMeasurementToBlockPayload = {
  measurementId: string;
  updateOrderItems?: boolean;
  makeDefaultForCustomer?: boolean;
};

type LinkMeasurementToBlockVariables = {
  blockId: string;
  payload: LinkMeasurementToBlockPayload;
};

type LinkMeasurementToBlockResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

async function linkMeasurementToBlock({
  blockId,
  payload,
}: LinkMeasurementToBlockVariables) {
  const response =
    await covalentHubClient.patch<LinkMeasurementToBlockResponse>(
      `/blocks/${blockId}/link-measurement`,
      payload,
    );

  return response.data;
}

export function useLinkMeasurementToBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkMeasurementToBlock,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: blocksQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: blockDetailsQueryKeys.detail(variables.blockId),
        }),
        queryClient.invalidateQueries({ queryKey: measurementKeys.all }),
      ]);
    },
  });
}
