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
    "restaurant:view", "branches:manage", "branches:view",
    "employees:manage", "employees:view",
    "menu:manage", "menu:view",
    "orders:manage", "orders:view", "orders:cancel",
    "tables:manage", "tables:view", "tables:assign",
    "customers:manage", "customers:view",
    "inventory:manage", "inventory:view", "inventory:adjust",
    "suppliers:manage", "suppliers:view",
    "purchases:manage", "purchases:view", "purchases:cancel",
    "expenses:manage", "expenses:view",
    "payments:create", "payments:view", "payments:refund",
    "reservations:manage", "reservations:view", "reservations:cancel",
    "reports:view", "reports:export",
    "settings:manage",
    "pos:use",
    "analytics:view",
  ],
  manager: [
    "restaurant:view",
    "orders:manage", "orders:view", "orders:cancel",
    "menu:manage", "menu:view",
    "tables:manage", "tables:view", "tables:assign",
    "customers:manage", "customers:view",
    "inventory:manage", "inventory:view", "inventory:adjust",
    "employees:view",
    "reports:view", "reports:export",
    "reservations:manage", "reservations:view", "reservations:cancel",
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
    "expenses:manage", "expenses:view",
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
