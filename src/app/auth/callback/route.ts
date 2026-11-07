import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server";

/**
 * Auth callback. Supabase redirects here with an auth `code` after a
 * Google/Apple sign-in or from a password-reset email. We exchange it for a
 * session, then redirect to `next` (the reset email sends /reset-password).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  // Only same-site paths: never bounce a fresh session to another origin.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/home";
  const supabase = code ? await createAuthServerClient() : null;
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  // A failed password-reset link goes back to the reset form, which says why
  // and offers a new link; anything else goes to login with an error hint.
  if (safeNext === "/reset-password") {
    return NextResponse.redirect(new URL("/forgot-password?error=reset_link_invalid", origin));
  }
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", origin));
}
