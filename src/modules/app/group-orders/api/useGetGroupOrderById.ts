import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { GroupOrder } from "../types/group-orders.types";

export type GroupOrderDetailOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalQty: number;
  totalAmount: string | number;
  advanceAmount: string | number;
  balanceAmount: string | number;
  orderDate: string;
  promisedDate: string | null;
  customer?: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    town: string | null;
  };
  items?: Array<{
    id: string;
    itemDescription: string;
    quantity: number;
    unitPrice: string | number;
    lineTotal: string | number;
    status: string;
    category?: {
      id: string;
      name: string;
    };
  }>;
};

export type GroupOrderDetails = GroupOrder & {
  orders?: GroupOrderDetailOrder[];
  payments?: unknown[];
};

type GetGroupOrderByIdResponse = {
  success: boolean;
  data: GroupOrderDetails;
};

const getGroupOrderById = async (
  groupOrderId: string
): Promise<GetGroupOrderByIdResponse> => {
  const response = await covalentHubClient.get<GetGroupOrderByIdResponse>(
    `/group-orders/${groupOrderId}`
  );

  return response.data;
};

export const groupOrderDetailsQueryKeys = {
  all: ["group-order-details"] as const,
  detail: (groupOrderId: string) =>
    [...groupOrderDetailsQueryKeys.all, groupOrderId] as const,
};

export const useGetGroupOrderById = (groupOrderId: string) => {
  return useQuery({
    queryKey: groupOrderDetailsQueryKeys.detail(groupOrderId),
    queryFn: () => getGroupOrderById(groupOrderId),
    enabled: Boolean(groupOrderId),
  });
};