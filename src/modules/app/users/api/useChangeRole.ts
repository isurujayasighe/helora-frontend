import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToastError, showToastSuccess } from "@/utils/show-toast-success";
import { covalentHubClient } from "@/services/clients/covalent.client";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface UpdateUserRoleVariables {
  userId: string;
  tenantId: string;
  roleId: string;
}

interface UpdateRolePayload {
  roleId: string;
}

/* ------------------------------------------------------------------ */
/* API Function                                                       */
/* ------------------------------------------------------------------ */

async function updateUserRole({
  userId,
  tenantId,
  roleId,
}: UpdateUserRoleVariables) {
  const payload: UpdateRolePayload = {
    roleId,
  };

  const { data } = await covalentHubClient.patch(
    `/users/${userId}/access/${tenantId}`,
    payload
  );

  return data;
}

/* ------------------------------------------------------------------ */
/* React Hook                                                         */
/* ------------------------------------------------------------------ */

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRole,
    
    onSuccess: (_, variables) => {
      // 1. Invalidate specific user cache so the UI updates immediately
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      
      // 2. (Optional) Invalidate the main list if you show roles there
      queryClient.invalidateQueries({ queryKey: ["users"] });

      showToastSuccess("Role Updated", "User permissions have been successfully changed.");
    },
    
    onError: (error: any) => {
      console.error("Role update failed:", error);
      showToastError(
        "Update Failed", 
        error?.response?.data?.message || "Could not update user role. Please try again."
      );
    },
  });
}
