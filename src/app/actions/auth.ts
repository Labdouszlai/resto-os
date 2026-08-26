"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants, members, branches } from "@/lib/db/schema";
import { headers, cookies } from "next/headers";
import { slugify } from "@/lib/slugify";

export async function signInAction(email: string, password: string) {
  try {
    const h = await headers();
    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: h,
      asResponse: true,
    });

    if (response instanceof Response) {
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        const c = await cookies();
        const cookieParts = setCookieHeader.split(";");
        const [nameValue] = cookieParts;
        const [name, ...valueParts] = nameValue.split("=");
        const value = valueParts.join("=");
        const options: Record<string, any> = { path: "/" };
        for (const part of cookieParts.slice(1)) {
          const [key, val] = part.trim().split("=");
          const k = key.toLowerCase();
          if (k === "max-age") options.maxAge = parseInt(val);
          if (k === "httponly") options.httpOnly = true;
          if (k === "samesite") options.sameSite = val as "lax" | "strict" | "none";
          if (k === "secure") options.secure = true;
        }
        if (process.env.NODE_ENV === "production") options.secure = true;
        if (!options.sameSite) options.sameSite = "lax";
        c.set(name.trim(), value.trim(), options);
      }
    }

    return { success: true };
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
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: h,
      asResponse: true,
    });

    let userData: any;
    if (response instanceof Response) {
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        const c = await cookies();
        const cookieParts = setCookieHeader.split(";");
        const [nameValue] = cookieParts;
        const [cookieName, ...valueParts] = nameValue.split("=");
        const value = valueParts.join("=");
        const options: Record<string, any> = { path: "/" };
        for (const part of cookieParts.slice(1)) {
          const [key, val] = part.trim().split("=");
          const k = key.toLowerCase();
          if (k === "max-age") options.maxAge = parseInt(val);
          if (k === "httponly") options.httpOnly = true;
          if (k === "samesite") options.sameSite = val as "lax" | "strict" | "none";
          if (k === "secure") options.secure = true;
        }
        if (process.env.NODE_ENV === "production") options.secure = true;
        if (!options.sameSite) options.sameSite = "lax";
        c.set(cookieName.trim(), value.trim(), options);
      }
      userData = await response.json();
    } else {
      userData = response;
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

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign up failed";
    return { success: false, error: message };
  }
}

export async function signOutAction() {
  try {
    const h = await headers();
    await auth.api.signOut({ headers: h });
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
      body: { email, redirectTo: "/reset-password" },
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
      body: { newPassword: password, token },
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password";
    return { success: false, error: message };
  }
}
