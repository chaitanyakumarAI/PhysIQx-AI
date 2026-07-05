"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginSchema, type LoginFormValues } from "../schemas";
import { PasswordField } from "./PasswordField";

/**
 * Owns its own navigation (useRouter) rather than accepting an onSuccess
 * callback prop — this form is already a client component, and passing a
 * function down from a server-rendered page would fail the same way Home's
 * quickActions icons once did crossing that boundary.
 */
export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit() {
    // No backend yet — this is the seam where a real sign-in call would go.
    // The brief delay makes the loading state visible; it isn't simulating
    // real functionality.
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="flex flex-col gap-1.5">
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Link
          href="/forgot-password"
          className="self-end text-sm text-brand hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}
