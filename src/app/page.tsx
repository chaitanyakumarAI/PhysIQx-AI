import { redirect } from "next/navigation";

// Entry redirect per docs/ROUTES.md. Auth/onboarding aren't implemented yet
// (mock-data phase), so Home is the default landing; this becomes the real
// three-way auth-state redirect (auth/onboarding/home) later.
export default function RootPage() {
  redirect("/home");
}
