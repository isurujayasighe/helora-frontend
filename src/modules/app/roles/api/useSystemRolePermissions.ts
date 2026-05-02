import { useQuery } from "@tanstack/react-query";
import type { SystemRolePermission, SystemRolePermissionsResponse } from "@/types/systemRolePermissions";
import { covalentHubClient } from "@/services/clients/covalent.client";

/* ------------------------------------------------------------------ */
/* Fetch Function                                                     */
/* ------------------------------------------------------------------ */

interface FetchParams {
  roleId?: string; // Optional: In case you need to filter by role later
}

async function fetchSystemRolePermissions({ roleId }: FetchParams = {}): Promise<SystemRolePermission[]> {
  // Construct query params if needed
  const params = new URLSearchParams();
  if (roleId) params.append("roleId", roleId);

  const { data } = await covalentHubClient.get<SystemRolePermissionsResponse>(
    `/RolePagePermissions`,
    { params }
  );

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch system role permissions");
  }

  return data.data;
}

/* ------------------------------------------------------------------ */
/* React Query Hook                                                   */
/* ------------------------------------------------------------------ */

export function useSystemRolePermissions(roleId?: string) {
  return useQuery({
    // Unique key: includes roleId so cache invalidates if role changes
    queryKey: ["system-role-permissions", roleId],
    
    queryFn: () => fetchSystemRolePermissions({ roleId }),
    
    // Config: Keep data fresh for a bit as permissions don't change often
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}