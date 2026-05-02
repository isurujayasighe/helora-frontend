import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface Role {
  roleId: string;
  roleName: string;
  isActive: boolean;
}

export interface Environment {
  environmentId: string;
  environmentName: string;
  isActive: boolean;
  roles: Role[];
}

export interface User {
  tenantUserId: string;
  isActive: boolean;
  isSystemUser: boolean;
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string | null;
  lastLogin: string | null;
  environments: Environment[];
}

// Matches your JSON: { "success": true, "data": { "items": [...], "totalCount": 1 ... } }
interface UsersApiResponse {
  success: boolean;
  data: {
    items: User[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
  error: string | null;
}

/* ------------------------------------------------------------------ */
/* API Logic                                                          */
/* ------------------------------------------------------------------ */

async function fetchUsers({
  pageIndex,
  pageSize,
  search,
}: {
  pageIndex: number;
  pageSize: number;
  search: string;
}) {
  const pageNumber = pageIndex + 1;

  const response = await covalentHubClient.get<UsersApiResponse>(
    "/auth-service/api/TenantUsers",
    {
      params: {
        page: pageNumber,
        pageSize: pageSize,
        search: search || undefined,
      },
    }
  );

  return response.data.data; // This returns { items, totalCount, ... }
}

export function useUsersQuery({
  pageIndex,
  pageSize,
  search,
}: {
  pageIndex: number;
  pageSize: number;
  search: string;
}) {
  return useQuery({
    queryKey: ["users", pageIndex, pageSize, search],
    queryFn: async () => {
      const data = await fetchUsers({ pageIndex, pageSize, search });
      return {
        items: data.items || [],
        total: data.totalCount || 0,
      };
    },
    placeholderData: (prev) => prev,
  });
}