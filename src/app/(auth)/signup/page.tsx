import type { Metadata } from "next";
import Link from "next/link";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Start building your PhysIQ Score today.
        </p>
      </div>

      <SignupForm />
      <AuthDivider />
      <SocialLoginButtons />

      <p className="text-center text-sm text-foreground-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
