import { useMutation } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

interface ValidateTokenPayload {
  email: string;
  token: string;
}

export const useValidateToken = () => {
  return useMutation({
    mutationFn: async (payload: ValidateTokenPayload) => {
      // POST /api/Auth/validate-activation-token
      const response = await covalentHubClient.post("/auth-service/api/Auth/validate-activation-token", payload);
      return response.data;
    },
    // We don't need global toasts here because the UI will handle the success/error states directly
  });
};