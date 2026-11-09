"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { EMAIL_SEND_FAILED, isServerAuthError } from "../authErrors";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas";

export interface ForgotPasswordFormProps {
  /** The last reset link didn't work (expired, used, or another browser). */
  linkInvalid?: boolean;
}

export function ForgotPasswordForm({ linkInvalid = false }: ForgotPasswordFormProps) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(
    linkInvalid
      ? "That reset link has expired or was opened in a different browser. Send a new one and open it in this browser."
      : null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setAuthError(null);
    const supabase = createClient();
    // The link signs the athlete in for this one purpose and lands on the
    // page where they choose the new password. It used to land on /login,
    // which sends signed-in people to /home — so the password never changed.
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setAuthError(isServerAuthError(error) ? EMAIL_SEND_FAILED : error.message);
      return;
    }

    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <p
        role="status"
        className="rounded-card border border-brand/20 bg-brand/10 p-4 text-center text-sm text-foreground-secondary"
      >
        Check <span className="font-semibold text-foreground">{sentTo}</span>{" "}
        for a link to reset your password.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {authError && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {authError}
        </div>
      )}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}
