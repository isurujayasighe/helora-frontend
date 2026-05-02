import { covalentHubClient } from "@/services/clients/covalent.client"
import { queryClient, type MutationConfig } from "@/services/clients/queryClient"
import { showToastError, showToastSuccess } from "@/utils/show-toast-success"
import { useMutation } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { roleKeys } from "@/api/useGetRoles" // Importing the keys factory we made yesterday

interface Params {
    roleId: string
}

interface Response {
    success: boolean
    message?: string
}

export const useDeleteRole = (
    config: MutationConfig<Params, Response> = {}
) => {
    return useMutation({
        mutationFn: async ({ roleId }: Params) =>
            await deleteRole({ roleId }),
        onError: (e: AxiosError<{ message: string }>) => {
            const message =
                (e.response?.data?.message ?? e?.message) || "Failed to delete role";
            console.log(message);
            showToastError("Delete Role", message)
        },
        onSuccess: (data) => {
            console.log(data)
            showToastSuccess("Delete Role", "Role successfully deleted!")
            
            // Invalidate the specific query key we defined yesterday
            queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
        },
        ...config
    })
}

const deleteRole = async ({ roleId }: Params): Promise<Response> => {
    // Assuming the endpoint follows the standard REST pattern based on yesterday's POST
    const res = await covalentHubClient.delete(
        `/admin/Roles/${roleId}`
    )
    return res.data
}