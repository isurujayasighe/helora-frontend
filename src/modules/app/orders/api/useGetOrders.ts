import { useQuery } from "@tanstack/react-query";
import type { Order } from "@/types/orders";
import { covalentHubClient } from "@/services/clients/covalent.client";

export interface OrdersPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedOrdersData {
  items: Order[];
  pagination: OrdersPagination;
}

interface ListOrdersApiResponse {
  success: boolean;
  data: PaginatedOrdersData;
}

export type GetOrdersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  orderDate?: string;
  promisedDate?: string;
  promisedDateFrom?: string;
  promisedDateTo?: string;
  activeOnly?: boolean;
  sortBy?: "createdAt" | "orderDate" | "promisedDate";
  sortDirection?: "asc" | "desc";
  customerId?: string;
};

const getOrders = async (
  params: GetOrdersParams
): Promise<ListOrdersApiResponse> => {
  const response = await covalentHubClient.get<ListOrdersApiResponse>("/orders", {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      search: params.search || undefined,
      status: params.status || undefined,
      orderDate: params.orderDate || undefined,
      promisedDate: params.promisedDate || undefined,
      promisedDateFrom: params.promisedDateFrom || undefined,
      promisedDateTo: params.promisedDateTo || undefined,
      activeOnly: params.activeOnly || undefined,
      sortBy: params.sortBy || undefined,
      sortDirection: params.sortDirection || undefined,
      customerId: params.customerId || undefined,
    },
  });

  return response.data;
};

export const ordersQueryKeys = {
  all: ["orders"] as const,
  list: (params: GetOrdersParams) => [...ordersQueryKeys.all, params] as const,
};

export const useGetOrders = (params: GetOrdersParams) => {
  return useQuery({
    queryKey: ordersQueryKeys.list(params),
    queryFn: () => getOrders(params),
    placeholderData: (previousData) => previousData,
  });
};
