import axios from 'axios';
import { useAuthStore } from '../../auth/store/authStore';
import { appConfig } from '@/config/runtime-config';

// --- 1. Helper: Extract URL Context (Keep this logic) ---
export function getTenantInfo() {
  const hostname = window.location.hostname;
  const rootDomain = appConfig.ROOT_DOMAIN || 'localhost';

  if (hostname === rootDomain) {
    return { subdomain: null, environment: null };
  }

  let fullPrefix = hostname.replace(`.${rootDomain}`, '');
  if (fullPrefix === hostname) {
      fullPrefix = hostname.split('.')[0];
  }

  const parts = fullPrefix.split('-');
  let subdomain = parts[0];
  let environment = 'prod'; // Default

  if (parts.length > 1) {
    const possibleEnv = parts[parts.length - 1];
    if (['dev', 'qa', 'stage', 'uat', 'prod'].includes(possibleEnv)) {
        environment = possibleEnv;
        subdomain = parts.slice(0, -1).join('-');
    } else {
        subdomain = fullPrefix;
    }
  }

  return { subdomain, environment };
}

// --- 2. Create Axios Instance ---
const apiClient = axios.create({
  baseURL: appConfig.API_URL || '/api',
  withCredentials: true,
});

// --- 3. Request Interceptor (Inject Auth + Context) ---
apiClient.interceptors.request.use((config) => {
  // A. Get Store State
  const state = useAuthStore.getState();
  const token = state.accessToken;
  const activeCustomer = state.user;

  // B. Inject Access Token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // C. Inject URL Context (Subdomain & Env)
  const { subdomain, environment } = getTenantInfo();
  if (subdomain) {
    config.headers['X-Tenant-Prefix'] = subdomain; 
  }
  if (environment) {
    config.headers['X-Environment-Prefix'] = environment; 
  }

  // D. Inject Active Customer Context (The New Switcher Logic)
  // This tells the backend WHICH specific customer organization we are acting on behalf of.
  if (activeCustomer?.id) {
    config.headers['X-Tenant-ID'] = activeCustomer.id;
  }

  return config;
});

// --- 4. Response Interceptor (Silent Refresh) ---
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Only retry on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call Refresh Endpoint (Sends HttpOnly Cookie)
        const { data } = await axios.post(
          '/auth/refresh', 
          { withCredentials: true }
        );

        // 1. Update Store with new Token
        useAuthStore.getState().setAuth(data.accessToken);

        // 2. Update Header on the failed request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        // 3. Re-inject Headers (Just to be safe for the retry)
        const state = useAuthStore.getState();
        const { subdomain, environment } = getTenantInfo();
        
        if (subdomain) originalRequest.headers['X-Tenant-Prefix'] = subdomain;
        if (environment) originalRequest.headers['X-Environment-Prefix'] = environment;
        if (state.user?.id) originalRequest.headers['X-Tenant-ID'] = state.user.id;

        // 4. Retry
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed -> Logout user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;