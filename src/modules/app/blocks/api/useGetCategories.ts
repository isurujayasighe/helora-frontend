import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export type Category = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    blocks: number;
    orderItems: number;
  };
};

type ListCategoriesApiResponse = {
  success: boolean;
  data: Category[];
};

const getCategories = async (): Promise<ListCategoriesApiResponse> => {
  const response =
    await covalentHubClient.get<ListCategoriesApiResponse>("/categories");

  return response.data;
};

export const categoriesQueryKeys = {
  all: ["categories"] as const,
  list: () => [...categoriesQueryKeys.all, "list"] as const,
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: getCategories,
  });
};