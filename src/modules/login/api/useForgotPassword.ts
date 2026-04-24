import { useMutation } from "@tanstack/react-query";
import { showToastError, showToastSuccess } from "@/utils/show-toast-success"; // Adjust path to your toast utils
import { covalentHubClient } from "@/services/clients/covalent.client";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface ForgotPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}

/* ------------------------------------------------------------------ */
/* API Function                                                       */
/* ------------------------------------------------------------------ */

async function forgotPasswordRequest(payload: ForgotPasswordPayload) {
  const { data } = await covalentHubClient.post(
    '/auth-service/api/Auth/forget-password', 
    payload
  );
  return data;
}

/* ------------------------------------------------------------------ */
/* React Hook                                                         */
/* ------------------------------------------------------------------ */

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: () => {
      showToastSuccess("Success", "Password has been set successfully.");
    },
    onError: (error: any) => {
      console.error("Password reset failed:", error);
      showToastError(
        "Error", 
        error?.response?.data?.message || "Failed to set password. Please try again."
      );
    },
  });
}