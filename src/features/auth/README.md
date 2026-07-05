# Auth Feature

Check here before adding an Auth component. Structurally different from
every other feature so far: **no data to fetch** — no `types.ts`, no
`mocks/`, no `api/getXData()`. Auth screens are pure forms and navigation,
not a read model. `Logo` used to live here; it moved to
`@/features/shared/components/` once Onboarding needed the same brand
moment at its Welcome step.

## Forms: React Hook Form + Zod

`schemas.ts` holds the Zod schemas (`loginSchema`, `signupSchema`,
`forgotPasswordSchema`); each form uses `useForm` + `zodResolver`. This is
the actual documented stack (`docs/PROJECT.md`: "Forms: React Hook Form,
Zod"), not a placeholder. An earlier pass hand-rolled `useState` validation
here instead, reasoning that `docs/DEVELOPMENT.md` scopes "Form Validation"
to Phase 2 separately from Phase 1's "Authentication UI" — reversed once it
was clear the docs are guidance, not a gate, and that Onboarding (a genuine
multi-step form) was about to need the same infrastructure regardless.

RHF's `register()` needs a real DOM ref, which required converting `Input`,
`TextArea` (components/ui), and this feature's `PasswordField` to
`forwardRef` — the one change this reversal made outside this folder.

## No design reference

Unlike every other feature, there is no screenshot for auth screens in
`/design`. Built from the design system's own tokens and conventions
(spacing scale, typography, `Card`/`Input`/`Button` primitives) rather than
matching a mockup — flagged explicitly since visual fidelity elsewhere in
this project means "matches the screenshot," and here it can't mean that.

## Components

| Component | Purpose |
|---|---|
| `AuthDivider` | "or" divider between social buttons and the email form |
| `SocialLoginButtons` | Google/Apple buttons — text-only, no brand icons (Lucide has none; approximating would misrepresent the brand) |
| `PasswordField` | Input + show/hide toggle, built from `Input`'s shared style tokens (same pattern as `SearchInput`) rather than wrapping `Input` itself. Promotion candidate to `components/ui` if Settings ever needs the same pattern. |
| `LoginForm` | Email + password. Owns its own `useRouter()` navigation — a client component calling it directly, not receiving it as a prop from a server page (would fail crossing that boundary). |
| `SignupForm` | Name + email + password. Navigates straight to `/home` — Onboarding isn't built, and inventing a placeholder `/onboarding` 404 when `/home` is a real, correct destination would be worse. |
| `ForgotPasswordForm` | Email only; shows an inline "check your email" confirmation, no navigation. The 400ms delay before that state is honest UX feedback (the loading state is otherwise imperceptible), not simulated backend functionality. |

## Deliberate non-change

The root redirect (`src/app/page.tsx`) still points straight to `/home`, not
`/login`. Per `docs/ROUTES.md`: "Phase 1: no real guard exists; all routes
render with mock identity." There's no session state to check yet, so
forcing every visit through login would be inventing enforcement the docs
explicitly say doesn't belong in this phase.
