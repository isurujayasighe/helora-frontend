export type EmailStatus = "PENDING" | "SENT" | "FAILED";

export type EmailProvider = "AWS_SES";

export type EmailRelatedEntityType =
  | "ORDER"
  | "PAYMENT"
  | "CUSTOMER"
  | "USER"
  | "GROUP_ORDER"
  | "OTHER";

export interface EmailLog {
  id: string;
  tenantId: string;
  recipientEmail: string;
  cc: string[];
  bcc: string[];
  subject: string;
  templateKey?: string | null;
  status: EmailStatus;
  provider: EmailProvider;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  payload?: unknown;
  relatedEntityType?: EmailRelatedEntityType | null;
  relatedEntityId?: string | null;
  sentAt?: string | null;
  failedAt?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EmailLogsResponse {
  items: EmailLog[];
  pagination: EmailPagination;
}

export interface EmailLogListParams {
  pageIndex: number;
  pageSize: number;
  status?: EmailStatus;
  recipientEmail?: string;
  relatedEntityType?: EmailRelatedEntityType;
  relatedEntityId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SendEmailPayload {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  templateKey?: string;
  relatedEntityType?: EmailRelatedEntityType;
  relatedEntityId?: string;
}

