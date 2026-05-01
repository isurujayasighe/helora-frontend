import { useAuthStore } from "@/auth/store/authStore";
import { appConfig } from "@/config/runtime-config";

const IDENTITY_BASE_URL =
  appConfig.IDENTITY_BASE_URL || "http://localhost:5174";

const PRODUCT_CODE =
  appConfig.PRODUCT_CODE || "customerportal";

function getTenantFromHost(hostname = window.location.hostname) {
  const parts = hostname.split(".");
  return parts.length > 1 ? parts[0] : undefined;
}

function buildIdentityLogoutUrl() {
  const tenant = getTenantFromHost();
  const returnUrl = window.location.origin + "/";

  const url = new URL(`${IDENTITY_BASE_URL}/logout`);

  if (tenant) {
    url.searchParams.set("tenant", tenant);
  }

  url.searchParams.set("product", PRODUCT_CODE);
  url.searchParams.set("returnUrl", returnUrl);

  return url.toString();
}

export function logout() {
  useAuthStore.getState().logout();
  window.location.replace(buildIdentityLogoutUrl());
}