import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import apiClient from "@/services/clients/login.client";
import { useAuthStore, type AuthUser } from "@/auth/store/authStore";
import { showToastError } from "@/utils/show-toast-success";

interface LoginData {
  accessToken: string;
  user: AuthUser;
}

interface LoginApiResponse {
  success?: boolean;
  message?: string;
  data?: LoginData;
  accessToken?: string;
  user?: AuthUser;
}

interface LoginPayload {
  email: string;
  password: string;
}

const postAuthLogin = async (
  payload: LoginPayload
): Promise<LoginData> => {
  const response = await apiClient.post<LoginApiResponse>(
    "/auth/login",
    payload
  );

  const responseBody = response.data;
  const loginData = responseBody.data ?? responseBody;

  if (!loginData.accessToken || !loginData.user) {
    throw new Error("Login response did not include an access token.");
  }

  return {
    accessToken: loginData.accessToken,
    user: loginData.user,
  };
};

export const useAuthLogin = (
) => {
  return useMutation({
    mutationFn: postAuthLogin,

    onError: (e: AxiosError<{ message?: string }>) => {
      const message =
        e.response?.data?.message ?? e.message ?? "Something went wrong";

      showToastError("Login Failed!", message);
    },

    onSuccess: (response) => {
      if (response.accessToken && response.user) {
        useAuthStore.getState().setAuth({
          accessToken: response.accessToken,
          user: response.user,
        });
      }
    },
  });
};
