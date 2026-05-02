import type { PaginatedResponse } from "@/types/api-response.types";

export type PageType = "MAIN" | "SETTINGS" | "ADMIN" | "REPORT";

export type PermissionAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "MANAGE";

export interface PagePermission {
  id: string;
  resource: string;
  action: PermissionAction;
  description: string | null;
}

export interface PageCount {
  children: number;
  pagePermissions: number;
}

export interface Page {
  id: string;
  code: string;
  title: string;
  description: string | null;
  routePath: string;
  icon: string | null;
  type: PageType;
  sortOrder: number;
  parentId: string | null;
  isActive: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: PageCount;
  permissions?: PagePermission[];
}

export type PagesListResponse = PaginatedResponse<Page>;

export interface PageListQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  type?: PageType;
  parentId?: string;
  isActive?: boolean;
  isVisible?: boolean;
  sortBy?: "sortOrder" | "title" | "code" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}