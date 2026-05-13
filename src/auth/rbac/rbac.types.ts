// src/auth/rbac/rbac.types.ts

export type Actions = "read" | "create" | "update" | "delete" | "manage";

/**
 * These should match backend Page.code / Permission.resource values.
 */
export type PageSubject =
  | "dashboard"
  | "customers"
  | "blocks"
  | "measurements"
  | "orders"
  | "group-orders"
  | "payments"
  | "employees"
  | "attendance"
  | "whatsapp"
  | "emails"
  | "reports"
  | "settings"
  | "settings-users"
  | "settings-roles"
  | "settings-permissions"
  | "settings-pages"
  | "settings-categories"
  | "settings-audit-logs";

export type Subjects = PageSubject | "profile" | "support" | "all";

export type PermissionString = `${string}:${Actions}`;

export const RBAC_ACTIONS: Actions[] = [
  "read",
  "create",
  "update",
  "delete",
  "manage",
];

export function isRbacAction(value: string): value is Actions {
  return RBAC_ACTIONS.includes(value as Actions);
}
