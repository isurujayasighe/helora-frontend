import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  WhatsAppMessage,
  WhatsAppMessageListParams,
  WhatsAppMessagesResponse,
} from "../types/whatsapp.types";
import { covalentHubClient } from "@/services/clients/covalent.client";

export const whatsappKeys = {
  all: ["whatsapp-messages"] as const,
  lists: () => [...whatsappKeys.all, "list"] as const,
  list: (params: WhatsAppMessageListParams) =>
    [...whatsappKeys.lists(), params] as const,
  detail: (id?: string) => [...whatsappKeys.all, "detail", id] as const,
};

export function useWhatsAppMessagesQuery(params: WhatsAppMessageListParams) {
  return useQuery({
    queryKey: whatsappKeys.list(params),
    queryFn: async (): Promise<WhatsAppMessagesResponse> => {
      const response = await covalentHubClient.get("/api/v1/whatsapp/messages", {
        params: {
          page: params.pageIndex + 1,
          pageSize: params.pageSize,
          search: params.search || undefined,
          status: params.status || undefined,
          type: params.type || undefined,
          direction: params.direction || undefined,
          dateFrom: params.dateFrom || undefined,
          dateTo: params.dateTo || undefined,
        },
      });

      return response.data.data ?? response.data;
    },
  });
}

export function useWhatsAppMessageByIdQuery(messageId?: string) {
  return useQuery({
    queryKey: whatsappKeys.detail(messageId),
    enabled: Boolean(messageId),
    queryFn: async (): Promise<WhatsAppMessage> => {
      const response = await covalentHubClient.get(
        `/api/v1/whatsapp/messages/${messageId}`
      );

      return response.data.data ?? response.data;
    },
  });
}

export function useRetryWhatsAppMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await covalentHubClient.post(
        `/api/v1/whatsapp/messages/${messageId}/retry`
      );

      return response.data.data ?? response.data;
    },
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.detail(messageId),
      });
    },
  });
}