// Whitelist of assignable user roles. Guard against mass-assignment of
// arbitrary role strings via /api/admin/users (PUT).
export const VALID_USER_ROLES = ["user", "admin"] as const;

export type UserRole = (typeof VALID_USER_ROLES)[number];

export function isValidUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (VALID_USER_ROLES as readonly string[]).includes(value);
}
