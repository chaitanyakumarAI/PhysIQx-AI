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
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Log in to keep your streak alive.
        </p>
      </div>

      <LoginForm />
      <AuthDivider />
      <SocialLoginButtons />

      <p className="text-center text-sm text-foreground-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
