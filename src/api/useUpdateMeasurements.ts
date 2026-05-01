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

export type UpdateMeasurementValuePayload = {
  fieldId: string;
  value: string | null;
  note?: string | null;
};

export type UpdateMeasurementPayload = {
  measurementId: string;
  verificationStatus?: MeasurementVerificationStatus;
  verificationNote?: string | null;
  notes?: string | null;
  values: UpdateMeasurementValuePayload[];
};

export function useUpdateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      measurementId,
      ...payload
    }: UpdateMeasurementPayload) => {
      const response = await covalentHubClient.patch<ApiResponse<Measurement>>(
        `/measurements/${measurementId}`,
        payload
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