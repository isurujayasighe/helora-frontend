import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import {
  permissionKeys,
  type PermissionAction,
} from "./useSystemRolePermissionById";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface UpdateRolePagePermissionAssignment {
  /**
   * Preferred field because backend DTO supports pageId.
   * Use this from the matrix API page.id.
   */
  pageId: string;

  /**
   * Optional fallback. Not required when pageId is provided.
   */
  pageCode?: string;

  actions: PermissionAction[];
}

export interface UpdateRolePermissionMatrixPayload {
  assignments: UpdateRolePagePermissionAssignment[];
}

interface UpdateRolePermissionMatrixApiResponse {
  success: boolean;
  data?: unknown;
  error?: string | null;
  message?: string;
}

/* ------------------------------------------------------------------ */
/* Fetcher                                                            */
/* ------------------------------------------------------------------ */

export async function updateRolePermissionMatrix({
  roleId,
  payload,
}: {
  roleId: string;
  payload: UpdateRolePermissionMatrixPayload;
}) {
  const response =
    await covalentHubClient.put<UpdateRolePermissionMatrixApiResponse>(
      `/permissions/roles/${roleId}/matrix`,
      payload
    );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update role permission matrix"
    );
  }

  return response.data.data;
}

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export function useUpdateSystemRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRolePermissionMatrix,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.matrixByRole(variables.roleId),
      });

      queryClient.invalidateQueries({
        queryKey: permissionKeys.all,
      });
    },
  });
}