import { redirect } from "next/navigation";

// Entry redirect — middleware handles the three-way auth-state routing:
//   No session → /login
//   Session, no onboarding → /onboarding
//   Session + onboarded → /home
export default function RootPage() {
  redirect("/home");
}

