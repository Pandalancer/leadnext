import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set<string>(["/", "/login"]);

function isSuperAdminOnlyPath(pathname: string) {
  return pathname === "/admins" || pathname.startsWith("/admins/") || pathname === "/all-leads" || pathname.startsWith("/all-leads/");
}

function isAdminOnlyPath(pathname: string) {
  return pathname === "/leads" ||
    pathname.startsWith("/leads/") ||
    pathname === "/followups" ||
    pathname.startsWith("/followups/");
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth endpoints entirely.
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.has(pathname);
  let token: Awaited<ReturnType<typeof getToken>> | null = null;
  try {
    // If NEXTAUTH_SECRET isn't set locally, treat the user as logged out rather than crashing proxy.
    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
      secureCookie: process.env.NODE_ENV === "production",
    });
  } catch {
    token = null;
  }
  const isLoggedIn = !!token?.id;

  if (isPublic && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublic && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role gates for protected pages.
  if (isLoggedIn) {
    const role = token?.role;

    if (isSuperAdminOnlyPath(pathname) && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isAdminOnlyPath(pathname) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/admins/:path*",
    "/all-leads/:path*",
    "/leads/:path*",
    "/followups/:path*",
    "/settings/:path*",
    "/login",
    "/",
  ],
};
