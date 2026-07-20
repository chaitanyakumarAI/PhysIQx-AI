"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "../schemas";

export function LoginForm() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormValues) {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      // Make error messages friendlier
      const msg =
        error.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : error.message;
      setAuthError(msg);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
      {/* Auth error banner */}
      {authError && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={15} aria-hidden />
          <span>{authError}</span>
        </div>
      )}

      {/* Email */}
      <div className="auth-field">
        <label htmlFor="login-email" className="auth-label">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
          {...register("email")}
        />
        {errors.email && (
          <span className="auth-field-error" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Password */}
      <div className="auth-field">
        <div className="auth-label-row">
          <label htmlFor="login-password" className="auth-label">
            Password
          </label>
          <Link href="/forgot-password" className="auth-forgot-link">
            Forgot password?
          </Link>
        </div>
        <div className="auth-input-wrapper">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={errors.password ? true : undefined}
            className={`auth-input auth-input--padded-right ${errors.password ? "auth-input--error" : ""}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="auth-eye-toggle"
          >
            {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </button>
        </div>
        {errors.password && (
          <span className="auth-field-error" role="alert">
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-submit-btn"
      >
        {isSubmitting ? (
          <>
            <span className="auth-submit-spinner" aria-hidden />
            Logging in…
          </>
        ) : (
          "Log in"
        )}
      </button>

      <style>{`
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.125rem;
        }

        /* Error banner */
        .auth-error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #f87171;
          line-height: 1.4;
        }

        /* Field */
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .auth-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #d4d4d8;
        }
        .auth-forgot-link {
          font-size: 0.8125rem;
          color: #22c55e;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.15s;
        }
        .auth-forgot-link:hover {
          opacity: 0.75;
          text-decoration: underline;
        }
        .auth-field-error {
          font-size: 0.8125rem;
          color: #f87171;
        }

        /* Input */
        .auth-input-wrapper {
          position: relative;
        }
        .auth-input {
          width: 100%;
          height: 3rem;
          padding: 0 1rem;
          font-size: 0.9375rem;
          color: #fafafa;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(39, 44, 40, 1);
          border-radius: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          -webkit-appearance: none;
        }
        .auth-input::placeholder {
          color: #52525b;
        }
        .auth-input:focus {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
        }
        .auth-input--error {
          border-color: rgba(239, 68, 68, 0.5);
        }
        .auth-input--error:focus {
          border-color: rgba(239, 68, 68, 0.6);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        .auth-input--padded-right {
          padding-right: 3rem;
        }
        .auth-eye-toggle {
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #71717a;
          cursor: pointer;
          display: grid;
          place-items: center;
          padding: 0.25rem;
          border-radius: 0.375rem;
          transition: color 0.15s;
        }
        .auth-eye-toggle:hover {
          color: #a1a1aa;
        }

        /* Submit button */
        .auth-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          height: 3.25rem;
          margin-top: 0.25rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #052e16;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border: none;
          border-radius: 1rem;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 0 24px -4px rgba(34, 197, 94, 0.5),
                      inset 0 1px 0 rgba(255,255,255,0.2);
          letter-spacing: -0.01em;
        }
        .auth-submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 0 32px -4px rgba(34, 197, 94, 0.6),
                      inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .auth-submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .auth-submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(5, 46, 22, 0.3);
          border-top-color: #052e16;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
