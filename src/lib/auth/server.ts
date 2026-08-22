import { auth } from "./index";
import { headers } from "next/headers";
import { db } from "../db";
import { members, restaurants } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { hasPermission, type Permission, type Role } from "../permissions";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getActiveRestaurant(userId: string) {
  const member = await db.query.members.findFirst({
    where: and(
      eq(members.userId, userId),
    ),
    with: {
      // We'll handle this with a raw query or separate fetch
    },
  });
  
  if (!member) return null;
  
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, member.restaurantId),
  });
  
  return { member, restaurant };
}

export async function requireRestaurant() {
  const session = await requireAuth();
  const active = await getActiveRestaurant(session.user.id);
  if (!active || !active.restaurant) {
    throw new Error("No restaurant found");
  }
  return {
    user: session.user,
    session: session.session,
    member: active.member,
    restaurant: active.restaurant,
  };
}

export async function requirePermission(permission: Permission) {
  const ctx = await requireRestaurant();
  const role = ctx.member.role as Role;
  if (!hasPermission(role, permission)) {
    throw new Error("Insufficient permissions");
  }
  return ctx;
}
