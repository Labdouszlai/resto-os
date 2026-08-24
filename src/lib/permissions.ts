export const ROLES = ["owner", "admin", "manager", "cashier", "waiter", "kitchen", "accountant"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  restaurant: ["manage", "view"],
  branches: ["create", "edit", "delete", "view"],
  employees: ["create", "edit", "delete", "view"],
  menu: ["create", "edit", "delete", "view"],
  orders: ["create", "edit", "cancel", "view"],
  tables: ["create", "edit", "delete", "view", "assign"],
  customers: ["create", "edit", "delete", "view"],
  inventory: ["create", "edit", "delete", "view", "adjust"],
  suppliers: ["create", "edit", "delete", "view"],
  purchases: ["create", "edit", "cancel", "view"],
  expenses: ["create", "edit", "delete", "view"],
  payments: ["create", "view", "refund"],
  reservations: ["create", "edit", "cancel", "view"],
  reports: ["view", "export"],
  settings: ["manage"],
  pos: ["use"],
  analytics: ["view"],
} as const;

export type Permission = `${keyof typeof PERMISSIONS}:${(typeof PERMISSIONS)[keyof typeof PERMISSIONS][number]}`;

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: Object.entries(PERMISSIONS).flatMap(([resource, actions]) =>
    actions.map((action) => `${resource}:${action}` as Permission)
  ),
  admin: [
    "restaurant:view",
    "branches:create", "branches:edit", "branches:delete", "branches:view",
    "employees:create", "employees:edit", "employees:delete", "employees:view",
    "menu:create", "menu:edit", "menu:delete", "menu:view",
    "orders:create", "orders:edit", "orders:cancel", "orders:view",
    "tables:create", "tables:edit", "tables:delete", "tables:view", "tables:assign",
    "customers:create", "customers:edit", "customers:delete", "customers:view",
    "inventory:create", "inventory:edit", "inventory:delete", "inventory:view", "inventory:adjust",
    "suppliers:create", "suppliers:edit", "suppliers:delete", "suppliers:view",
    "purchases:create", "purchases:edit", "purchases:cancel", "purchases:view",
    "expenses:create", "expenses:edit", "expenses:delete", "expenses:view",
    "payments:create", "payments:view", "payments:refund",
    "reservations:create", "reservations:edit", "reservations:cancel", "reservations:view",
    "reports:view", "reports:export",
    "settings:manage",
    "pos:use",
    "analytics:view",
  ],
  manager: [
    "restaurant:view",
    "orders:create", "orders:edit", "orders:cancel", "orders:view",
    "menu:create", "menu:edit", "menu:delete", "menu:view",
    "tables:create", "tables:edit", "tables:delete", "tables:view", "tables:assign",
    "customers:create", "customers:edit", "customers:delete", "customers:view",
    "inventory:create", "inventory:edit", "inventory:delete", "inventory:view", "inventory:adjust",
    "employees:view",
    "reports:view", "reports:export",
    "reservations:create", "reservations:edit", "reservations:cancel", "reservations:view",
    "pos:use",
    "analytics:view",
  ],
  cashier: [
    "orders:create", "orders:view",
    "pos:use",
    "payments:create", "payments:view",
    "customers:create", "customers:view", "customers:edit",
    "reservations:view",
    "menu:view",
    "tables:view",
  ],
  waiter: [
    "orders:create", "orders:view", "orders:edit",
    "pos:use",
    "tables:view", "tables:assign",
    "customers:create", "customers:view",
    "reservations:create", "reservations:view", "reservations:edit",
    "menu:view",
  ],
  kitchen: [
    "orders:view", "orders:edit",
    "menu:view",
    "inventory:view",
  ],
  accountant: [
    "restaurant:view",
    "reports:view", "reports:export",
    "expenses:create", "expenses:edit", "expenses:delete", "expenses:view",
    "payments:view",
    "inventory:view",
    "analytics:view",
    "purchases:view",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
