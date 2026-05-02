import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Employee,
  EmployeeListParams,
  EmployeePayload,
  EmployeesResponse,
} from "../types/employee.types";
import { covalentHubClient } from "@/services/clients/covalent.client";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: EmployeeListParams) =>
    [...employeeKeys.lists(), params] as const,
  detail: (id?: string) => [...employeeKeys.all, "detail", id] as const,
};

export function useEmployeesQuery(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: async (): Promise<EmployeesResponse> => {
      const response = await covalentHubClient.get("/api/v1/employees", {
        params: {
          page: params.pageIndex + 1,
          pageSize: params.pageSize,
          search: params.search || undefined,
          status: params.status,
          department: params.department,
        },
      });

      return response.data.data ?? response.data;
    },
  });
}

export function useEmployeeQuery(employeeId?: string) {
  return useQuery({
    queryKey: employeeKeys.detail(employeeId),
    enabled: Boolean(employeeId),
    queryFn: async (): Promise<Employee> => {
      const response = await covalentHubClient.get(`/api/v1/employees/${employeeId}`);
      return response.data.data ?? response.data;
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EmployeePayload) => {
      const response = await covalentHubClient.post("/api/v1/employees", payload);
      return response.data.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeId,
      payload,
    }: {
      employeeId: string;
      payload: EmployeePayload;
    }) => {
      const response = await covalentHubClient.patch(
        `/api/v1/employees/${employeeId}`,
        payload
      );

      return response.data.data ?? response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.employeeId),
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await covalentHubClient.delete(`/api/v1/employees/${employeeId}`);
      return response.data.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}