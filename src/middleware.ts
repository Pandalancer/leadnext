import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("next-auth.session-token");
  const path = request.nextUrl.pathname;

  const isLoggedIn = !!sessionCookie;
  const isPublicPath = path === "/login" || path === "/";

  if (isPublicPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/super-admin/:path*", "/leads/:path*", "/followups/:path*", "/settings/:path*"],
};
