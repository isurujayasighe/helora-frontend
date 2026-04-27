import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { groupOrdersQueryKeys } from "./useGetGroupOrders";
import type { GroupOrder, GroupOrderStatus } from "../types/group-orders.types";

export type CreateGroupOrderPayload = {
  groupOrderNumber?: string;
  title?: string;
  coordinatorCustomerId?: string;
  hospitalName?: string;
  town?: string;
  contactName?: string;
  contactPhone?: string;
  deliveryAddress?: string;
  deliveryTown?: string;
  status?: GroupOrderStatus;
  expectedDeliveryDate?: string;
  notes?: string;
};

type CreateGroupOrderResponse = {
  success: boolean;
  message?: string;
  data: GroupOrder;
};

const cleanPayload = (payload: CreateGroupOrderPayload) => {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  ) as CreateGroupOrderPayload;
};

const createGroupOrder = async (payload: CreateGroupOrderPayload) => {
  const response = await covalentHubClient.post<CreateGroupOrderResponse>(
    "/group-orders",
    cleanPayload(payload)
  );

  return response.data;
};

export const useCreateGroupOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupOrdersQueryKeys.all,
      });
    },
  });
};