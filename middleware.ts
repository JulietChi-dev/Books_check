import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Next.js Middleware (PRD 8.2, FR-9, FR-14)
 *
 * Fast routing redirects:
 * - Unauthenticated users attempting to access protected routes redirect to /login.
 * - Logged-in users attempting to access /login or /signup redirect to /.
 * - Sanitizes `Origin: "null"` headers sent by browsers under strict Referrer-Policy
 *   so Next.js internal Server Action handler does not throw TypeError: Invalid URL.
 *
 * Note: Middleware is for speed only. Server components, actions, and queries
 * enforce session security in depth (FR-87).
 */

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/health",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isPublicRoute = pathname === "/" || PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // If user has session cookie and tries to visit /login or /signup -> redirect to home.
  // /register-company is intentionally excluded: a logged-in user without a company
  // must be allowed through, and the page itself handles the session check.
  if (sessionToken && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user has NO session cookie and accesses a protected route -> redirect to /login
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Fix Next.js 15 bug: when Referrer-Policy is no-referrer, Chromium sends Origin: "null"
  // which causes Next.js Server Action action-handler.js line 278 (`new URL(origin)`) to crash.
  // Normalize "null" to the same-origin URL so Next.js internal CSRF validator succeeds.
  const rawOrigin = request.headers.get("origin");
  if (rawOrigin === "null") {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("origin", request.nextUrl.origin);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - health (uptime route)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|health).*)",
  ],
};
