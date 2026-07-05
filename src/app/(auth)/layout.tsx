import { PageContainer } from "@/components/layout/PageContainer";
import { Logo } from "@/features/shared/components/Logo";

// Minimal centered frame per docs/ROUTES.md — no bottom nav, just the logo
// shared across login/signup/forgot-password. Server Component: nothing
// here needs client interactivity.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer withBottomNav={false} className="justify-center gap-6 pt-0">
      <Logo className="mx-auto" />
      {children}
    </PageContainer>
  );
}
