import { Logo } from "@/features/shared/components/Logo";

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <Logo />
      <div>
        <h1 className="font-display text-3xl font-bold">
          Let&apos;s build your PhysIQ DNA
        </h1>
        <p className="mt-2 text-sm text-foreground-secondary">
          Six quick questions. No wrong answers — this just tunes your score,
          missions, and goals to you.
        </p>
      </div>
    </div>
  );
}
