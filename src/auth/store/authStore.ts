// @/auth/store/authStore.ts
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import apiClient from "@/services/clients/login.client";

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: AuthUser | null;

  setAuth: (payload: { accessToken: string; user: AuthUser }) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
}

const STORAGE_KEY = "helora-auth-storage";

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        status: "unauthenticated",
        accessToken: null,
        user: null,

        setAuth: ({ accessToken, user }) => {
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

          set(
            {
              status: "authenticated",
              accessToken,
              user,
            },
            false,
            "auth/setAuth"
          );
        },

        setAccessToken: (accessToken) => {
          apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;

          set(
            {
              status: "authenticated",
              accessToken,
            },
            false,
            "auth/setAccessToken"
          );
        },

        logout: () => {
          delete apiClient.defaults.headers.common["Authorization"];

          set(
            {
              status: "unauthenticated",
              accessToken: null,
              user: null,
            },
            false,
            "auth/logout"
          );

          sessionStorage.removeItem(STORAGE_KEY);
        },
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          accessToken: state.accessToken,
          user: state.user,
          status: state.status,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.accessToken) {
            apiClient.defaults.headers.common["Authorization"] =
              `Bearer ${state.accessToken}`;
          }
        },
      }
    ),
    { name: "AuthStore" }
  )
);
