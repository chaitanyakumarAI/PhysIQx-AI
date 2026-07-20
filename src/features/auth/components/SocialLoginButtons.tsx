"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export interface SocialLoginButtonsProps {
  className?: string;
}

/**
 * Social login buttons with proper Google SVG brand icon.
 * Apple is shown as disabled until an Apple Developer account is configured.
 */
export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        console.error("Google OAuth error:", error.message);
        setGoogleLoading(false);
      }
      // If no error, browser is redirecting — keep spinner
    } catch {
      setGoogleLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="social-btn"
      >
        {googleLoading ? (
          <span className="social-btn-spinner" aria-hidden />
        ) : (
          <GoogleIcon />
        )}
        <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
      </button>

      {/* Apple — placeholder until Apple Dev account is configured */}
      <button
        type="button"
        disabled
        title="Apple Sign-In coming soon"
        className="social-btn social-btn--disabled"
      >
        <AppleIcon />
        <span>Continue with Apple</span>
      </button>

      <style>{`
        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          width: 100%;
          height: 3rem;
          padding: 0 1.25rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #fafafa;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
          position: relative;
          overflow: hidden;
        }
        .social-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
          pointer-events: none;
        }
        .social-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .social-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .social-btn:disabled {
          pointer-events: none;
          opacity: 0.4;
          cursor: not-allowed;
        }
        .social-btn--disabled {
          cursor: not-allowed;
        }
        .social-btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #22c55e;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/** Official Google brand colors SVG */
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

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" aria-hidden fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.4-150.3-102.1C67.1 716 0 549 0 417.1 0 294.6 40.8 205 125 128.9c64.1-56.7 138.6-89.5 218.8-89.5 80.2 0 138.6 44.9 185.8 44.9 44.9 0 114.9-47 205.2-47c32.2 0 123.5 4.4 190.1 79.6zm-234.3-149c9.6-23.2 13.7-46.4 13.7-69.6 0-3.2-.3-6.4-.6-9.5-26.3 1.3-57.2 17.4-75.8 39.5-17 20-30.2 50.4-30.2 79.5 0 3.2.3 6.4.5 9.4 2 .2 4 .3 6 .3 24.2 0 53.9-14.7 86.4-48.6z" />
    </svg>
  );
}
