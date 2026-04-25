import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { Customer } from "@/types/customers";
import { customersQueryKeys } from "./useGetCustomers";

export type CreateCustomerPayload = {
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  town?: string;
  address?: string;
  notes?: string;
};

type CreateCustomerApiResponse = {
  success: boolean;
  message?: string;
  data: Customer;
};

const createCustomer = async (
  payload: CreateCustomerPayload
): Promise<CreateCustomerApiResponse> => {
  const response = await covalentHubClient.post<CreateCustomerApiResponse>(
    "/customers",
    payload
  );

  return response.data;
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.all,
      });
    },
  });
};