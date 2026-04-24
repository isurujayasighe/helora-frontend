// src/auth/rbac/rbac.types.ts

export type Actions = "read" | "create" | "update" | "delete" | "manage";

export type Subjects =
  | "Dashboard"
  | "Users"
  | "Customers"
  | "Categories"
  | "Blocks"
  | "Orders"
  | "Audit"
  | "Settings"
  | "Profile"
  | "Support"
  | "all";