// @/components/auth/GlobalAccessGuard.tsx
"use client";

import { Navigate } from "@tanstack/react-router";

import { useAuthStore } from "@/auth/store/authStore";
import { EnterpriseLottieLoader } from "@/components/common/IntialLoader";

export function GlobalAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useAuthStore((state) => state.status);

  if (status === "idle") {
    return <EnterpriseLottieLoader />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
