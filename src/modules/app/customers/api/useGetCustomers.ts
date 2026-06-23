import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { Customer } from "@/types/customers";

export interface CustomersPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCustomersData {
  items: Customer[];
  pagination: CustomersPagination;
}

interface ListCustomersApiResponse {
  success: boolean;
  data: PaginatedCustomersData;
}

export type GetCustomersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  town?: string;
  phoneNumber?: string;
};

const getCustomers = async (
  params: GetCustomersParams,
): Promise<ListCustomersApiResponse> => {
  const response = await covalentHubClient.get<ListCustomersApiResponse>(
    "/customers",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search || undefined,
        town: params.town || undefined,
        phoneNumber: params.phoneNumber || undefined,
      },
    },
  );

  return response.data;
};

export const customersQueryKeys = {
  all: ["customers"] as const,
  list: (params: GetCustomersParams) =>
    [...customersQueryKeys.all, params] as const,
};

export const useGetCustomers = (params: GetCustomersParams) => {
  return useQuery({
    queryKey: customersQueryKeys.list(params),
    queryFn: () => getCustomers(params),
    placeholderData: (previousData) => previousData,
  });
};

export type CustomerDuplicateMatch = {
  id: string;
  customerName: string;
  phone: string | null;
  alternatePhone: string | null;
  address: string | null;
  town: string | null;
  matchType: "Exact Phone Match" | "Same Normalized Name" | "Similar Name";
  confidence: number;
};

export type CustomerDuplicateCheckResult = {
  hasExactMatch: boolean;
  hasPossibleMatches: boolean;
  matches: CustomerDuplicateMatch[];
};

type CustomerDuplicateCheckResponse = {
  success: boolean;
  data: CustomerDuplicateCheckResult;
};

export type CustomerDuplicateCheckParams = {
  name?: string;
  phone?: string;
  alternatePhone?: string;
};

export const checkCustomerDuplicate = async (
  params: CustomerDuplicateCheckParams,
  signal?: AbortSignal,
) => {
  const response = await covalentHubClient.get<CustomerDuplicateCheckResponse>(
    "/customers/duplicate-check",
    {
      params: {
        name: params.name?.trim() || undefined,
        phone: params.phone?.trim() || undefined,
        alternatePhone: params.alternatePhone?.trim() || undefined,
      },
      signal,
    },
  );

  return response.data.data;
};

export const useCustomerDuplicateCheck = (
  params: CustomerDuplicateCheckParams,
) => {
  const [debouncedParams, setDebouncedParams] =
    useState<CustomerDuplicateCheckParams>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams({
        name: params.name?.trim(),
        phone: params.phone?.trim(),
        alternatePhone: params.alternatePhone?.trim(),
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [params.alternatePhone, params.name, params.phone]);

  const currentParams = {
    name: params.name?.trim(),
    phone: params.phone?.trim(),
    alternatePhone: params.alternatePhone?.trim(),
  };
  const currentHasPhone = Boolean(
    currentParams.phone || currentParams.alternatePhone,
  );
  const currentShouldCheck =
    currentHasPhone ||
    Boolean(currentParams.name && currentParams.name.length >= 3);
  const currentKey = `${currentParams.name ?? ""}|${currentParams.phone ?? ""}|${currentParams.alternatePhone ?? ""}`;
  const debouncedKey = `${debouncedParams.name ?? ""}|${debouncedParams.phone ?? ""}|${debouncedParams.alternatePhone ?? ""}`;
  const isSettled = currentKey === debouncedKey;
  const hasPhone = Boolean(
    debouncedParams.phone || debouncedParams.alternatePhone,
  );
  const shouldCheck =
    hasPhone ||
    Boolean(debouncedParams.name && debouncedParams.name.length >= 3);

  const query = useQuery({
    queryKey: ["customers", "duplicate-check", debouncedParams],
    queryFn: ({ signal }) => checkCustomerDuplicate(debouncedParams, signal),
    enabled: shouldCheck,
    staleTime: 15_000,
  });

  const result = isSettled && currentShouldCheck ? query.data : undefined;

  return {
    isChecking:
      currentShouldCheck && (!isSettled || query.isLoading || query.isFetching),
    matches: result?.matches ?? [],
    hasExactMatch: result?.hasExactMatch ?? false,
    hasPossibleMatches: result?.hasPossibleMatches ?? false,
    error: isSettled && currentShouldCheck ? query.error : null,
  };
};
