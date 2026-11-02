import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Keeps the Supabase session cookie fresh on every request, and sends a
 * signed-in athlete who opens an auth page (login, signup, forgot-password)
 * to /home instead.
 *
 * It deliberately does NOT guard routes: the app is local-first, so guests
 * use every screen offline, and onboarding is offered by Home's first-run
 * state rather than forced by a redirect.
 */

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // --- Authenticated user visiting a public auth route ---
  if (user && isPublicRoute && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return Response.redirect(url);
  }

  // Allow through (supports authenticated users and local/guest offline usage)
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
