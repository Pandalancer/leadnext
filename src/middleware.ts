import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for both dev and production cookie names
  const sessionCookie = request.cookies.get("next-auth.session-token") || 
                        request.cookies.get("__Secure-next-auth.session-token");
  const path = request.nextUrl.pathname;

  // Skip API auth routes entirely
  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

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
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/super-admin/:path*", 
    "/leads", 
    "/leads/:path*", 
    "/followups", 
    "/followups/:path*", 
    "/settings/:path*"
  ],
};
