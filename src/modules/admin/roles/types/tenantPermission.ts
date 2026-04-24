export interface Permission {
  id: string;
  roleId: string;
  tenantEnvironmentPageId: string;
  createdAt: string;
  updatedAt: string | null;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface PermissionApiResponse {
  success: boolean;
  data: Permission[];
  error: string | null;
}