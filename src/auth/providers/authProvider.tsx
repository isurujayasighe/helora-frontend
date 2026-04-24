import { useEffect, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { EnterpriseLottieLoader } from "@/components/common/IntialLoader";
import { appConfig } from "@/config/runtime-config";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || status !== "idle") return;

    initialized.current = true;

    const initAuth = async () => {
      try {
        const baseURL = appConfig.API_URL || "/api";

        const { data } = await axios.post(
          `${baseURL}/auth-service/api/Auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const token = data?.data?.token;

        if (token) {
          setAuth(token);
          return;
        }

        logout();
      } catch {
        logout();
      }
    };

    void initAuth();
  }, [status, setAuth, logout]);

  if (status === "idle") {
    return <EnterpriseLottieLoader/>;
  }

  return <>{children}</>;
}