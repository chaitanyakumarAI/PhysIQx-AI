import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { Logo } from "@/features/shared/components/Logo";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

/**
 * Dev-only verification harness for the Auth feature's static building
 * blocks (Logo, divider, social buttons, the password show/hide toggle and
 * its error state). The forms themselves are best checked on the real
 * pages — linked below — since they navigate on success. Not a screen.
 *
 * Server Component: every prop passed to PasswordField below is a plain
 * string, so nothing here requires "use client" — PasswordField carries its
 * own client boundary internally.
 */
export default function AuthPlaygroundPage() {
  return (
    <PageContainer withBottomNav={false}>
      <Section title="Auth feature — component preview">
        <Logo />
        <PasswordField label="Password" placeholder="••••••••" />
        <PasswordField label="Password" defaultValue="short" error="Password must be at least 8 characters" />
        <AuthDivider />
        <SocialLoginButtons />
      </Section>

      <Section title="Real pages">
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/login" className="text-brand hover:underline">/login</Link>
          <Link href="/signup" className="text-brand hover:underline">/signup</Link>
          <Link href="/forgot-password" className="text-brand hover:underline">/forgot-password</Link>
        </div>
      </Section>
    </PageContainer>
  );
}
