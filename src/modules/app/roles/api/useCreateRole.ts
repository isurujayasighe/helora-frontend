import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { toast } from "sonner";  // Importing the keys factory from your existing hook

interface CreateRolePayload {
  roleName: string;
  description?: string;
}

function buildRoleCode(roleName: string) {
  return roleName.trim().toUpperCase().replace(/\s+/g, "_");
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      const roleName = payload.roleName.trim();

      const response = await covalentHubClient.post("/roles", {
        code: buildRoleCode(roleName),
        name: roleName,
        description: payload.description?.trim() || undefined,
      });
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
