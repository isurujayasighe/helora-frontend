import { useMutation } from "@tanstack/react-query";
import { showToastSuccess, showToastError } from "@/utils/show-toast-success";
import { covalentHubClient } from "@/services/clients/covalent.client";

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      // Endpoint: POST /api/Auth/change-password
      const response = await covalentHubClient.post("/auth-service/api/Auth/change-password", payload);
      return response.data;
    },
    onSuccess: () => {
      showToastSuccess("Password Updated", "Your password has been changed successfully.");
    },
    onError: (error: any) => {
      showToastError(
        "Update Failed",
        error.response?.data?.message || "Incorrect current password or server error."
      );
    },
  });
};