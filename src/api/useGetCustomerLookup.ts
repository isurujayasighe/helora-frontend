import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export type CustomerLookupItem = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  alternatePhone: string | null;
  town: string | null;
  hospitalName?: string | null;
};

type CustomerLookupResponse = {
  success: boolean;
  data: CustomerLookupItem[];
};

export type CustomerLookupParams = {
  search?: string;
  limit?: number;
};

const lookupCustomers = async (
  params: CustomerLookupParams
): Promise<CustomerLookupResponse> => {
  const response = await covalentHubClient.get<CustomerLookupResponse>(
    "/customers/lookup",
    {
      params: {
        search: params.search || undefined,
        limit: params.limit ?? 8,
      },
    }
  );

  return response.data;
};

export const customerLookupQueryKeys = {
  all: ["customer-lookup"] as const,
  list: (params: CustomerLookupParams) =>
    [...customerLookupQueryKeys.all, params] as const,
};

export const useCustomerLookup = (params: CustomerLookupParams) => {
  const enabled = Boolean(params.search && params.search.trim().length >= 2);

  return useQuery({
    queryKey: customerLookupQueryKeys.list(params),
    queryFn: () => lookupCustomers(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};