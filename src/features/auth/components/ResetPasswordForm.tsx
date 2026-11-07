"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "./PasswordField";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas";

type Status = "checking" | "ready" | "no-session" | "done";

/**
 * The page a password-reset email lands on (via /auth/callback, which signs
 * the athlete in for this purpose). Without that session — an expired link,
 * or one opened in a different browser — there's nothing to update, so it
 * says so and offers a new link instead of failing on submit.
 */
export function ResetPasswordForm() {
  const [status, setStatus] = useState<Status>("checking");
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    let cancelled = false;
    void createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!cancelled) setStatus(data.user ? "ready" : "no-session");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(values: ResetPasswordFormValues) {
    setAuthError(null);
    const { error } = await createClient().auth.updateUser({ password: values.password });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setStatus("done");
  }

  if (status === "checking") {
    return <p className="text-center text-sm text-foreground-secondary">Checking your link…</p>;
  }

  if (status === "no-session") {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          This reset link has expired or was opened in a different browser. Send a new one and
          open it in this browser.
        </p>
        <Link
          href="/forgot-password"
          className="text-center text-sm font-semibold text-brand hover:text-brand-strong"
        >
          Send a new reset link
        </Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-card border border-brand/20 bg-brand/10 p-4 text-center text-sm text-foreground-secondary"
        >
          Your password is changed and you&apos;re signed in.
        </p>
        <Link
          href="/home"
          className="inline-flex h-12 items-center justify-center rounded-field bg-brand text-sm font-semibold text-zinc-950 hover:bg-brand-strong"
        >
          Continue to PhysIQx
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {authError && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {authError}
        </div>
      )}
      <PasswordField
        label="New password"
        autoComplete="new-password"
        helper="At least 8 characters."
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Type it again"
        autoComplete="new-password"
        error={errors.confirm?.message}
        {...register("confirm")}
      />
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Save new password
      </Button>
    </form>
  );
}
