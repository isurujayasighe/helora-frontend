import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { toast } from "sonner";  // Importing the keys factory from your existing hook

interface CreateRolePayload {
  roleName: string;
  description?: string;
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      // POST /admin/Role
      const response = await covalentHubClient.post("/roles", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role created successfully");
      // Invalidate the 'lists' key so the table updates automatically
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create role");
    },
  });
}