import type { AxiosError } from "axios";

type ApiErrorResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  errors?: unknown[];
  timestamp?: string;
  path?: string;
  requestId?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return (
    axiosError.response?.data?.message ||
    axiosError.message ||
    fallback
  );
}