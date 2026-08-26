"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants, members, branches } from "@/lib/db/schema";
import { headers, cookies } from "next/headers";
import { slugify } from "@/lib/slugify";

async function setSessionCookies(authHeaders: Headers) {
  const setCookies = authHeaders.getSetCookie?.() ?? [];
  const c = await cookies();
  for (const raw of setCookies) {
    const [pair] = raw.split(";");
    const [name, value] = pair.split("=");
    c.set(name.trim(), value.trim(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
}

export async function signInAction(email: string, password: string) {
  try {
    const h = await headers();
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: h,
      asResponse: true,
    });

    if (result instanceof Response) {
      await setSessionCookies(result.headers);
    }

    return { success: true, data: result instanceof Response ? await result.json() : result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed";
    return { success: false, error: message };
  }
}

export async function signUpAction(
  name: string,
  email: string,
  password: string
) {
  try {
    const h = await headers();
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: h,
      asResponse: true,
    });

    let userData: any;
    if (result instanceof Response) {
      await setSessionCookies(result.headers);
      userData = await result.json();
    } else {
      userData = result;
    }

    const restaurantSlug = slugify(name + "'s Restaurant");

    const [restaurant] = await db
      .insert(restaurants)
      .values({
        name: name + "'s Restaurant",
        slug: restaurantSlug,
        currency: "USD",
      })
      .returning();

    const [branch] = await db
      .insert(branches)
      .values({
        restaurantId: restaurant.id,
        name: "Main Branch",
        isActive: true,
      })
      .returning();

    await db.insert(members).values({
      userId: userData.user.id,
      restaurantId: restaurant.id,
      role: "owner",
      branchId: branch.id,
    });

    return { success: true, data: userData };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign up failed";
    return { success: false, error: message };
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    const c = await cookies();
    c.delete("better-auth.session_token");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed";
    return { success: false, error: message };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: "/reset-password",
      },
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send reset email";
    return { success: false, error: message };
  }
}

export async function resetPasswordAction(password: string, token: string) {
  try {
    await auth.api.resetPassword({
      body: {
        newPassword: password,
        token,
      },
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password";
    return { success: false, error: message };
  }
}
