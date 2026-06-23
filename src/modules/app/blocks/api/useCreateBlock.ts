// src/modules/app/blocks/api/useCreateBlock.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { getApiErrorMessage } from "@/errors/api-error-response";

export type BlockStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type CreateBlockCustomerPayload = {
  customerId: string;
  measurementId?: string;
  isDefault: boolean;
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
  status: BlockStatus;
  remarks?: string;
  legacyId?: number;
  customers: CreateBlockCustomerPayload[];
};

type CreateBlockResponse = {
  success: boolean;
  message: string;
  data: unknown;
};

const createBlock = async (
  payload: CreateBlockPayload,
): Promise<CreateBlockResponse> => {
  const response = await covalentHubClient.post<CreateBlockResponse>(
    "/blocks",
    payload,
  );

  return response.data;
};

export const blockKeys = {
  all: ["blocks"] as const,
  lists: () => [...blockKeys.all, "list"] as const,
  details: () => [...blockKeys.all, "detail"] as const,
  detail: (id: string) => [...blockKeys.details(), id] as const,
};

export const useCreateBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlock,
    onSuccess: async (response) => {
      toast.success(response.message || "Block created successfully");

      await queryClient.invalidateQueries({
        queryKey: blockKeys.all,
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Unable to create block. Please try again."),
      );
    },
  });
};
