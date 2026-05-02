import { covalentHubClient } from "@/services/clients/covalent.client";
import { useQuery } from "@tanstack/react-query";
import type { User } from "./useUserDetails";

// Update this interface based on the JSON you provided
export interface UserDetailResponse {
  success: boolean;
  data: User;
  error: string | null;
}

export const useGetUserById = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;

      // 1. Interceptor strips the Axios 'data' wrapper
      const response = await covalentHubClient.get<UserDetailResponse>(`/auth-service/api/TenantUsers/${userId}`);

      // 2. We access the inner 'data' property where the user object lives
      // This matches the JSON structure: response.data
      return response.data.data; 
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Keeping it consistent with your other hooks
  });
};