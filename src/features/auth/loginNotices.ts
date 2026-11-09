/**
 * Messages the login page shows after an email link bounces through
 * /auth/callback (see that route for when each one is sent).
 */
export const LOGIN_NOTICES = {
  email_confirmed: { tone: "success", text: "Email confirmed. Log in to continue." },
  link_expired: {
    tone: "error",
    text: "That link has expired or was already used. Log in, or sign up again for a new link.",
  },
  callback_failed: { tone: "error", text: "Sign-in didn't finish. Please log in again." },
} as const;

export type LoginNotice = keyof typeof LOGIN_NOTICES;

export function isLoginNotice(value: string | undefined): value is LoginNotice {
  return value !== undefined && Object.hasOwn(LOGIN_NOTICES, value);
}
