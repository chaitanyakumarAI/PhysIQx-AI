"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface SocialLoginButtonsProps {
  className?: string;
}

/**
 * Text-only, deliberately no brand icons. Lucide (the project's only
 * permitted icon source per docs/UI_Guideliness.md) has no Google/Apple
 * marks, and approximating them with a generic icon would misrepresent the
 * brand — safer to rely on clear labels than to bend the icon-library rule.
 */
export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  // Apple Sign-In requires an Apple Developer account — kept as a
  // visual placeholder until that's configured in the Supabase dashboard.
  function handleAppleLogin() {
    // TODO: Enable once Apple Developer account is configured
    console.warn("Apple Sign-In not yet configured");
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Button type="button" variant="secondary" size="lg" fullWidth onClick={handleGoogleLogin}>
        Continue with Google
      </Button>
      <Button type="button" variant="secondary" size="lg" fullWidth onClick={handleAppleLogin}>
        Continue with Apple
      </Button>
    </div>
  );
}
