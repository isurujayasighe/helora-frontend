import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { covalentHubClient } from "@/services/clients/covalent.client";
import {
  showToastError,
  showToastSuccess,
} from "@/utils/show-toast-success";
import type {
  GarmentSet,
  PreviewPricePayload,
  PreviewPriceResult,
  PriceBook,
  PriceBookPayload,
  PriceBookStatus,
  PriceChart,
  PriceChartPayload,
  PriceRule,
  PriceRulePayload,
  PricingMethod,
  PricingScope,
} from "../types/pricing.types";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export type PriceBookListParams = {
  search?: string;
  status?: PriceBookStatus;
};

export type PriceRuleListParams = {
  priceBookId?: string;
  scope?: PricingScope;
  method?: PricingMethod;
  isActive?: boolean;
};

export type PriceChartListParams = {
  priceRuleId?: string;
  isActive?: boolean;
};

export type GarmentSetListParams = {
  search?: string;
  isActive?: boolean;
};

export const pricingKeys = {
  all: ["pricing"] as const,
  priceBooks: () => [...pricingKeys.all, "price-books"] as const,
  books: (params?: PriceBookListParams) =>
    [...pricingKeys.all, "price-books", params ?? {}] as const,
  priceBook: (id?: string) => [...pricingKeys.priceBooks(), id ?? ""] as const,
  priceRules: () => [...pricingKeys.all, "price-rules"] as const,
  rules: (params?: PriceRuleListParams) =>
    [...pricingKeys.all, "rules", params ?? {}] as const,
  priceRule: (id?: string) => [...pricingKeys.priceRules(), id ?? ""] as const,
  priceCharts: () => [...pricingKeys.all, "price-charts"] as const,
  charts: (params?: PriceChartListParams) =>
    [...pricingKeys.all, "charts", params ?? {}] as const,
  priceChart: (id?: string) => [...pricingKeys.priceCharts(), id ?? ""] as const,
  garmentSets: (params?: GarmentSetListParams) =>
    [...pricingKeys.all, "garment-sets", params ?? {}] as const,
};

function unwrapResponse<T>(response: ApiResponse<T> | T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as ApiResponse<T>).data !== undefined
  ) {
    return (response as ApiResponse<T>).data as T;
  }

  return response as T;
}

export function usePriceBooksQuery(params?: PriceBookListParams) {
  return useQuery({
    queryKey: pricingKeys.books(params),
    queryFn: async (): Promise<PriceBook[]> => {
      const response = await covalentHubClient.get<ApiResponse<PriceBook[]>>(
        "/pricing/price-books",
        { params },
      );

      return unwrapResponse(response.data);
    },
    staleTime: 60_000,
  });
}

export function usePriceBookQuery(id?: string) {
  return useQuery({
    queryKey: pricingKeys.priceBook(id),
    enabled: Boolean(id),
    queryFn: async (): Promise<PriceBook> => {
      const response = await covalentHubClient.get<ApiResponse<PriceBook>>(
        `/pricing/price-books/${id}`,
      );

      return unwrapResponse(response.data);
    },
  });
}

export function useCreatePriceBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PriceBookPayload): Promise<PriceBook> => {
      const response = await covalentHubClient.post<ApiResponse<PriceBook>>(
        "/pricing/price-books",
        payload,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceBooks() });
      showToastSuccess("Price book created", "The price book is ready to use.");
    },
    onError: (error: any) => {
      showToastError(
        "Price book failed",
        error?.response?.data?.message || "Could not save this price book.",
      );
    },
  });
}

export function useUpdatePriceBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: PriceBookPayload;
    }): Promise<PriceBook> => {
      const response = await covalentHubClient.patch<ApiResponse<PriceBook>>(
        `/pricing/price-books/${id}`,
        payload,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceBooks() });
      queryClient.invalidateQueries({
        queryKey: pricingKeys.priceBook(variables.id),
      });
      showToastSuccess("Price book updated", "The price book was saved.");
    },
    onError: (error: any) => {
      showToastError(
        "Price book failed",
        error?.response?.data?.message || "Could not update this price book.",
      );
    },
  });
}

export function useArchivePriceBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<PriceBook> => {
      const response = await covalentHubClient.delete<ApiResponse<PriceBook>>(
        `/pricing/price-books/${id}`,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceBooks() });
      showToastSuccess("Price book archived", "New calculations will not use it.");
    },
    onError: (error: any) => {
      showToastError(
        "Archive failed",
        error?.response?.data?.message || "Could not archive this price book.",
      );
    },
  });
}

export function usePriceRulesQuery(params?: PriceRuleListParams) {
  return useQuery({
    queryKey: pricingKeys.rules(params),
    queryFn: async (): Promise<PriceRule[]> => {
      const response = await covalentHubClient.get<ApiResponse<PriceRule[]>>(
        "/pricing/rules",
        { params },
      );

      return unwrapResponse(response.data);
    },
    staleTime: 60_000,
  });
}

export function usePriceRuleQuery(id?: string) {
  return useQuery({
    queryKey: pricingKeys.priceRule(id),
    enabled: Boolean(id),
    queryFn: async (): Promise<PriceRule> => {
      const response = await covalentHubClient.get<ApiResponse<PriceRule>>(
        `/pricing/rules/${id}`,
      );

      return unwrapResponse(response.data);
    },
  });
}

export function useCreatePriceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PriceRulePayload): Promise<PriceRule> => {
      const response = await covalentHubClient.post<ApiResponse<PriceRule>>(
        "/pricing/rules",
        payload,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceRules() });
      showToastSuccess("Price rule created", "The rule is ready for pricing.");
    },
    onError: (error: any) => {
      showToastError(
        "Price rule failed",
        error?.response?.data?.message || "Could not save this price rule.",
      );
    },
  });
}

export function useUpdatePriceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: PriceRulePayload;
    }): Promise<PriceRule> => {
      const response = await covalentHubClient.patch<ApiResponse<PriceRule>>(
        `/pricing/rules/${id}`,
        payload,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceRules() });
      queryClient.invalidateQueries({
        queryKey: pricingKeys.priceRule(variables.id),
      });
      showToastSuccess("Price rule updated", "The price rule was saved.");
    },
    onError: (error: any) => {
      showToastError(
        "Price rule failed",
        error?.response?.data?.message || "Could not update this price rule.",
      );
    },
  });
}

export function useDeactivatePriceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<PriceRule> => {
      const response = await covalentHubClient.delete<ApiResponse<PriceRule>>(
        `/pricing/rules/${id}`,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceRules() });
      showToastSuccess("Price rule deactivated", "New calculations will skip it.");
    },
    onError: (error: any) => {
      showToastError(
        "Deactivate failed",
        error?.response?.data?.message || "Could not deactivate this rule.",
      );
    },
  });
}

export function usePriceChartsQuery(params?: PriceChartListParams) {
  return useQuery({
    queryKey: pricingKeys.charts(params),
    queryFn: async (): Promise<PriceChart[]> => {
      const response = await covalentHubClient.get<ApiResponse<PriceChart[]>>(
        "/pricing/charts",
        { params },
      );

      return unwrapResponse(response.data);
    },
    staleTime: 60_000,
  });
}

export function usePriceChartQuery(id?: string) {
  return useQuery({
    queryKey: pricingKeys.priceChart(id),
    enabled: Boolean(id),
    queryFn: async (): Promise<PriceChart> => {
      const response = await covalentHubClient.get<ApiResponse<PriceChart>>(
        `/pricing/charts/${id}`,
      );

      return unwrapResponse(response.data);
    },
  });
}

export function useCreatePriceChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PriceChartPayload): Promise<PriceChart> => {
      const response = await covalentHubClient.post<ApiResponse<PriceChart>>(
        "/pricing/charts",
        payload,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceCharts() });
      showToastSuccess("Price chart created", "The chart is ready for pricing.");
    },
    onError: (error: any) => {
      showToastError(
        "Price chart failed",
        error?.response?.data?.message || "Could not save this chart.",
      );
    },
  });
}

export function useUpdatePriceChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: PriceChartPayload;
    }): Promise<PriceChart> => {
      const response = await covalentHubClient.patch<ApiResponse<PriceChart>>(
        `/pricing/charts/${id}`,
        payload,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceCharts() });
      queryClient.invalidateQueries({
        queryKey: pricingKeys.priceChart(variables.id),
      });
      showToastSuccess("Price chart updated", "The chart was saved.");
    },
    onError: (error: any) => {
      showToastError(
        "Price chart failed",
        error?.response?.data?.message || "Could not update this chart.",
      );
    },
  });
}

export function useDeactivatePriceChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<PriceChart> => {
      const response = await covalentHubClient.delete<ApiResponse<PriceChart>>(
        `/pricing/charts/${id}`,
      );

      return unwrapResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.priceCharts() });
      showToastSuccess("Price chart deactivated", "New calculations will skip it.");
    },
    onError: (error: any) => {
      showToastError(
        "Deactivate failed",
        error?.response?.data?.message || "Could not deactivate this chart.",
      );
    },
  });
}

export function useGarmentSetsQuery(params?: GarmentSetListParams) {
  return useQuery({
    queryKey: pricingKeys.garmentSets(params),
    queryFn: async (): Promise<GarmentSet[]> => {
      const response = await covalentHubClient.get<ApiResponse<GarmentSet[]>>(
        "/pricing/garment-sets",
        { params },
      );

      return unwrapResponse(response.data);
    },
    staleTime: 60_000,
  });
}

export function usePreviewPrice() {
  return useMutation({
    mutationFn: async (
      payload: PreviewPricePayload,
    ): Promise<PreviewPriceResult> => {
      const response = await covalentHubClient.post<
        ApiResponse<PreviewPriceResult>
      >("/pricing/preview", payload);

      return unwrapResponse(response.data);
    },
    onError: (error: any) => {
      showToastError(
        "Pricing preview failed",
        error?.response?.data?.message || "Could not calculate this price.",
      );
    },
  });
}
