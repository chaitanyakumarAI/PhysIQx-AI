import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
};

/**
 * Where the password-reset email lands. Deliberately not in the middleware's
 * auth-route list: the link signs the athlete in, and those routes send
 * signed-in people to /home before they could set the password.
 */
export default function ResetPasswordPage() {
  return (
    <>
      <div>
        <h1 className="auth-page-title">Choose a new password</h1>
        <p className="auth-page-sub">Pick one you don&apos;t use anywhere else.</p>
      </div>

      <ResetPasswordForm />

      <Link href="/login" className="auth-back-link">
        <ArrowLeft size={14} aria-hidden />
        Back to log in
      </Link>
    </>
  );
}
