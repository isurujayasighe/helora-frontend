import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { showToastError, showToastSuccess } from "@/utils/show-toast-success";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CreateUserPayload {
  firstName?: string;
  lastName?: string;
  email: string;
  roleId: string;
  status?: "ACTIVE" | "INVITED" | "DISABLED";
  isActiveAccess?: boolean;
}

// Optional: Define response shape if needed, otherwise 'any' or 'void' works
interface CreateUserResponse {
  success: boolean;
  data: {
    userId: string;
    // ... other fields
  };
}

/* ------------------------------------------------------------------ */
/* API Logic                                                          */
/* ------------------------------------------------------------------ */

async function createUser(payload: CreateUserPayload) {
  const response = await covalentHubClient.post<CreateUserResponse>(
    "/users",
    payload
  );
  return response.data;
}

/* ------------------------------------------------------------------ */
/* React Query Hook                                                   */
/* ------------------------------------------------------------------ */

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    
    onSuccess: () => {
      // 1. Show Success Message
      showToastSuccess("User created successfully");

      // 2. Refresh the User List automatically
      // This matches the queryKey you used in 'useUsersQuery'
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    
    onError: (error: any) => {
      // Handle error (e.g., email already exists)
      const code = error?.response?.data?.error?.code || "Error";
      const message = error?.response?.data?.error?.message || "Failed to create user";
      showToastError(code,message)
    },
  });
}
