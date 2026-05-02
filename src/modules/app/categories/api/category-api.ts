import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CategoriesResponse,
  Category,
  CategoryListParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";
import { covalentHubClient } from "@/services/clients/covalent.client";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params: CategoryListParams) => [...categoryKeys.lists(), params] as const,
  detail: (id?: string) => [...categoryKeys.all, "detail", id] as const,
};

export function useCategoriesQuery(params: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: async (): Promise<CategoriesResponse> => {
      const response = await covalentHubClient.get("/api/v1/categories", {
        params: {
          page: params.pageIndex + 1,
          pageSize: params.pageSize,
          search: params.search || undefined,
        },
      });

      return response.data.data ?? response.data;
    },
  });
}

export function useCategoryByIdQuery(categoryId?: string) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    enabled: Boolean(categoryId),
    queryFn: async (): Promise<Category> => {
      const response = await covalentHubClient.get(`/api/v1/categories/${categoryId}`);
      return response.data.data ?? response.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const response = await covalentHubClient.post("/api/v1/categories", payload);
      return response.data.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateCategoryPayload;
    }) => {
      const response = await covalentHubClient.patch(
        `/api/v1/categories/${categoryId}`,
        payload
      );

      return response.data.data ?? response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.categoryId),
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await covalentHubClient.delete(`/api/v1/categories/${categoryId}`);
      return response.data.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}