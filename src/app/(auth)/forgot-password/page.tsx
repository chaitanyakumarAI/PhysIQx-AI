import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div>
        <h1 className="auth-page-title">Reset your password</h1>
        <p className="auth-page-sub">
          Enter your email and we&apos;ll send you a link to get back in.
        </p>
      </div>

      <ForgotPasswordForm />

      <Link href="/login" className="auth-back-link">
        <ArrowLeft size={14} aria-hidden />
        Back to log in
      </Link>

      <style>{`
        .auth-page-title {
          font-family: var(--font-display), ui-sans-serif, system-ui;
          font-size: 1.625rem; font-weight: 700; color: #fafafa;
          letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 0.25rem;
        }
        .auth-page-sub { font-size: 0.875rem; color: #a1a1aa; line-height: 1.5; }
        .auth-back-link {
          display: flex; align-items: center; justify-content: center;
          gap: 0.375rem; font-size: 0.875rem; font-weight: 500;
          color: #71717a; text-decoration: none; transition: color 0.15s;
        }
        .auth-back-link:hover { color: #22c55e; }
      `}</style>
    </>
  );
}
