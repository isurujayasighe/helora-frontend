import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { EnterpriseLottieLoader } from "@/components/common/IntialLoader";
import { refreshSession } from "../api/refresh-session";

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
        const { accessToken, user } = await refreshSession();

        if (accessToken) {
          if (user) {
            setAuth({
              accessToken,
              user,
            });
          }
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
    return <EnterpriseLottieLoader />;
  }

  return <>{children}</>;
}
