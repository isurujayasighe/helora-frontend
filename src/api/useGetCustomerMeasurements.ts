import { useQuery } from "@tanstack/react-query";
import { measurementKeys, type Measurement } from "./useGetLatestMeasurement";
import { covalentHubClient } from "@/services/clients/covalent.client";

type PaginatedResponse<T> = {
  items?: T[];
  data?: T[];
  totalItems?: number;
  totalPages?: number;
  page?: number;
  pageSize?: number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type UseGetCustomerMeasurementsParams = {
  customerId?: string;
  enabled?: boolean;
};

export function useGetCustomerMeasurements({
  customerId,
  enabled = true,
}: UseGetCustomerMeasurementsParams) {
  return useQuery({
    queryKey: measurementKeys.customerList(customerId),
    queryFn: async () => {
      const response = await covalentHubClient.get<
        ApiResponse<PaginatedResponse<Measurement> | Measurement[]>
      >("/measurements", {
        params: {
          customerId,
          page: 1,
          pageSize: 50,
        },
      });

      const payload = response.data.data;

      if (Array.isArray(payload)) {
        return payload;
      }

      return payload.items ?? payload.data ?? [];
    },
    enabled: enabled && Boolean(customerId),
  });
}