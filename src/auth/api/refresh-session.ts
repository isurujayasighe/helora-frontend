import axios from "axios";

import { appConfig } from "@/config/runtime-config";
import { useAuthStore, type AuthUser } from "@/auth/store/authStore";

type RefreshResponse =
  | {
      accessToken?: string;
      expiresIn?: number;
      user?: AuthUser;
    }
  | {
      success?: boolean;
      data?: {
        accessToken?: string;
        expiresIn?: number;
        user?: AuthUser;
      };
    };

type RefreshPayload = {
  accessToken?: string;
  expiresIn?: number;
  user?: AuthUser;
};

export async function refreshSession() {
  const baseURL = appConfig.API_URL || "/api";
  const response = await axios.post<RefreshResponse>(
    `${baseURL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const responseBody = response.data;
  const payload: RefreshPayload =
    "data" in responseBody && responseBody.data
      ? responseBody.data
      : (responseBody as RefreshPayload);

  const accessToken = payload.accessToken;

  if (!accessToken) {
    throw new Error("Refresh response did not include an access token.");
  }

  const store = useAuthStore.getState();

  if (payload.user) {
    store.setAuth({
      accessToken,
      user: payload.user,
    });
  } else {
    store.setAccessToken(accessToken);
  }

  return {
    accessToken,
    user: payload.user,
    expiresIn: payload.expiresIn,
  };
}
