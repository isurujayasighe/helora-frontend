export interface PagePermission {
  pageId: string;
  pageName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: string;
}

export interface RolePermissionsData {
  roleId: string;
  pages: PagePermission[];
}

export interface SystemRolePermissionResponse {
  success: boolean;
  data: RolePermissionsData;
  error: string | null;
}