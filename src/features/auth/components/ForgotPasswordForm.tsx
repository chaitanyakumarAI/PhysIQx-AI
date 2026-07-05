"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    // No backend yet — this is the seam where a real reset email would send.
    // The delay is honest UX feedback (the loading state is otherwise
    // imperceptible), not a simulation of real functionality.
    await new Promise((resolve) => setTimeout(resolve, 400));
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
