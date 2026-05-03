import { covalentHubClient } from "@/services/clients/covalent.client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";


export interface CategoryCount {
  blocks: number;
  orderItems: number;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: CategoryCount;
}

interface GetCategoriesApiResponse {
  success: boolean;
  data: Category[];
}

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
};

export const getCategories = async (): Promise<Category[]> => {
  const response =
    await covalentHubClient.get<GetCategoriesApiResponse>("/categories");

  return response.data.data;
};

export const useGetCategories = (
  options?: Omit<
    UseQueryOptions<Category[], AxiosError, Category[], ReturnType<typeof categoryKeys.lists>>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};