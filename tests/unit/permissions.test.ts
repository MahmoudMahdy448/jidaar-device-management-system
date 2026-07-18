import { describe, it, expect } from "vitest";
import { UserRole } from "@prisma/client";
import {
  hasPermission,
  hasAnyPermission,
  getRolePermissions,
} from "@/lib/permissions";

describe("hasPermission", () => {
  describe("Admin role", () => {
    it("has devices:read", () => {
      expect(hasPermission(UserRole.ADMIN, "devices:read")).toBe(true);
    });

    it("has devices:write", () => {
      expect(hasPermission(UserRole.ADMIN, "devices:write")).toBe(true);
    });

    it("has devices:delete", () => {
      expect(hasPermission(UserRole.ADMIN, "devices:delete")).toBe(true);
    });

    it("has users:read", () => {
      expect(hasPermission(UserRole.ADMIN, "users:read")).toBe(true);
    });

    it("has users:write", () => {
      expect(hasPermission(UserRole.ADMIN, "users:write")).toBe(true);
    });

    it("has users:delete", () => {
      expect(hasPermission(UserRole.ADMIN, "users:delete")).toBe(true);
    });

    it("has assignments:read", () => {
      expect(hasPermission(UserRole.ADMIN, "assignments:read")).toBe(true);
    });

    it("has assignments:write", () => {
      expect(hasPermission(UserRole.ADMIN, "assignments:write")).toBe(true);
    });

    it("has settings:write", () => {
      expect(hasPermission(UserRole.ADMIN, "settings:write")).toBe(true);
    });

    it("has all permissions", () => {
      const allPerms = getRolePermissions(UserRole.ADMIN);
      for (const perm of allPerms) {
        expect(hasPermission(UserRole.ADMIN, perm)).toBe(true);
      }
    });
  });

  describe("Technician role", () => {
    it("has devices:read", () => {
      expect(hasPermission(UserRole.TECHNICIAN, "devices:read")).toBe(true);
    });

    it("has devices:write", () => {
      expect(hasPermission(UserRole.TECHNICIAN, "devices:write")).toBe(true);
    });

    it("does not have devices:delete", () => {
      expect(hasPermission(UserRole.TECHNICIAN, "devices:delete")).toBe(false);
    });

    it("has assignments:read", () => {
      expect(hasPermission(UserRole.TECHNICIAN, "assignments:read")).toBe(true);
    });

    it("has assignments:write", () => {
      expect(hasPermission(UserRole.TECHNICIAN, "assignments:write")).toBe(true);
    });

    it("does not have users:write", () => {
      expect(hasPermission(UserRole.TECHNICIAN, "users:write")).toBe(false);
    });

    it("does not have users:delete", () => {
      expect(hasPermission(UserRole.TECHNICIAN, "users:delete")).toBe(false);
    });

    it("does not have settings:write", () => {
      expect(hasPermission(UserRole.TECHNICIAN, "settings:write")).toBe(false);
    });
  });

  describe("ReadOnly role", () => {
    it("has devices:read", () => {
      expect(hasPermission(UserRole.READ_ONLY, "devices:read")).toBe(true);
    });

    it("does not have devices:write", () => {
      expect(hasPermission(UserRole.READ_ONLY, "devices:write")).toBe(false);
    });

    it("does not have devices:delete", () => {
      expect(hasPermission(UserRole.READ_ONLY, "devices:delete")).toBe(false);
    });

    it("has assignments:read", () => {
      expect(hasPermission(UserRole.READ_ONLY, "assignments:read")).toBe(true);
    });

    it("does not have assignments:write", () => {
      expect(hasPermission(UserRole.READ_ONLY, "assignments:write")).toBe(false);
    });

    it("does not have users:write", () => {
      expect(hasPermission(UserRole.READ_ONLY, "users:write")).toBe(false);
    });

    it("does not have settings:write", () => {
      expect(hasPermission(UserRole.READ_ONLY, "settings:write")).toBe(false);
    });

    it("has only read permissions", () => {
      const perms = getRolePermissions(UserRole.READ_ONLY);
      for (const perm of perms) {
        expect(perm).toMatch(/:read$/);
      }
    });
  });
});

describe("hasAnyPermission", () => {
  it("returns true if user has at least one of the permissions", () => {
    expect(
      hasAnyPermission(UserRole.TECHNICIAN, ["users:delete", "devices:read"])
    ).toBe(true);
  });

  it("returns false if user has none of the permissions", () => {
    expect(
      hasAnyPermission(UserRole.READ_ONLY, ["devices:write", "devices:delete"])
    ).toBe(false);
  });
});

describe("getRolePermissions", () => {
  it("returns permissions for known role", () => {
    const perms = getRolePermissions(UserRole.ADMIN);
    expect(perms.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown role", () => {
    const perms = getRolePermissions("UNKNOWN_ROLE" as UserRole);
    expect(perms).toEqual([]);
  });
});
