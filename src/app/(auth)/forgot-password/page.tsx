import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error } = await searchParams;

  return (
    <>
      <div>
        <h1 className="auth-page-title">Reset your password</h1>
        <p className="auth-page-sub">
          Enter your email and we&apos;ll send you a link to get back in.
        </p>
      </div>

      <ForgotPasswordForm linkInvalid={error === "reset_link_invalid"} />

      <Link href="/login" className="auth-back-link">
        <ArrowLeft size={14} aria-hidden />
        Back to log in
      </Link>
    </>
  );
}
