import { jwtDecode } from "jwt-decode";
import { PERMISSION_BITS } from '../../config/permission';
import type { RawJwtPayload, UserAttributes } from "../types/auth";

export function parseUserFromToken(token: string): UserAttributes | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<RawJwtPayload>(token);

    // Deep parsing for the stringified JSON fields in the new claims
    const safeParse = <T>(value: any, fallback: T): T => {
      try {
        if (typeof value === 'string') return JSON.parse(value);
        return value || fallback;
      } catch (e) {
        return fallback;
      }
    };

    return {
      id: decoded.user_id,
      name: decoded.user_name,
      tenantId: decoded.tenant_id,
      tenantPrefix: decoded.tenant_prefix,
      environment: decoded.tenant_environment_prefix,
      personId: decoded.ifs_person_id,
      scope: decoded.user_scope,
      customerIds: safeParse<string[]>(decoded.customer_ids, []),
      permissions: safeParse<Record<string, number>>(decoded.permissions, {}),
      expiresAt: decoded.exp,
    };
  } catch (error) {
    console.error("JWT Parsing Error:", error);
    return null;
  }
}

export function transformBitmaskToStrings(permissions?: Record<string, number>): string[] {
  if (!permissions) return [];
  const permissionStrings: string[] = [];

  Object.entries(permissions).forEach(([subject, bitmask]) => {
    if ((bitmask & PERMISSION_BITS.read) === PERMISSION_BITS.read) permissionStrings.push(`${subject}:read`);
    if ((bitmask & PERMISSION_BITS.create) === PERMISSION_BITS.create) permissionStrings.push(`${subject}:create`);
    if ((bitmask & PERMISSION_BITS.update) === PERMISSION_BITS.update) permissionStrings.push(`${subject}:update`);
    if ((bitmask & PERMISSION_BITS.delete) === PERMISSION_BITS.delete) permissionStrings.push(`${subject}:delete`);
  });

  return permissionStrings;
}