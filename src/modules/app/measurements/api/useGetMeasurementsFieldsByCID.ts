import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { covalentHubClient } from "@/services/clients/covalent.client";
import type { MeasurementInputType } from "../types/measurement-fields-types";

export interface MeasurementFieldListParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  inputType?: MeasurementInputType;
  isActive?: boolean;
}

export interface MeasurementField {
  id: string;
  tenantId: string;
  categoryId: string;
  code: string;
  label: string;
  inputType: MeasurementInputType;
  unit: string | null;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  helpText: string | null;
  options: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementFieldsResponse {
  data: MeasurementField[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export const measurementFieldKeys = {
  all: ["measurement-fields"] as const,
  lists: () => [...measurementFieldKeys.all, "list"] as const,
  list: (params: MeasurementFieldListParams) =>
    [
      ...measurementFieldKeys.lists(),
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? "",
        categoryId: params.categoryId ?? "",
        inputType: params.inputType ?? "",
        isActive: params.isActive,
      },
    ] as const,
};

export function useMeasurementFieldsQuery(
  params: MeasurementFieldListParams,
  options?: Omit<
    UseQueryOptions<
      MeasurementFieldsResponse,
      AxiosError,
      MeasurementFieldsResponse,
      ReturnType<typeof measurementFieldKeys.list>
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: measurementFieldKeys.list(params),
    queryFn: async (): Promise<MeasurementFieldsResponse> => {
      const response = await covalentHubClient.get("/measurement-fields", {
        params: {
          page: params.pageIndex + 1,
          pageSize: params.pageSize,
          search: params.search || undefined,
          categoryId: params.categoryId || undefined,
          inputType: params.inputType || undefined,
          isActive: params.isActive,
        },
      });

      const payload = response.data?.data ?? response.data;

      if (Array.isArray(payload)) {
        return {
          data: payload,
        };
      }

      return payload.items;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}
