import { PageContainer } from "@/components/layout/PageContainer";

// Step-flow layout per docs/ROUTES.md: "progress, no tabs". Progress and the
// back control are owned by OnboardingFlow itself (they're step-driven
// state, not static chrome), so this layout is a thin frame — no persistent
// logo here, unlike (auth): the Welcome step shows it once as content, not
// as chrome competing with the progress bar on every subsequent step.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageContainer withBottomNav={false}>{children}</PageContainer>;
}
