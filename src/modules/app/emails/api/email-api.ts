import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { covalentHubClient } from "@/services/clients/covalent.client";
import { showToastError, showToastSuccess } from "@/utils/show-toast-success";
import type {
  EmailLog,
  EmailLogListParams,
  EmailLogsResponse,
  SendEmailPayload,
} from "../types/email.types";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const emailKeys = {
  all: ["emails"] as const,
  lists: () => [...emailKeys.all, "list"] as const,
  list: (params: EmailLogListParams) => [...emailKeys.lists(), params] as const,
  detail: (id: string) => [...emailKeys.all, "detail", id] as const,
};

function unwrapResponse<T>(response: ApiResponse<T> | T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as ApiResponse<T>).data !== undefined
  ) {
    return (response as ApiResponse<T>).data as T;
  }

  return response as T;
}

export function useEmailLogsQuery(params: EmailLogListParams) {
  return useQuery({
    queryKey: emailKeys.list(params),
    queryFn: async (): Promise<EmailLogsResponse> => {
      const response = await covalentHubClient.get<
        ApiResponse<EmailLogsResponse>
      >("/emails", {
        params: {
          page: params.pageIndex + 1,
          limit: params.pageSize,
          status: params.status,
          recipientEmail: params.recipientEmail || undefined,
          relatedEntityType: params.relatedEntityType,
          relatedEntityId: params.relatedEntityId || undefined,
          fromDate: params.fromDate || undefined,
          toDate: params.toDate || undefined,
        },
      });

      return unwrapResponse(response.data);
    },
    placeholderData: (previous) => previous,
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendEmailPayload) => {
      const response = await covalentHubClient.post<ApiResponse<EmailLog>>(
        "/emails/send",
        payload,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
      showToastSuccess("Email queued", "The email was sent successfully.");
    },
    onError: (error: any) => {
      showToastError(
        "Email failed",
        error?.response?.data?.message || "Could not send this email.",
      );
    },
  });
}

export function useResendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailLogId: string) => {
      const response = await covalentHubClient.post<ApiResponse<EmailLog>>(
        `/emails/${emailLogId}/resend`,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
      showToastSuccess("Email resent", "The email was sent again.");
    },
    onError: (error: any) => {
      showToastError(
        "Resend failed",
        error?.response?.data?.message || "Could not resend this email.",
      );
    },
  });
}

