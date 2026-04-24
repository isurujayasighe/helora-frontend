import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/auth/store/authStore";
import { AuthenticatedApp } from "@/components/layout/AuthenticatedApp";
import { GlobalAccessGuard } from "@/auth/components/GlobalAccessGuard";

const IDENTITY_BASE_URL =
  import.meta.env.VITE_IDENTITY_BASE_URL || "http://localhost:5174";

const PRODUCT_CODE =
  import.meta.env.VITE_PRODUCT_CODE || "customerportal";

function getTenantFromHost(hostname = window.location.hostname) {
  const parts = hostname.split(".");
  return parts.length > 1 ? parts[0] : undefined;
}

function buildIdentityLoginUrl(returnUrl: string) {
  const tenant = getTenantFromHost();
  const url = new URL(`${IDENTITY_BASE_URL}/login`);

  if (tenant) {
    url.searchParams.set("tenant", tenant);
  }

  url.searchParams.set("product", PRODUCT_CODE);
  url.searchParams.set("returnUrl", returnUrl);

  return url.toString();
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const { status } = useAuthStore.getState();

    if (status === "authenticated") {
      return;
    }

    if (status === "unauthenticated") {
      const fullReturnUrl = new URL(
        location.href,
        window.location.origin
      ).toString();

      throw redirect({
        href: buildIdentityLoginUrl(fullReturnUrl),
      });
    }

    return;
  },

  component: () => (
    <GlobalAccessGuard>
      <AuthenticatedApp />
    </GlobalAccessGuard>
  ),
});