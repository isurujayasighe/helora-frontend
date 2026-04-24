import { useMutation } from "@tanstack/react-query";
import { showToastSuccess, showToastError } from "@/utils/show-toast-success";
import { useNavigate } from "@tanstack/react-router";
import { covalentHubClient } from "@/services/clients/covalent.client";

interface ActivatePayload {
  token: string;
  email: string;
  password: string;
}

export const useActivateAccount = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: ActivatePayload) => {
      // Adjust endpoint to match your backend (e.g. /Auth/activate or /Users/setup-password)
      const response = await covalentHubClient.post("/auth-service/api/Auth/validate-activation-token", payload);
      return response.data;
    },
    onSuccess: () => {
      showToastSuccess("Account Activated", "Your password has been set. Please login.");
      // Redirect to login page
      navigate({ to: "/login" });
    },
    onError: (error: any) => {
      showToastError(
        "Activation Failed", 
        error.response?.data?.message || "Link may be expired or invalid."
      );
    },
  });
};