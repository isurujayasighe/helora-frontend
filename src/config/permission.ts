export const PERMISSION_BITS = {
  read: 1,   // 0001
  create: 2, // 0010
  update: 4, // 0100
  delete: 8, // 1000
} as const;

export type CaslAction = keyof typeof PERMISSION_BITS | 'manage';
export type CaslSubject = string; // e.g., 'TENANTS', 'USERS', 'all'