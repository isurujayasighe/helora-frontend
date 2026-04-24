import { authClient } from '@/services/clients/covalent.client';
import { queryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Pure API call for Tenant Context.
 * Separated from React so it can be used in scripts, tests, or hooks.
 */
export const getTenantContext = async (prefix: string, environment: string) => {
  try {
    const response = await authClient.get(
      `auth-service/api/admin/Tenant/${prefix}/Context/${environment}`
    );

    // Handle the specific error structure from your JSON
    if (!response.data?.success) {
      const errorMessage = response.data?.error?.message || 'An unexpected error occurred.';
      const errorCode = response.data?.error?.code || 'Unknown.Error';
      
      // We throw a custom object to make it easier to handle in the hook
      throw { message: errorMessage, code: errorCode, isApiError: true };
    }

    return response.data.data;
  } catch (error: any) {
    if (error.isApiError) throw error; // Re-throw our custom error

    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.error?.message || "Network Communication Error",
        code: error.response?.data?.error?.code || "Connection.Fail",
        status: error.response?.status
      };
    }
    
    throw { message: "An unknown system error occurred.", code: "Fatal.Error" };
  }
};

export const tenantQueryOptions = (prefix: string, environment: string) =>
  queryOptions({
    queryKey: ['tenant', prefix, environment],
    queryFn: () => getTenantContext(prefix, environment),
    staleTime: Infinity, // Context doesn't change during session
    gcTime: 1000 * 60 * 60, // Keep in memory for 1 hour
    retry: (failureCount, error: any) => {
      // Don't retry if the server explicitly said it's a "Server.Error" 
      // as that usually implies a code/config issue, not a network glitch.
      if (error.code === 'Server.Error' || error.status === 404) return false;
      return failureCount < 2;
    }
  });

/**
 * Custom hook for use within React Components
 */
export function useTenant(prefix: string, environment: string) {
  return useQuery(tenantQueryOptions(prefix, environment));
}