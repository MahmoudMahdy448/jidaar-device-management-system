import { UserRole } from "@prisma/client";

export type Permission =
  | "devices:read"
  | "devices:write"
  | "devices:delete"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "assignments:read"
  | "assignments:write"
  | "departments:read"
  | "departments:write"
  | "departments:delete"
  | "locations:read"
  | "locations:write"
  | "locations:delete"
  | "manufacturers:read"
  | "manufacturers:write"
  | "manufacturers:delete"
  | "vendors:read"
  | "vendors:write"
  | "vendors:delete"
  | "device-types:read"
  | "device-types:write"
  | "device-types:delete"
  | "device-statuses:read"
  | "device-statuses:write"
  | "device-statuses:delete"
  | "dashboard:read"
  | "export:read"
  | "search:read"
  | "settings:write";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "devices:read", "devices:write", "devices:delete",
    "users:read", "users:write", "users:delete",
    "assignments:read", "assignments:write",
    "departments:read", "departments:write", "departments:delete",
    "locations:read", "locations:write", "locations:delete",
    "manufacturers:read", "manufacturers:write", "manufacturers:delete",
    "vendors:read", "vendors:write", "vendors:delete",
    "device-types:read", "device-types:write", "device-types:delete",
    "device-statuses:read", "device-statuses:write", "device-statuses:delete",
    "dashboard:read",
    "export:read",
    "search:read",
    "settings:write",
  ],
  TECHNICIAN: [
    "devices:read", "devices:write",
    "users:read",
    "assignments:read", "assignments:write",
    "departments:read",
    "locations:read",
    "manufacturers:read",
    "vendors:read",
    "device-types:read",
    "device-statuses:read",
    "dashboard:read",
    "export:read",
    "search:read",
  ],
  READ_ONLY: [
    "devices:read",
    "users:read",
    "assignments:read",
    "departments:read",
    "locations:read",
    "manufacturers:read",
    "vendors:read",
    "device-types:read",
    "device-statuses:read",
    "dashboard:read",
    "export:read",
    "search:read",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
