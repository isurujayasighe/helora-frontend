import { useMutation } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export type CustomerLookupItem = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  alternatePhone: string | null;
  town: string | null;
};

type CustomerLookupApiResponse = {
  success: boolean;
  data: CustomerLookupItem[];
};

export type CustomerLookupParams = {
  search: string;
  limit?: number;
};

const lookupCustomers = async (
  params: CustomerLookupParams
): Promise<CustomerLookupApiResponse> => {
  const response = await covalentHubClient.get<CustomerLookupApiResponse>(
    "/customers/lookup",
    {
      params: {
        search: params.search.trim(),
        limit: params.limit ?? 10,
      },
    }
  );

  return response.data;
};

export const useCustomerLookup = () => {
  return useMutation({
    mutationFn: lookupCustomers,
  });
};