import type { PaginatedResponse } from "@/types/api-response.types";

export interface RoleCount {
  memberships: number;
  rolePermissions: number;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: RoleCount;
}

export type RolesListResponse = PaginatedResponse<Role>;

export interface RoleListQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sortBy?: "createdAt" | "updatedAt" | "code" | "name";
  sortOrder?: "asc" | "desc";
}