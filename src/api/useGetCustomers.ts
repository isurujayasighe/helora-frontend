import { covalentHubClient } from "@/services/clients/covalent.client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export interface Customer {
  customerId: string;
  name: string;
}

interface CustomerApiResponse {
  success: boolean;
  data: {
    personId: string;
    personName: string;
    customers: Customer[]; // The actual array is here
  };
  error: null | string;
}

// Query Key Factory
export const customerKeys = {
  all: ["customers"] as const,
  profile: () => [...customerKeys.all, "profile"] as const,
};

export const getCustomerList = async (): Promise<Customer[]> => {
  const response = await covalentHubClient.get<CustomerApiResponse>(
    "cp/profile-service/api/CustomerPersons/Get-Customer-List"
  );
  
  // Note: Your JSON uses 'data' while the Pages API used 'value'
  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch customer data");
  }

  return response.data.data.customers; // Return the actual array of customers
};

type UseGetCustomerProfileOptions<TData = Customer[]> = {
  select?: (data: Customer[]) => TData;
  config?: Omit<
    UseQueryOptions<Customer[], AxiosError, TData>,
    "queryKey" | "queryFn" | "select"
  >;
};

export const useGetCustomerProfile = <TData = Customer[]>({
  select,
  config,
}: UseGetCustomerProfileOptions<TData> = {}) => {
  return useQuery<Customer[], AxiosError, TData>({
    queryKey: customerKeys.profile(),
    queryFn: getCustomerList,

    select,

    // Enterprise defaults matching your pattern
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,

    ...config,
  });
};