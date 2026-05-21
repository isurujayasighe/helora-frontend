import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type {
  CategoriesResponse,
  Category,
  CategoryListParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";
import { covalentHubClient } from "@/services/clients/covalent.client";
import { showToastError } from "@/utils/show-toast-success";

type ApiErrorResponse = {
  message?: string;
};

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
      const response = await covalentHubClient.get("/categories", {
        params: {
          search: params.search || undefined,
        },
      });

      const categories: Category[] = Array.isArray(response.data)
        ? response.data
        : response.data.data ?? [];
      const totalItems = categories.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
      const pageIndex = Math.min(Math.max(params.pageIndex, 0), totalPages - 1);
      const start = pageIndex * params.pageSize;
      const items = categories.slice(start, start + params.pageSize);

      return {
        items,
        pagination: {
          page: pageIndex + 1,
          pageSize: params.pageSize,
          totalItems,
          totalPages,
          hasNextPage: pageIndex < totalPages - 1,
          hasPreviousPage: pageIndex > 0,
        },
      };
    },
  });
}

export function useCategoryByIdQuery(categoryId?: string) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    enabled: Boolean(categoryId),
    queryFn: async (): Promise<Category> => {
      const response = await covalentHubClient.get(`/categories/${categoryId}`);
      return response.data.data ?? response.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const response = await covalentHubClient.post("/categories", payload);
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
        `/categories/${categoryId}`,
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
      const response = await covalentHubClient.delete(`/categories/${categoryId}`);
      return response.data.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      showToastError(
        "Delete category failed",
        error.response?.data?.message || "Could not delete this category."
      );
    },
  });
}
