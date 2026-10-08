import { notFound } from "next/navigation";

// The conversational AI Coach is deferred to a future version
// (docs/FUTURE_WORK.md #1). The route is disabled; the UI and engine are
// kept in CoachScreen.tsx and src/lib/aiCoachChat.ts for reinstatement.
export default function CoachPage() {
  notFound();
}
