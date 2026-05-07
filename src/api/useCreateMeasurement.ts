import { covalentHubClient } from "@/services/clients/covalent.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  measurementKeys,
  type Measurement,
  type MeasurementVerificationStatus,
} from "@/api/useGetLatestMeasurement";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CreateMeasurementValuePayload = {
  fieldId: string;
  value?: string;
  numericValue?: number;
  note?: string;
};

export type CreateMeasurementPayload = {
  customerId: string;
  blockId?: string;
  categoryId: string;
  verificationStatus?: MeasurementVerificationStatus;
  verificationNote?: string;
  previousMeasurementId?: string;
  versionNo?: number;
  notes?: string;
  values: CreateMeasurementValuePayload[];
};

function cleanCreateMeasurementPayload(payload: CreateMeasurementPayload) {
  return {
    ...payload,
    blockId: payload.blockId?.trim() || undefined,
    previousMeasurementId: payload.previousMeasurementId?.trim() || undefined,
  };
}

export function useCreateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMeasurementPayload) => {
      const response = await covalentHubClient.post<ApiResponse<Measurement>>(
        "/measurements",
        cleanCreateMeasurementPayload(payload),
      );

      return response.data.data;
    },

    onSuccess: async (measurement) => {
      await queryClient.invalidateQueries({
        queryKey: measurementKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: measurementKeys.latest({
          customerId: measurement.customerId,
          blockId: measurement.blockId ?? undefined,
          categoryId: measurement.categoryId,
        }),
      });
    },
  });
}
