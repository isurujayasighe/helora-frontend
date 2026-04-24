export interface SystemRolePermission {
  id: string;
  roleId: string;
  roleName: string;
  pageId: string;
  pageName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: string;
}

export interface SystemRolePermissionsResponse {
  success: boolean;
  data: SystemRolePermission[];
  error: string | null;
}