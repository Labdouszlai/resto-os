import { db } from "../db";
import { members, restaurants } from "../db/schema";
import { eq } from "drizzle-orm";
import { type Permission, type Role } from "../permissions";

const TEST_USER_ID = "a0000000-0000-0000-0000-000000000001";
const TEST_RESTAURANT_ID = "b0000000-0000-0000-0000-000000000001";

export async function requireAuth() {
  const member = await db.query.members.findFirst({
    where: eq(members.userId, TEST_USER_ID),
  });
  return {
    user: { id: TEST_USER_ID, name: "Test User", email: "test@test.com", image: null },
    session: { id: "test-session", userId: TEST_USER_ID, expiresAt: new Date(Date.now() + 86400000) },
  };
}

export async function getActiveRestaurant(userId: string) {
  const member = await db.query.members.findFirst({
    where: eq(members.userId, userId || TEST_USER_ID),
  });
  if (!member) return null;
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, member.restaurantId),
  });
  return { member, restaurant };
}

export async function requireRestaurant() {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, TEST_RESTAURANT_ID),
  });
  return {
    user: { id: TEST_USER_ID, name: "Test User", email: "test@test.com", image: null },
    session: { id: "test-session", userId: TEST_USER_ID, expiresAt: new Date(Date.now() + 86400000) },
    member: { id: "d0000000-0000-0000-0000-000000000001", userId: TEST_USER_ID, restaurantId: TEST_RESTAURANT_ID, role: "owner" },
    restaurant: restaurant!,
  };
}

export async function requirePermission(permission: Permission) {
  const ctx = await requireRestaurant();
  return ctx;
}
