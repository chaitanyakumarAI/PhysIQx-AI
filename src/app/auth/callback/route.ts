import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * OAuth callback handler. Supabase redirects here after a successful
 * Google/Apple sign-in with an auth `code` query param. We exchange
 * it for a session, then redirect the user into the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Something went wrong — send them back to login with an error hint
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", origin));
}
