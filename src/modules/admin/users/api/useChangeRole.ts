import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToastError, showToastSuccess } from "@/utils/show-toast-success";
import { covalentHubClient } from "@/services/clients/covalent.client";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface UpdateUserRoleVariables {
  userId: string;
  roleId: string; // The UI selects a single role, but API expects an array
}

interface UpdateRolePayload {
  roleIds: string[];
}

/* ------------------------------------------------------------------ */
/* API Function                                                       */
/* ------------------------------------------------------------------ */

async function updateUserRole({ userId, roleId }: UpdateUserRoleVariables) {
  const payload: UpdateRolePayload = {
    roleIds: [roleId], // Wrap single ID in array as per API requirement
  };

  const { data } = await covalentHubClient.patch(
    `/auth-service/api/Admin/Users/${userId}/role`,
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