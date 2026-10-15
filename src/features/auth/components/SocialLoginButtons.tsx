"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuthProviders, type AuthProviders } from "../hooks/useAuthProviders";
import { AuthDivider } from "./AuthDivider";

type Provider = keyof AuthProviders;

const providerLabels: Record<Provider, string> = {
  google: "Continue with Google",
  apple: "Continue with Apple",
};

export interface SocialLoginButtonsProps {
  className?: string;
}

/**
 * OAuth sign-in, showing only providers that are switched on in the
 * Supabase project (Auth → Providers). With none enabled — or while
 * offline — the whole block, divider included, stays out of the way.
 */
export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const providers = useAuthProviders();
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enabled = (Object.keys(providerLabels) as Provider[]).filter(
    (provider) => providers?.[provider],
  );
  if (enabled.length === 0) return null;

  async function signIn(provider: Provider) {
    setPending(provider);
    setError(null);
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success the browser is already navigating away; keep the spinner.
    if (oauthError) {
      setError(oauthError.message);
      setPending(null);
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <AuthDivider />
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <AlertCircle size={15} className="shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}
      {enabled.map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => void signIn(provider)}
          disabled={pending !== null}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-[0.9375rem] font-semibold text-foreground transition hover:border-white/15 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:opacity-60"
        >
          {pending === provider ? (
            <Loader2 size={18} className="animate-spin" aria-hidden />
          ) : provider === "google" ? (
            <GoogleIcon />
          ) : (
            <AppleIcon />
          )}
          <span>{pending === provider ? "Redirecting…" : providerLabels[provider]}</span>
        </button>
      ))}
    </div>
  );
}

/** Google "G" in brand colors. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Apple logo (Simple Icons, CC0). */
function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}
