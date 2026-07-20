import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Three-way route guard:
 *  1. No session        → redirect to /login
 *  2. Session, no onboarding → redirect to /onboarding
 *  3. Session + onboarded    → allow through
 *
 * Public routes (login, signup, forgot-password, auth/callback) are
 * always accessible. If an authenticated user visits /login, they
 * are redirected to /home instead.
 */

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // --- Unauthenticated user ---
  if (!user) {
    if (isPublicRoute || pathname === "/") {
      return supabaseResponse;
    }
    // Trying to access a protected route → bounce to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return Response.redirect(url);
  }

  // --- Authenticated user visiting a public auth route ---
  if (isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return Response.redirect(url);
  }

  // --- Authenticated user — allow through ---
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets (icons, mascots, manifest)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)",
  ],
};
