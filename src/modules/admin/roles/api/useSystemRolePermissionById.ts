
import type { Permission, PermissionApiResponse } from "../types/tenantPermission";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export const permissionKeys = {
  all: ["permissions"] as const,
  byRole: (roleId: string) => [...permissionKeys.all, "role", roleId] as const,
};

export async function getPermissionsByRole(roleId: string): Promise<Permission[]> {
  // Use a specific timeout or controller if needed for long requests
  const response = await covalentHubClient.get<PermissionApiResponse>(
    `/auth-service/api/RolePagePermissions/${roleId}`
  );

  console.log("Raw API Response for Permissions by Role ID",roleId);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch permissions");
  }

  // According to your JSON, the array is directly in 'data'

  console.log("API Response for Permissions by Role ID", roleId, response);
  return response.data.data;
}

export const rolePermissionQueryOptions = (roleId?: string) => 
  queryOptions({
    queryKey: roleId ? permissionKeys.byRole(roleId) : [],
    queryFn: () => getPermissionsByRole(roleId!),
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,                 // Retry twice on failure before showing error
  });

export function useSystemRolePermissions(roleId?: string) {
  return useQuery(rolePermissionQueryOptions(roleId));
}