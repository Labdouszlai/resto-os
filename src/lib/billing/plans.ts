export const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 49,
    features: {
      branches: 1,
      employees: 10,
      pos: true,
      orders: true,
      menu: true,
      basicReports: true,
      customers: true,
      inventory: false,
      reservations: false,
      employeeManagement: false,
      advancedReports: false,
      multiBranch: false,
      customRoles: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 99,
    features: {
      branches: 5,
      employees: 50,
      pos: true,
      orders: true,
      menu: true,
      basicReports: true,
      customers: true,
      inventory: true,
      reservations: true,
      employeeManagement: true,
      advancedReports: true,
      multiBranch: true,
      customRoles: false,
      apiAccess: false,
      prioritySupport: true,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    features: {
      branches: Infinity,
      employees: Infinity,
      pos: true,
      orders: true,
      menu: true,
      basicReports: true,
      customers: true,
      inventory: true,
      reservations: true,
      employeeManagement: true,
      advancedReports: true,
      multiBranch: true,
      customRoles: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type PlanFeatures = (typeof PLANS)[PlanId]["features"];

export function isWithinLimits(
  planId: PlanId,
  metric: "branches" | "employees",
  current: number
): boolean {
  const limit = PLANS[planId].features[metric];
  return current < limit;
}

export function hasFeature(planId: PlanId, feature: keyof PlanFeatures): boolean {
  const value = PLANS[planId].features[feature];
  return typeof value === "boolean" ? value : true;
}
