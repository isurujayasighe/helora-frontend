import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/auth/store/authStore";
import { appConfig } from "@/config/runtime-config";
import { refreshSession } from "@/auth/api/refresh-session";
import { redirectToLogin } from "@/auth/redirect-to-login";

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
};

console.log("API URL:", appConfig.API_URL);

export const covalentHubClient = axios.create({
   baseURL: appConfig.API_URL || '/api',
  withCredentials: true, // IMPORTANT for refresh cookie
});

export const authClient = axios.create({
  baseURL: appConfig.API_URL || '/api',
  withCredentials: false, 
});

covalentHubClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


covalentHubClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url ?? "").includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        // Queue requests while refresh is happening
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(covalentHubClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await refreshSession();

        processQueue(null, accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return covalentHubClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
