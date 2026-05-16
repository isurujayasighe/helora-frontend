export function redirectToLogin() {
  if (typeof window === "undefined") return;

  const currentPath =
    window.location.pathname + window.location.search + window.location.hash;

  if (window.location.pathname === "/login") return;

  const loginUrl = new URL("/login", window.location.origin);

  if (currentPath && currentPath !== "/") {
    loginUrl.searchParams.set("returnUrl", currentPath);
  }

  window.location.assign(loginUrl.toString());
}
