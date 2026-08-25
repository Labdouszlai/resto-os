import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { members, restaurants, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type Permission, type Role, hasPermission } from "@/lib/permissions";

export type AuthUser = { id: string; name: string; email: string; image: string | null };
export type AuthSession = { id: string; userId: string; expiresAt: Date };
export type AuthMember = { id: string; userId: string; restaurantId: string; role: string; branchId: string | null };
export type AuthRestaurant = typeof restaurants.$inferSelect;

export interface AuthContext {
  user: AuthUser;
  session: AuthSession;
  member: AuthMember;
  restaurant: AuthRestaurant;
}

function mapSession(sessionData: { user: typeof users.$inferSelect; session: { id: string; userId: string; expiresAt: Date } }): AuthContext {
  const user: AuthUser = {
    id: sessionData.user.id,
    name: sessionData.user.name,
    email: sessionData.user.email,
    image: sessionData.user.image,
  };
  const session: AuthSession = {
    id: sessionData.session.id,
    userId: sessionData.session.userId,
    expiresAt: sessionData.session.expiresAt,
  };
  return { user, session, member: null as unknown as AuthMember, restaurant: null as unknown as AuthRestaurant };
}

export async function requireAuth(): Promise<AuthContext> {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionData?.user) {
      redirect("/sign-in");
    }

    const member = await db.query.members.findFirst({
      where: eq(members.userId, sessionData.user.id),
    });

    if (!member) {
      redirect("/sign-in");
    }

    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, member.restaurantId),
    });

    if (!restaurant) {
      redirect("/sign-in");
    }

    return {
      user: { id: sessionData.user.id, name: sessionData.user.name, email: sessionData.user.email, image: sessionData.user.image ?? null },
      session: { id: sessionData.session.id, userId: sessionData.session.userId, expiresAt: sessionData.session.expiresAt },
      member: { id: member.id, userId: member.userId, restaurantId: member.restaurantId, role: member.role, branchId: member.branchId },
      restaurant,
    };
  } catch (error) {
    redirect("/sign-in");
  }
}

export async function getActiveRestaurant(userId: string) {
  if (!userId) return null;

  const member = await db.query.members.findFirst({
    where: eq(members.userId, userId),
  });
  if (!member) return null;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, member.restaurantId),
  });
  if (!restaurant) return null;

  return { member, restaurant };
}

export async function requireRestaurant(): Promise<AuthContext> {
  return requireAuth();
}

export async function requirePermission(permission: Permission): Promise<AuthContext> {
  const ctx = await requireAuth();

  if (!ctx.member) {
    redirect("/sign-in");
  }

  const allowed = hasPermission(ctx.member.role as Role, permission);
  if (!allowed) {
    throw new Error("You do not have permission to perform this action.");
  }

  return ctx;
}

export async function getSessionOrNull(): Promise<AuthContext | null> {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionData?.user) return null;

    const member = await db.query.members.findFirst({
      where: eq(members.userId, sessionData.user.id),
    });

    if (!member) {
      return {
        user: { id: sessionData.user.id, name: sessionData.user.name, email: sessionData.user.email, image: sessionData.user.image ?? null },
        session: { id: sessionData.session.id, userId: sessionData.session.userId, expiresAt: sessionData.session.expiresAt },
        member: null as unknown as AuthMember,
        restaurant: null as unknown as AuthRestaurant,
      };
    }

    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, member.restaurantId),
    });

    if (!restaurant) {
      return {
        user: { id: sessionData.user.id, name: sessionData.user.name, email: sessionData.user.email, image: sessionData.user.image ?? null },
        session: { id: sessionData.session.id, userId: sessionData.session.userId, expiresAt: sessionData.session.expiresAt },
        member: null as unknown as AuthMember,
        restaurant: null as unknown as AuthRestaurant,
      };
    }

    return {
      user: { id: sessionData.user.id, name: sessionData.user.name, email: sessionData.user.email, image: sessionData.user.image ?? null },
      session: { id: sessionData.session.id, userId: sessionData.session.userId, expiresAt: sessionData.session.expiresAt },
      member: { id: member.id, userId: member.userId, restaurantId: member.restaurantId, role: member.role, branchId: member.branchId },
      restaurant,
    };
  } catch {
    return null;
  }
}
