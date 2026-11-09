/**
 * Supabase answers 5xx (often a 504) when its own side fails, most often
 * because the confirmation or reset email couldn't be sent through SMTP.
 * Nothing the person typed is wrong, so say that plainly instead of
 * showing "HTTP 504".
 */
export function isServerAuthError(error: { status?: number }): boolean {
  return (error.status ?? 0) >= 500;
}

export const EMAIL_SEND_FAILED =
  "We couldn't send the email just now. Please try again in a few minutes.";
