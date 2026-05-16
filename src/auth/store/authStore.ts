// @/auth/store/authStore.ts
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

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
        status: "idle",
        accessToken: null,
        user: null,

        setAuth: ({ accessToken, user }) => {
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
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<AuthState> | undefined;

          return {
            ...currentState,
            accessToken: persisted?.accessToken ?? null,
            user: persisted?.user ?? null,
            status: "idle",
          };
        },
      }
    ),
    { name: "AuthStore" }
  )
);
