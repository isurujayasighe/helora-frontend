import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { OrderItemType, PriceSource } from "@/api/useCreateOrder";

export type PackageTemplateCategory = {
  id: string;
  name: string;
};

export type PackageTemplateItem = {
  id: string;
  tenantId: string;
  packageTemplateId: string;
  itemType: OrderItemType;
  categoryId: string | null;
  itemDescription: string;
  defaultQuantity: number;
  defaultUnitPrice: string | number | null;
  priceSource: PriceSource;
  isOptional: boolean;
  sortOrder: number;
  notes: string | null;
  category: PackageTemplateCategory | null;
};

export type PackageTemplate = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  packagePrice: string | number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: PackageTemplateItem[];
};

export type PackageTemplateItemPayload = {
  itemType?: OrderItemType;
  categoryId?: string;
  itemDescription: string;
  defaultQuantity?: number;
  defaultUnitPrice?: number;
  priceSource?: PriceSource;
  isOptional?: boolean;
  sortOrder?: number;
  notes?: string;
};

export type PackageTemplatePayload = {
  name: string;
  description?: string;
  packagePrice?: number;
  isActive?: boolean;
  items: PackageTemplateItemPayload[];
};

type PackageTemplateResponse<T> = {
  success: boolean;
  data: T;
};

export const packageTemplateKeys = {
  all: ["package-templates"] as const,
  lists: () => [...packageTemplateKeys.all, "list"] as const,
  list: (params?: { isActive?: boolean; search?: string }) =>
    [...packageTemplateKeys.lists(), params ?? {}] as const,
  detail: (id?: string | null) =>
    [...packageTemplateKeys.all, "detail", id ?? ""] as const,
};

export function usePackageTemplatesQuery(params?: {
  isActive?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: packageTemplateKeys.list(params),
    queryFn: async () => {
      const response = await covalentHubClient.get<
        PackageTemplateResponse<PackageTemplate[]>
      >("/package-templates", {
        params,
      });

      return response.data.data;
    },
    staleTime: 60_000,
  });
}

export function useCreatePackageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PackageTemplatePayload) => {
      const response = await covalentHubClient.post<
        PackageTemplateResponse<PackageTemplate>
      >("/package-templates", payload);

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageTemplateKeys.all });
    },
  });
}

export function useUpdatePackageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      packageTemplateId,
      payload,
    }: {
      packageTemplateId: string;
      payload: PackageTemplatePayload;
    }) => {
      const response = await covalentHubClient.patch<
        PackageTemplateResponse<PackageTemplate>
      >(`/package-templates/${packageTemplateId}`, payload);

      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageTemplateKeys.all });
      queryClient.invalidateQueries({
        queryKey: packageTemplateKeys.detail(variables.packageTemplateId),
      });
    },
  });
}

export function useDeactivatePackageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packageTemplateId: string) => {
      const response = await covalentHubClient.delete(
        `/package-templates/${packageTemplateId}`,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageTemplateKeys.all });
    },
  });
}
