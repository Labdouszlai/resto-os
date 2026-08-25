import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const log = logger.child("middleware");

const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/sign-out",
  "/forgot-password",
  "/reset-password",
  "/pricing",
  "/demo",
  "/contact",
  "/privacy",
  "/terms",
  "/api/auth",
  "/api/health",
  "/onboarding",
];

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const isAuthenticated = !!sessionToken;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  if (isAuthPath(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/(dashboard)") || pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (!isPublicPath(pathname) && !pathname.startsWith("/api") && !pathname.startsWith("/_next") && !pathname.startsWith("/demo")) {
    if (!isAuthenticated) {
      log.info("Unauthenticated access to protected route", { path: pathname });
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
