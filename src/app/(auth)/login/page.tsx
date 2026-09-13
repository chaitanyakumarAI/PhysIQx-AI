import type { Metadata } from "next";
import Link from "next/link";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <>
      {/* Header */}
      <div>
        <h1 className="auth-page-title">Welcome back</h1>
        <p className="auth-page-sub">Log in to keep your streak alive.</p>
      </div>

      {/* Primary Email/password form */}
      <LoginForm />

      <AuthDivider />

      {/* Social login options */}
      <SocialLoginButtons />

      {/* Switch to signup */}
      <div className="flex flex-col items-center gap-2">
        <p className="auth-switch-text">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="auth-switch-link">
            Create one
          </Link>
        </p>
        <Link
          href="/home"
          className="inline-flex items-center text-xs font-semibold text-foreground-secondary hover:text-brand transition-colors pt-1"
        >
          Explore as Guest (Skip Login) →
        </Link>
      </div>

      <style>{`
        .auth-page-title {
          font-family: var(--font-display), ui-sans-serif, system-ui;
          font-size: 1.625rem;
          font-weight: 700;
          color: #fafafa;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }
        .auth-page-sub {
          font-size: 0.875rem;
          color: #a1a1aa;
          line-height: 1.5;
        }
        .auth-switch-text {
          text-align: center;
          font-size: 0.875rem;
          color: #71717a;
        }
        .auth-switch-link {
          color: #22c55e;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .auth-switch-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
