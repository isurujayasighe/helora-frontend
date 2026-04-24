// import { useEffect } from "react";
// import { clearAuthUser, getAuthUser } from "./store/session";
// import { getAccessToken, getAccessTokenExpiresAt } from "./tokenStore";

// export function useSessionWatcher() {
//   useEffect(() => {
//     const expiresAt = getAccessTokenExpiresAt();
//     if (!expiresAt) return;

//     const timeout = expiresAt - Date.now();
//     if (timeout <= 0) {
//       clearAuthUser();
//       window.location.href = "/login";
//       return;
//     }

//     const timer = setTimeout(() => {
//       clearAuthUser();
//       window.location.href = "/login";
//     }, timeout);

//     return () => clearTimeout(timer);
//   }, []);
// }
