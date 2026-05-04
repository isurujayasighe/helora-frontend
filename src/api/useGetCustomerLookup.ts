import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export type CustomerLookupItem = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  alternatePhone: string | null;
  town: string | null;
  hospitalName?: string | null;
  address?:string| null;
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
  params: CustomerLookupParams,
): Promise<CustomerLookupItem[]> => {
  const search = params.search?.trim();

  const response = await covalentHubClient.get<CustomerLookupResponse>(
    "/customers/lookup",
    {
      params: {
        search: search || undefined,
        limit: params.limit ?? 8,
      },
    },
  );

  return response.data.data ?? [];
};

export const customerLookupQueryKeys = {
  all: ["customer-lookup"] as const,
  list: (params: CustomerLookupParams) =>
    [
      ...customerLookupQueryKeys.all,
      {
        search: params.search?.trim() ?? "",
        limit: params.limit ?? 8,
      },
    ] as const,
};

export const useCustomerLookup = (params: CustomerLookupParams) => {
  const search = params.search?.trim() ?? "";
  const enabled = search.length >= 2;

  return useQuery({
    queryKey: customerLookupQueryKeys.list({
      search,
      limit: params.limit,
    }),
    queryFn: () =>
      lookupCustomers({
        search,
        limit: params.limit,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
};