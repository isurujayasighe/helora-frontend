import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { covalentHubClient } from "@/services/clients/covalent.client";
import type { ApiResponse } from "@/types/api-response.types";
import type {
  RoleListQueryParams,
  RolesListResponse,
} from "../modules/app/roles/types/role.types";

/* ------------------------------------------------------------------ */
/* Query Keys                                                         */
/* ------------------------------------------------------------------ */

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params?: RoleListQueryParams) =>
    [...roleKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Fetcher                                                            */
/* ------------------------------------------------------------------ */

export const getRoles = async (
  params?: RoleListQueryParams,
): Promise<RolesListResponse> => {
  const response = await covalentHubClient.get<ApiResponse<RolesListResponse>>(
    "/roles",
    {
      params,
    },
  );

  return response.data.data;
};

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

type UseGetRolesOptions<TData = RolesListResponse> = {
  params?: RoleListQueryParams;
  select?: (data: RolesListResponse) => TData;
  config?: Omit<
    UseQueryOptions<RolesListResponse, AxiosError, TData>,
    "queryKey" | "queryFn" | "select"
  >;
};

export const useGetRoles = <TData = RolesListResponse>({
  params,
  select,
  config,
}: UseGetRolesOptions<TData> = {}) => {
  return useQuery<RolesListResponse, AxiosError, TData>({
    queryKey: roleKeys.list(params),
    queryFn: () => getRoles(params),
    select,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    ...config,
  });
};
