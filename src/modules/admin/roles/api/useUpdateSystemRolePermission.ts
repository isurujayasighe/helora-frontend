import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateRolePermissionsPayload } from "../types/systemRolePermissionUpdate";
import { toast } from "sonner"; // Assuming you use Sonner or similar for toasts
import { covalentHubClient } from "@/services/clients/covalent.client";

/* ------------------------------------------------------------------ */
/* API Function                                                       */
/* ------------------------------------------------------------------ */

interface MutationParams {
  roleId: string;
  payload: UpdateRolePermissionsPayload;
}

async function updateSystemRolePermissions({ roleId, payload }: MutationParams) {
  const { data } = await covalentHubClient.put(
    `/SystemRolePagePermissions/roles/${roleId}/page-permissions`,
    payload
  );

  // Check for success flag if your API returns a standard envelope
  if (data.success === false) {
    throw new Error(data.error || "Failed to update permissions");
  }

  return data;
}

/* ------------------------------------------------------------------ */
/* React Query Hook                                                   */
/* ------------------------------------------------------------------ */

export function useUpdateSystemRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSystemRolePermissions,
    
    onSuccess: (_, variables) => {
      toast.success("Permissions updated successfully");

      // Invalidate the specific role's permission query so the UI refreshes
      queryClient.invalidateQueries({
        queryKey: ["system-role-permissions", variables.roleId],
      });
    },
    
    onError: (error: any) => {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to save changes. Please try again.");
    },
  });
}