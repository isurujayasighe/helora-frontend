import { useMutation, useQueryClient } from "@tanstack/react-query";

import { covalentHubClient } from "@/services/clients/covalent.client";

import { customerDetailsQueryKeys } from "./useGetCustomerbyId";
import { customersQueryKeys } from "./useGetCustomers";

export type UpdateCustomerPayload = {
  fullName?: string;
  phoneNumber?: string;
  alternatePhone?: string;
  town?: string;
  address?: string;
  notes?: string;
};

type UpdateCustomerApiResponse = {
  success: boolean;
  message?: string;
  data: unknown;
};

const updateCustomer = async ({
  customerId,
  payload,
}: {
  customerId: string;
  payload: UpdateCustomerPayload;
}): Promise<UpdateCustomerApiResponse> => {
  const response = await covalentHubClient.patch<UpdateCustomerApiResponse>(
    `/customers/${customerId}`,
    payload,
  );

  return response.data;
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: customerDetailsQueryKeys.detail(variables.customerId),
      });
    },
  });
};
