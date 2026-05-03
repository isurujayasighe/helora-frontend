import { queryOptions, useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

/* ------------------------------------------------------------------ */
/* 1. Types                                                           */
/* ------------------------------------------------------------------ */

export type PermissionAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "MANAGE";

export interface RolePermissionMatrixRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface PagePermissionItem {
  pagePermissionId: string;
  permissionId: string;
  resource: string;
  action: PermissionAction;
  description: string | null;
}

export interface RolePermissionMatrixPage {
  id: string;
  code: string;
  title: string;
  description: string | null;
  routePath: string;
  icon: string | null;
  type: "MAIN" | "SETTINGS" | "ADMIN" | "REPORT";
  sortOrder: number;
  parentId: string | null;
  isActive: boolean;
  isVisible: boolean;

  permissions: PagePermissionItem[];

  /**
   * All available actions for this page.
   */
  actions: PermissionAction[];

  /**
   * Actions currently assigned to selected role.
   */
  assignedActions: PermissionAction[];

  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export interface RolePermissionMatrix {
  role: RolePermissionMatrixRole;
  actions: PermissionAction[];
  pages: RolePermissionMatrixPage[];
}

export interface RolePermissionMatrixApiResponse {
  success: boolean;
  data: RolePermissionMatrix;
  error?: string | null;
  message?: string;
}

/* ------------------------------------------------------------------ */
/* 2. Query Keys                                                      */
/* ------------------------------------------------------------------ */

export const permissionKeys = {
  all: ["permissions"] as const,
  matrices: () => [...permissionKeys.all, "matrix"] as const,
  matrixByRole: (roleId: string) =>
    [...permissionKeys.matrices(), "role", roleId] as const,
};

/* ------------------------------------------------------------------ */
/* 3. Fetcher                                                         */
/* ------------------------------------------------------------------ */

export async function getRolePermissionMatrix(
  roleId: string
): Promise<RolePermissionMatrix> {
  const response = await covalentHubClient.get<RolePermissionMatrixApiResponse>(
    `/permissions/roles/${roleId}/matrix`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch role permission matrix"
    );
  }

  return response.data.data;
}

/* ------------------------------------------------------------------ */
/* 4. Query Options                                                   */
/* ------------------------------------------------------------------ */

export const rolePermissionMatrixQueryOptions = (roleId?: string) =>
  queryOptions({
    queryKey: roleId
      ? permissionKeys.matrixByRole(roleId)
      : [...permissionKeys.matrices(), "empty"],
    queryFn: () => getRolePermissionMatrix(roleId!),
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

/* ------------------------------------------------------------------ */
/* 5. Hook                                                            */
/* ------------------------------------------------------------------ */

export function useRolePermissionMatrix(roleId?: string) {
  return useQuery(rolePermissionMatrixQueryOptions(roleId));
}