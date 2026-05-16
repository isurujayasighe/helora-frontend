import { useQuery } from "@tanstack/react-query";
import type { Order } from "@/types/orders";
import { covalentHubClient } from "@/services/clients/covalent.client";

interface GetOrderByIdApiResponse {
  success: boolean;
  data: Order;
}

const getOrderById = async (
  orderId: string,
): Promise<GetOrderByIdApiResponse> => {
  const response = await covalentHubClient.get<GetOrderByIdApiResponse>(
    `/orders/${orderId}`,
  );

  return response.data;
};

export const orderDetailQueryKeys = {
  all: ["orders", "detail"] as const,
  detail: (orderId?: string | null) =>
    [...orderDetailQueryKeys.all, orderId] as const,
};

export const useGetOrderById = (orderId?: string | null) => {
  return useQuery({
    queryKey: orderDetailQueryKeys.detail(orderId),
    queryFn: () => getOrderById(orderId as string),
    enabled: Boolean(orderId),
  });
};
