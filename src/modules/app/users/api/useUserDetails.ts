import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { ApiResponse, PaginatedResponse } from "@/types/api-response.types";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface Role {
  roleId: string;
  roleName: string;
  code?: string;
  isActive: boolean;
}

export interface Environment {
  environmentId: string;
  environmentName: string;
  isActive: boolean;
  roles: Role[];
}

export interface UserMembership {
  id: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  role: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
  };
}

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status: "ACTIVE" | "INVITED" | "DISABLED";
  createdAt: string;
  updatedAt: string;
  memberships: UserMembership[];

  tenantUserId: string;
  isActive: boolean;
  isSystemUser?: boolean;
  userId: string;
  userName: string;
  phoneNumber?: string | null;
  lastLogin?: string | null;
  lastLoginAt?: string | null;
  environments: Environment[];
}

/* ------------------------------------------------------------------ */
/* API Logic                                                          */
/* ------------------------------------------------------------------ */

const getFullName = (user: Pick<User, "firstName" | "lastName" | "email">) => {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email;
};

export const normalizeUser = (user: User): User => ({
  ...user,
  tenantUserId: user.memberships?.[0]?.id ?? user.id,
  userId: user.id,
  userName: getFullName(user),
  isActive:
    user.status === "ACTIVE" && (user.memberships?.[0]?.isActive ?? true),
  environments:
    user.memberships?.map((membership) => ({
      environmentId: membership.tenant.id,
      environmentName: membership.tenant.name,
      isActive: membership.tenant.isActive,
      roles: [
        {
          roleId: membership.role.id,
          roleName: membership.role.name,
          code: membership.role.code,
          isActive: membership.isActive,
        },
      ],
    })) ?? [],
});

async function fetchUsers({
  pageIndex,
  pageSize,
  search,
  status,
  roleId,
}: {
  pageIndex: number;
  pageSize: number;
  search: string;
  status?: User["status"];
  roleId?: string;
}) {
  const pageNumber = pageIndex + 1;

  const response = await covalentHubClient.get<
    ApiResponse<PaginatedResponse<User>>
  >(
    "/users",
    {
      params: {
        page: pageNumber,
        pageSize,
        q: search || undefined,
        status,
        roleId,
      },
    }
  );

  return response.data.data;
}

export function useUsersQuery({
  pageIndex,
  pageSize,
  search,
  status,
  roleId,
}: {
  pageIndex: number;
  pageSize: number;
  search: string;
  status?: User["status"];
  roleId?: string;
}) {
  return useQuery({
    queryKey: ["users", pageIndex, pageSize, search, status, roleId],
    queryFn: async () => {
      const data = await fetchUsers({
        pageIndex,
        pageSize,
        search,
        status,
        roleId,
      });

      return {
        items: (data.items || []).map(normalizeUser),
        pagination: data.meta,
        total: data.meta?.total || 0,
      };
    },
    placeholderData: (prev) => prev,
  });
}
