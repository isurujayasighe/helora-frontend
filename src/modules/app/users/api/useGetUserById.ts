import { covalentHubClient } from "@/services/clients/covalent.client";
import { useQuery } from "@tanstack/react-query";
import { normalizeUser, type User } from "./useUserDetails";

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

      const response = await covalentHubClient.get<UserDetailResponse>(
        `/users/${userId}`
      );

      return normalizeUser(response.data.data);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Keeping it consistent with your other hooks
  });
};
