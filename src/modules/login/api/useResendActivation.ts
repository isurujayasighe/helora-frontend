import { useMutation } from "@tanstack/react-query";
import { showToastSuccess, showToastError } from "@/utils/show-toast-success";
import { covalentHubClient } from "@/services/clients/covalent.client";

// Define an interface for the request body
interface ResendActivationRequest {
  email: string;
  url: string;
}

export const useResendActivation = () => {
  return useMutation({
    // 1. Change mutationFn to accept the Request Object
    mutationFn: async ({ email, url }: ResendActivationRequest) => {
      // Endpoint: POST /auth-service/api/Auth/resend-activation-link
      // Passing the object directly as the request body
      const response = await covalentHubClient.post(
        "/auth-service/api/Auth/resend-activation-link", 
        { email, url }
      );
      return response.data;
    },
    
    onSuccess: () => {
      showToastSuccess("Link Sent", "A fresh activation link has been sent to your email.");
    },
    
    onError: (error: any) => {
      // Improved error message extraction
      const message = error.response?.data?.error || 
                      error.response?.data?.message || 
                      "Could not resend link. Please try again.";
                      
      showToastError("Request Failed", message);
    },
  });
};