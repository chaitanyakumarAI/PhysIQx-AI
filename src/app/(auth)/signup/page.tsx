import type { Metadata } from "next";
import Link from "next/link";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <>
      <div>
        <h1 className="auth-page-title">Create your account</h1>
        <p className="auth-page-sub">Start building your PhysIQ Score today.</p>
      </div>

      <SignupForm />
      <AuthDivider />
      <SocialLoginButtons />

      <p className="auth-switch-text">
        Already have an account?{" "}
        <Link href="/login" className="auth-switch-link">
          Log in
        </Link>
      </p>

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
