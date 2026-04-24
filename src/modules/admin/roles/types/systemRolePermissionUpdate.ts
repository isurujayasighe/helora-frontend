export interface PagePermissionUpdate {
  pageId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface UpdateRolePermissionsPayload {
  pages: PagePermissionUpdate[];
}