export type WhatsAppMessageStatus =
  | "PENDING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "RECEIVED";

export type WhatsAppMessageType =
  | "ORDER_CREATED"
  | "ORDER_READY"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_REMINDER"
  | "GENERAL";

export type WhatsAppMessageDirection = "OUTBOUND" | "INBOUND";

export interface WhatsAppCustomer {
  id: string;
  fullName: string;
  phoneNumber: string;
  town?: string | null;
}

export interface WhatsAppOrder {
  id: string;
  orderNumber: string;
  status?: string | null;
}

export interface WhatsAppMessage {
  id: string;
  tenantId: string;

  customerId?: string | null;
  orderId?: string | null;
  groupOrderId?: string | null;
  paymentId?: string | null;

  phoneNumber: string;
  message: string;

  type: WhatsAppMessageType;
  direction: WhatsAppMessageDirection;
  status: WhatsAppMessageStatus;

  providerMessageId?: string | null;
  errorMessage?: string | null;

  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failedAt?: string | null;

  retryCount: number;

  createdAt: string;
  updatedAt: string;

  customer?: WhatsAppCustomer | null;
  order?: WhatsAppOrder | null;
}

export interface WhatsAppPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface WhatsAppMessagesResponse {
  items: WhatsAppMessage[];
  pagination: WhatsAppPagination;
}

export interface WhatsAppMessageListParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
  status?: WhatsAppMessageStatus;
  type?: WhatsAppMessageType;
  direction?: WhatsAppMessageDirection;
  dateFrom?: string;
  dateTo?: string;
}
