import { describe, it, expect } from "@jest/globals";
import { hasPermission, hasAnyPermission, ROLES, PERMISSIONS } from "@/lib/permissions";
import type { Role, Permission } from "@/lib/permissions";

describe("permissions", () => {
  describe("hasPermission", () => {
    it("owner has all permissions", () => {
      expect(hasPermission("owner", "orders:create")).toBe(true);
      expect(hasPermission("owner", "inventory:delete")).toBe(true);
      expect(hasPermission("owner", "settings:manage")).toBe(true);
    });

    it("waiter can access orders", () => {
      expect(hasPermission("waiter", "orders:view")).toBe(true);
      expect(hasPermission("waiter", "orders:create")).toBe(true);
    });

    it("waiter cannot manage settings", () => {
      expect(hasPermission("waiter", "settings:manage")).toBe(false);
    });

    it("kitchen can view orders", () => {
      expect(hasPermission("kitchen", "orders:view")).toBe(true);
    });

    it("kitchen cannot manage settings", () => {
      expect(hasPermission("kitchen", "settings:manage")).toBe(false);
    });

    it("cashier can view orders and payments", () => {
      expect(hasPermission("cashier", "orders:view")).toBe(true);
      expect(hasPermission("cashier", "payments:create")).toBe(true);
    });

    it("accountant can view expenses", () => {
      expect(hasPermission("accountant", "expenses:view")).toBe(true);
      expect(hasPermission("accountant", "reports:view")).toBe(true);
    });
  });

  describe("hasAnyPermission", () => {
    it("returns true if role has any of the permissions", () => {
      expect(
        hasAnyPermission("owner", ["orders:create", "nonexistent:perm" as Permission])
      ).toBe(true);
    });

    it("returns false if role has none of the permissions", () => {
      expect(
        hasAnyPermission("waiter", ["settings:manage", "employees:delete"])
      ).toBe(false);
    });
  });

  describe("ROLES", () => {
    it("has all expected roles", () => {
      expect(ROLES).toContain("owner");
      expect(ROLES).toContain("admin");
      expect(ROLES).toContain("manager");
      expect(ROLES).toContain("cashier");
      expect(ROLES).toContain("waiter");
      expect(ROLES).toContain("kitchen");
      expect(ROLES).toContain("accountant");
    });
  });

  describe("PERMISSIONS", () => {
    it("defines permissions for all resources", () => {
      expect(PERMISSIONS.orders).toBeDefined();
      expect(PERMISSIONS.inventory).toBeDefined();
      expect(PERMISSIONS.menu).toBeDefined();
      expect(PERMISSIONS.employees).toBeDefined();
      expect(PERMISSIONS.settings).toBeDefined();
    });
  });
});
