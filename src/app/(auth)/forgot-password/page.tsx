import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Enter your email and we&apos;ll send you a link to get back in.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-foreground-secondary">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
