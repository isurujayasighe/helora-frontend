// @/components/auth/GlobalAccessGuard.tsx
"use client";

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

  return <>{children}</>;
}