import type { MutationConfig } from "@/services/clients/queryClient";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import apiClient from "@/services/clients/login.client";
import { useAuthStore, type AuthUser } from "@/auth/store/authStore";
import { showToastError } from "@/utils/show-toast-success";

interface LoginApiResponse {
  accessToken: string;
  user: AuthUser;
}

interface LoginPayload {
  email: string;
  password: string;
}

const postAuthLogin = async (
  payload: LoginPayload
): Promise<LoginApiResponse> => {
  const response = await apiClient.post<LoginApiResponse>("/auth/login", payload);
  return response.data;
};

export const useAuthLogin = (
  config: MutationConfig<LoginPayload, LoginApiResponse> = {}
) => {
  return useMutation({
    mutationFn: postAuthLogin,

    onError: (e: AxiosError<{ message?: string }>) => {
      const message =
        e.response?.data?.message ?? e.message ?? "Something went wrong";
      showToastError("Login Failed!", message);
    },

    onSuccess: (response) => {
    
      if (response.accessToken) {
        useAuthStore.getState().setAuth({
          accessToken: response.accessToken,
          user: response.user,
        });
      }
    },

    ...config,
  });
};