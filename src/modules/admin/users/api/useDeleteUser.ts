import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToastSuccess, showToastError } from "@/utils/show-toast-success"; // Assuming you have this helper
import { covalentHubClient } from "@/services/clients/covalent.client";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Endpoint: DELETE /api/Admin/Users/{id}
      const response = await covalentHubClient.delete(`/auth-service/api/Admin/Users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      showToastSuccess("User Deleted", "The user has been permanently removed.");
      // Refetch the users list to remove the deleted row
      queryClient.invalidateQueries({ queryKey: ["users"] }); 
    },
    onError: (error: any) => {
      showToastError(
        "Delete Failed",
        error.response?.data?.message || "Could not delete user. Please try again."
      );
    },
  });
};