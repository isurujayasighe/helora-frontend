import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  WhatsAppMessage,
  WhatsAppMessageListParams,
  WhatsAppMessagesResponse,
  WhatsAppMessageType,
} from "../types/whatsapp.types";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { useAuthStore } from "@/auth/store/authStore";

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string | null;
};

type WhatsAppAccount = {
  id: string;
  tenantId: string;
  businessName?: string | null;
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreateWhatsAppAccountPayload = {
  tenantId?: string;
  businessName?: string;
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId?: string;
  accessToken: string;
  webhookVerifyToken?: string;
  isActive?: boolean;
};

type SendWhatsAppResponse = {
  success: boolean;
  message: RawWhatsAppMessage;
  error?: string;
};

type BackendMessageType =
  | "TEXT"
  | "TEMPLATE"
  | "IMAGE"
  | "DOCUMENT"
  | "BUTTON"
  | "INTERACTIVE";

type RawWhatsAppMessage = {
  id: string;
  tenantId: string;
  customerId?: string | null;
  orderId?: string | null;
  groupOrderId?: string | null;
  paymentId?: string | null;
  direction: "OUTBOUND" | "INBOUND";
  messageType: BackendMessageType;
  status: WhatsAppMessage["status"];
  whatsappMessageId?: string | null;
  fromPhone?: string | null;
  toPhone: string;
  templateName?: string | null;
  languageCode?: string | null;
  body?: string | null;
  payload?: unknown;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendMessageListParams = WhatsAppMessageListParams & {
  tenantId?: string;
  customerId?: string;
  orderId?: string;
  paymentId?: string;
};

export const whatsappKeys = {
  all: ["whatsapp"] as const,
  account: (tenantId?: string) =>
    [...whatsappKeys.all, "account", tenantId] as const,
  messages: () => [...whatsappKeys.all, "messages"] as const,
  list: (params: BackendMessageListParams) =>
    [...whatsappKeys.messages(), params] as const,
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

function getCurrentTenantId() {
  return useAuthStore.getState().user?.tenantId;
}

function resolveTenantId(tenantId?: string) {
  return tenantId || getCurrentTenantId() || undefined;
}

function mapTemplateToUiType(
  templateName?: string | null,
  paymentId?: string | null,
): WhatsAppMessageType {
  if (templateName === "order_confirmation") return "ORDER_CREATED";
  if (templateName === "payment_received" || paymentId) {
    return "PAYMENT_RECEIVED";
  }

  return "GENERAL";
}

function getMessagePreview(message: RawWhatsAppMessage) {
  if (message.body) return message.body;
  if (message.templateName) return `Template: ${message.templateName}`;
  return `${message.messageType} WhatsApp message`;
}

function mapRawMessage(message: RawWhatsAppMessage): WhatsAppMessage {
  return {
    id: message.id,
    tenantId: message.tenantId,
    customerId: message.customerId,
    orderId: message.orderId,
    groupOrderId: message.groupOrderId,
    paymentId: message.paymentId,
    phoneNumber:
      message.direction === "OUTBOUND"
        ? message.toPhone
        : message.fromPhone || message.toPhone,
    message: getMessagePreview(message),
    type: mapTemplateToUiType(message.templateName, message.paymentId),
    direction: message.direction,
    status: message.status,
    providerMessageId: message.whatsappMessageId,
    errorMessage: message.failureReason,
    sentAt: message.sentAt,
    deliveredAt: message.deliveredAt,
    readAt: message.readAt,
    failedAt: message.failedAt,
    retryCount: 0,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

function matchesSearch(message: WhatsAppMessage, search?: string) {
  const term = search?.trim().toLowerCase();
  if (!term) return true;

  return [
    message.phoneNumber,
    message.message,
    message.customer?.fullName,
    message.order?.orderNumber,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(term));
}

function isInDateRange(
  message: WhatsAppMessage,
  dateFrom?: string,
  dateTo?: string,
) {
  const createdAt = new Date(message.createdAt).getTime();
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

  if (from !== null && createdAt < from) return false;
  if (to !== null && createdAt > to) return false;
  return true;
}

function filterAndPaginateMessages(
  messages: WhatsAppMessage[],
  params: BackendMessageListParams,
): WhatsAppMessagesResponse {
  const pageIndex = params.pageIndex ?? 0;
  const pageSize = params.pageSize ?? 10;

  const filtered = messages.filter((message) => {
    if (params.type && message.type !== params.type) return false;
    if (params.direction && message.direction !== params.direction) return false;
    if (!matchesSearch(message, params.search)) return false;
    if (!isInDateRange(message, params.dateFrom, params.dateTo)) return false;
    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = pageIndex + 1;
  const items = filtered.slice(pageIndex * pageSize, page * pageSize);

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function useWhatsAppAccountQuery(tenantId?: string) {
  const resolvedTenantId = resolveTenantId(tenantId);

  return useQuery({
    queryKey: whatsappKeys.account(resolvedTenantId),
    queryFn: async (): Promise<WhatsAppAccount | null> => {
      const response = await covalentHubClient.get<
        ApiResponse<WhatsAppAccount | null> | WhatsAppAccount | null
      >("/whatsapp/account");

      return unwrapResponse(response.data);
    },
  });
}

export function useCreateWhatsAppAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateWhatsAppAccountPayload,
    ): Promise<WhatsAppAccount> => {
      const response = await covalentHubClient.post<
        ApiResponse<WhatsAppAccount> | WhatsAppAccount
      >("/whatsapp/account", payload);

      return unwrapResponse(response.data);
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: whatsappKeys.account(resolveTenantId(payload.tenantId)),
      });
    },
  });
}

export function useWhatsAppMessagesQuery(params: BackendMessageListParams) {
  const tenantId = resolveTenantId(params.tenantId);

  return useQuery({
    queryKey: whatsappKeys.list({
      ...params,
      tenantId,
    }),
    queryFn: async (): Promise<WhatsAppMessagesResponse> => {
      const response = await covalentHubClient.get<
        ApiResponse<RawWhatsAppMessage[]> | RawWhatsAppMessage[]
      >("/whatsapp/messages", {
        params: {
          customerId: params.customerId || undefined,
          orderId: params.orderId || undefined,
          paymentId: params.paymentId || undefined,
          status: params.status || undefined,
        },
      });

      const rawMessages = unwrapResponse(response.data);
      return filterAndPaginateMessages(rawMessages.map(mapRawMessage), params);
    },
  });
}

export function useSendOrderConfirmationWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const response = await covalentHubClient.post<
        ApiResponse<SendWhatsAppResponse> | SendWhatsAppResponse
      >(`/whatsapp/orders/${orderId}/send-confirmation`);

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.messages() });
    },
  });
}

export function useSendPaymentReceiptWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId }: { paymentId: string }) => {
      const response = await covalentHubClient.post<
        ApiResponse<SendWhatsAppResponse> | SendWhatsAppResponse
      >(`/whatsapp/payments/${paymentId}/send-receipt`);

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.messages() });
    },
  });
}

export function useRetryWhatsAppMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: WhatsAppMessage) => {
      if (message.paymentId) {
        const response = await covalentHubClient.post<
          ApiResponse<SendWhatsAppResponse> | SendWhatsAppResponse
        >(`/whatsapp/payments/${message.paymentId}/send-receipt`);

        return unwrapResponse(response.data);
      }

      if (message.orderId) {
        const response = await covalentHubClient.post<
          ApiResponse<SendWhatsAppResponse> | SendWhatsAppResponse
        >(`/whatsapp/orders/${message.orderId}/send-confirmation`);

        return unwrapResponse(response.data);
      }

      throw new Error(
        "This WhatsApp message cannot be retried because it is not linked to an order or payment.",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.messages() });
    },
  });
}
