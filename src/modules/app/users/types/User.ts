export type UserRole = "admin" | "editor" | "viewer";
export type UserStatus = "active" | "inactive" | "disabled";

export interface User {
 userId: string;
  name: string;
  email: string;
  roles: { id: string; name: string }[];
  status: string | null;
  lastLoginAt: string;
  createdAt: string;
  permissions: string[];
}
