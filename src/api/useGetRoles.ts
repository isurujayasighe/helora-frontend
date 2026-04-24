import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { AxiosError } from "axios";

/* ------------------------------------------------------------------ */
/* 1. Types & Constants                                               */
/* ------------------------------------------------------------------ */

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface RolesApiResponse {
  success: boolean;
  data: Role[]; // The actual array is here
  error: null | string;
}

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* 2. The Fetcher                                                     */
/* ------------------------------------------------------------------ */

export const getRoles = async (): Promise<Role[]> => {
  // Your interceptor returns response.data automatically
  const response = await covalentHubClient.get<RolesApiResponse>("/auth-service/api/TenantRoles");
  
  // Access the array from the RolesApiResponse object
  return response.data.data; 
};

/* ------------------------------------------------------------------ */
/* 3. The Hook                                                        */
/* ------------------------------------------------------------------ */

type UseGetRolesOptions<TData = Role[]> = {
  select?: (data: Role[]) => TData;
  // Use Omit to prevent the user from overriding the internal logic 
  // and ensure the Generic types align with TanStack Query's expectations
  config?: Omit<UseQueryOptions<Role[], AxiosError, TData>, 'queryKey' | 'queryFn' | 'select'>;
};

export const useGetRoles = <TData = Role[]>({ 
  select, 
  config 
}: UseGetRolesOptions<TData> = {}) => {
  // Explicitly map the generics: <SourceData, ErrorType, TransformedData>
  return useQuery<Role[], AxiosError, TData>({
    queryKey: roleKeys.lists(),
    queryFn: getRoles,
    
    select,
    
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
    
    ...config,
  });
};