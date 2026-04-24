import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/auth/store/authStore";
import { appConfig } from "@/config/runtime-config";

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
      !originalRequest._retry
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
        const response = await axios.post(
          `${appConfig.API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.accessToken;
        useAuthStore.setState(response.data.accessToken,response.data.expiresIn);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return covalentHubClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // clearAccessToken();
        // dispatchLogout(); // optional
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
