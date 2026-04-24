import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { AxiosError } from "axios";

/* ------------------------------------------------------------------ */
/* 1. Types & Constants                                               */
/* ------------------------------------------------------------------ */

export interface Page {
  pageId: string;
  pageCode: string; // e.g., "ADMINDASHBOARD"
  pageName: string; // e.g., "Admin Dashboard"
  description: string;
  createdAt: string;
  updatedAt: string | null;
}

interface PagesApiResponse {
  isSuccess: boolean;
  value: Page[];
  error: null | string;
}

// Query Key Factory
export const pageKeys = {
  all: ["pages"] as const,
  lists: () => [...pageKeys.all, "list"] as const,
};


/* ... 1. Types & Constants remain the same ... */

/* ------------------------------------------------------------------ */
/* 2. The Fetcher                                                     */
/* ------------------------------------------------------------------ */

export const getPages = async (): Promise<Page[]> => {
  const response = await covalentHubClient.get<PagesApiResponse>("/auth-service/api/Pages/allowed");
  // Ensure we return the array, matching the Promise<Page[]> return type
  console.log("API Response for Pages:", response.data); // Debug log to verify API response structure
  return response.data.value;
};

/* ------------------------------------------------------------------ */
/* 3. The Hook                                                        */
/* ------------------------------------------------------------------ */

// We define TData but ensure the base data is always Page[]
type UseGetPagesOptions<TData = Page[]> = {
  select?: (data: Page[]) => TData;
  // Use a more standard TanStack type if QueryConfig causes issues
  config?: Omit<UseQueryOptions<Page[], AxiosError, TData>, 'queryKey' | 'queryFn' | 'select'>;
};

export const useGetPages = <TData = Page[]>({
  select,
  config,
}: UseGetPagesOptions<TData> = {}) => {
  // We explicitly pass generics to useQuery:
  // <TQueryFnData, TError, TData, TQueryKey>
  return useQuery<Page[], AxiosError, TData>({
    queryKey: pageKeys.lists(),
    queryFn: getPages,
    
    select,
    
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
    
    ...config,
  });
};