import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type {
  GroupOrderStatus,
  PaginatedGroupOrdersData,
} from "../types/group-orders.types";

type ListGroupOrdersApiResponse = {
  success: boolean;
  data: PaginatedGroupOrdersData;
};

export type GetGroupOrdersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: GroupOrderStatus | "";
  coordinatorCustomerId?: string;
  fromDate?: string;
  toDate?: string;
};

const getGroupOrders = async (
  params: GetGroupOrdersParams
): Promise<ListGroupOrdersApiResponse> => {
  const response = await covalentHubClient.get<ListGroupOrdersApiResponse>(
    "/group-orders",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search || undefined,
        status: params.status || undefined,
        coordinatorCustomerId: params.coordinatorCustomerId || undefined,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined,
      },
    }
  );

  return response.data;
};

export const groupOrdersQueryKeys = {
  all: ["group-orders"] as const,
  list: (params: GetGroupOrdersParams) =>
    [...groupOrdersQueryKeys.all, "list", params] as const,
};

export const useGetGroupOrders = (params: GetGroupOrdersParams) => {
  return useQuery({
    queryKey: groupOrdersQueryKeys.list(params),
    queryFn: () => getGroupOrders(params),
    placeholderData: (previousData) => previousData,
  });
};