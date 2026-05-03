import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateMeasurementFieldPayload,
  MeasurementField,
  MeasurementFieldListParams,
  UpdateMeasurementFieldPayload,
} from "../types/measurement-fields-types";
import { covalentHubClient } from "@/services/clients/covalent.client";

export const measurementFieldKeys = {
  all: ["measurement-fields"] as const,
  lists: () => [...measurementFieldKeys.all, "list"] as const,
  list: (params: MeasurementFieldListParams) =>
    [...measurementFieldKeys.lists(), params] as const,
  detail: (id?: string) => [...measurementFieldKeys.all, "detail", id] as const,
};

export function useMeasurementFieldByIdQuery(fieldId?: string) {
  return useQuery({
    queryKey: measurementFieldKeys.detail(fieldId),
    enabled: Boolean(fieldId),
    queryFn: async (): Promise<MeasurementField> => {
      const response = await covalentHubClient.get(
        `/measurement-fields/${fieldId}`
      );

      return response.data.data ?? response.data;
    },
  });
}

export function useCreateMeasurementField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMeasurementFieldPayload) => {
      const response = await covalentHubClient.post(
        "/measurement-fields",
        payload
      );

      return response.data.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: measurementFieldKeys.lists(),
      });
    },
  });
}

export function useUpdateMeasurementField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fieldId,
      payload,
    }: {
      fieldId: string;
      payload: UpdateMeasurementFieldPayload;
    }) => {
      const response = await covalentHubClient.patch(
        `/measurement-fields/${fieldId}`,
        payload
      );

      return response.data.data ?? response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: measurementFieldKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: measurementFieldKeys.detail(variables.fieldId),
      });
    },
  });
}

export function useDeleteMeasurementField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await covalentHubClient.delete(
        `/measurement-fields/${fieldId}`
      );

      return response.data.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: measurementFieldKeys.lists(),
      });
    },
  });
}