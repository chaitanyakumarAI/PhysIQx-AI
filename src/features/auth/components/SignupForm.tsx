"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signupSchema, type SignupFormValues } from "../schemas";
import { PasswordField } from "./PasswordField";

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Onboarding isn't built yet — straight to Home, matching the mock-phase
    // reality that every screen renders with Alex's identity already.
    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        label="Name"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        label="Password"
        autoComplete="new-password"
        helper="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}
