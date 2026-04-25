import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { Customer } from "@/types/customers";

export interface CustomersPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCustomersData {
  items: Customer[];
  pagination: CustomersPagination;
}

interface ListCustomersApiResponse {
  success: boolean;
  data: PaginatedCustomersData;
}

export type GetCustomersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  town?: string;
  phoneNumber?: string;
};

const getCustomers = async (
  params: GetCustomersParams
): Promise<ListCustomersApiResponse> => {
  const response = await covalentHubClient.get<ListCustomersApiResponse>(
    "/customers",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search || undefined,
        town: params.town || undefined,
        phoneNumber: params.phoneNumber || undefined,
      },
    }
  );

  return response.data;
};

export const customersQueryKeys = {
  all: ["customers"] as const,
  list: (params: GetCustomersParams) =>
    [...customersQueryKeys.all, params] as const,
};

export const useGetCustomers = (params: GetCustomersParams) => {
  return useQuery({
    queryKey: customersQueryKeys.list(params),
    queryFn: () => getCustomers(params),
    placeholderData: (previousData) => previousData,
  });
};