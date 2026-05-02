import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { covalentHubClient } from "@/services/clients/covalent.client";
import type {
  PageListQueryParams,
  PagesListResponse,
} from "../modules/app/roles/types/pages.types";

export const pageKeys = {
  all: ["pages"] as const,
  lists: () => [...pageKeys.all, "list"] as const,
  list: (params?: PageListQueryParams) =>
    [...pageKeys.lists(), params ?? {}] as const,
  my: () => [...pageKeys.all, "my"] as const,
  tree: () => [...pageKeys.all, "tree"] as const,
  detail: (id: string) => [...pageKeys.all, "detail", id] as const,
};

export const getPages = async (
  params?: PageListQueryParams,
): Promise<PagesListResponse> => {
  const response = await covalentHubClient.get<PagesListResponse>(
    "/pages",
    {
      params,
    },
  );

  return response.data;
};

type UseGetPagesOptions<TData = PagesListResponse> = {
  params?: PageListQueryParams;
  select?: (data: PagesListResponse) => TData;
  config?: Omit<
    UseQueryOptions<PagesListResponse, AxiosError, TData>,
    "queryKey" | "queryFn" | "select"
  >;
};

export const useGetPages = <TData = PagesListResponse>({
  params,
  select,
  config,
}: UseGetPagesOptions<TData> = {}) => {
  return useQuery<PagesListResponse, AxiosError, TData>({
    queryKey: pageKeys.list(params),
    queryFn: () => getPages(params),
    select,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    ...config,
  });
};