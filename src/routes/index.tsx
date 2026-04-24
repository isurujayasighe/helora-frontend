import { useAuthStore } from "@/auth/store/authStore";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { status } = useAuthStore.getState();

    if (status === "authenticated") {
      throw redirect({
        to: "/app/dashboard",
        replace: true,
      });
    }

    if (status === "unauthenticated") {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }

    return;
  },
  component: () => null,
});