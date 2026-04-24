import { appConfig } from "@/config/runtime-config";
import axios from "axios";

// Create a separate instance for auth to avoid interceptor loops
const authService = axios.create({
  baseURL: appConfig.API_URL || '/api',
  headers: { "Content-Type": "application/json" },
});

export const refreshAccessToken = async () => {
  // Most production APIs expect the refresh token in an HttpOnly cookie
  // but if yours is in the body, add it here.
  const response = await authService.post("/auth/refresh");
  
  if (!response.data?.success) {
    throw new Error("Refresh failed");
  }

  return response.data.data.token;
};