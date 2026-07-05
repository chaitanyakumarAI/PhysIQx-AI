import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Button type="button" variant="secondary" size="lg" fullWidth>
        Continue with Google
      </Button>
      <Button type="button" variant="secondary" size="lg" fullWidth>
        Continue with Apple
      </Button>
    </div>
  );
}
