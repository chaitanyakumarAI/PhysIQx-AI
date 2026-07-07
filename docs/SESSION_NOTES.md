# Session Notes — July 7, 2026

A full record of decisions, evaluations, and future directions discussed in this session.

---

## 1. Project Health Audit

A full technical audit was performed across the entire codebase.

### Outcomes

- **TypeScript:** Zero errors (`npx tsc --noEmit` clean).
- **ESLint:** Zero warnings (`npm run lint` clean).
- **Production build:** All 25 routes build successfully. 24 static, 1 dynamic (`/session/[id]`).
- **Git status:** 37 files modified since last commit, 7 new untracked files — all part of an active refactoring pass (pillar model, settings routes, shared components).
- **One bug fixed:** `RadarChart.tsx` had a React 19 `<title>` array children warning. Fixed by converting to a template string.

### Unstaged Work (Not Yet Committed)

The following changes are sitting in the working tree and need a commit:

- **Scoring model upgraded:** 4-pillar system → 6-pillar system (Consistency 25%, Strength 20%, Cardio 20%, BMI 15%, Body Shape 12%, Water 8%). Both `docs/PHYSIQ_SCORE.md` and `docs/DATA_MODELS.md` updated to match.
- **`HealthPillarSummary.tsx` deleted** — replaced by the shared `PillarGrid` component.
- **`OptionCard` promoted** from `features/onboarding/` to `components/ui/` — needed by the new Settings appearance page.
- **`StatTile` added** to `components/ui/` — bento-grid density pass for the pillar breakdown.
- **`Switch` added** to `components/ui/` — first use is the Settings notifications page.
- **Settings sub-routes built:** `/profile/settings/appearance`, `/profile/settings/notifications`, `/profile/settings/privacy`, `/profile/settings/export` — all untracked, not yet committed.
- **`PillarGrid` promoted** to `features/shared/components/` — used on both Home and Insights.
- **`lib/score.ts` created** — `computeWeightedScore` and `findWeakestPillar` extracted from a single-feature derive module into a shared library.
- **`BodyBalanceCard` updated** — now renders the same 6 pillars as Home, resolving the old 4-pillar/6-axis mismatch.

**Recommended next commit message:**
```
feat: 6-pillar scoring model, settings routes, shared PillarGrid
```

---

## 2. Four-Perspective Critical Evaluation

### 🏋️ Fitness Specialist View — 7/10

**Strengths:**
- Consistency-first scoring philosophy is scientifically correct.
- `rest-honored` DayStatus concept respects recovery science.
- 6-pillar model is well-reasoned (removed vague "Recovery" and "Nutrition" pillars that require wearables or exhaustive food logging).
- Rest timer between sets is genuinely useful and science-backed.
- PPL/Upper-Lower/Full Body program options are evidence-based.

**Gaps Identified:**

| Gap | Priority |
|---|---|
| No cardio logging — Cardio is 20% of score but has no input screen | 🔴 Critical |
| No progressive overload — session logs but never suggests next weight | 🔴 Critical |
| RPE field exists in types but `SetRow` doesn't expose it | 🟡 High |
| Protein/water defaults in onboarding have no explanation for beginners | 🟡 High |
| BMI is scientifically weak for athletic users (high muscle = "obese") | 🟠 Medium |
| No warm-up set vs. working set tagging (volume calculations skewed) | 🟠 Medium |

---

### 💻 App Developer View — 9/10

**Strengths:**
- The SSR hydration solution (`skipHydration: true` + `StoreHydrator`) is a sophisticated, correct solution to the localStorage/SSR race condition that most developers get wrong.
- Feature-scoped architecture with `src/data/` as the single-source-of-truth mock layer is cleaner than most production codebases.
- Server Components fetch and pass only serializable props to client components — no boundary violations.
- `LazyMotion` with `m.` components (not `motion.`) is the correct Framer Motion performance pattern.

**Risks Identified:**

| Risk | Severity |
|---|---|
| `lucide-react@1.23.0` is not a real published version — verify with `npm list lucide-react` | 🔴 High |
| Zero unit tests for `lib/score.ts`, explicitly called out as "the most unit-tested code in the app" in docs | 🔴 High |
| Onboarding data is silently discarded — must wire to `createProfile()` in Phase 3 | 🟡 Medium |
| Session store holds one slot — starting a second mission silently overwrites the first | 🟡 Medium |
| No `.gitattributes` — 35+ CRLF line ending warnings on every `git diff` | 🟠 Low |

---

### 🤖 AI Expert View — 7/10

**Strengths:**
- "One scoring brain, many mouths" separation is textbook correct AI system design — AI Coach reads score outputs, never computes its own.
- Required `headline` field on `PhysIQScoreSnapshot` ensures context is never omitted from a bare number.
- `celebrate | suggest | warn` severity model maps directly to behavioral science.
- `fresh | seen | acted | expired` insight state model prevents noise fatigue.

**Risks Identified:**

| Risk | Severity |
|---|---|
| `Insight.body` has a "≤ 2 sentences" contract documented but not enforced — real LLMs will violate it | 🔴 High |
| "AI Programmed" badge and "AI" program are on hardcoded mock data — sets user expectations that Phase 6 must meet | 🟡 Medium |
| AI program generation pipeline (LLM → structured `WorkoutTemplate`) needs architecture design before Phase 6, not during | 🟡 Medium |
| Deterministic `generateHeadline()` stub not built — Phase 6 AI replacement will be a retrofit, not a clean swap | 🟠 Low |

---

### ⚡ Performance Optimist View — 8/10

Current bundle: ~102 KB shared JS, 135 KB for `/home`, 166 KB for `/onboarding`.

**Quick wins (zero quality loss):**

| Fix | Estimated Saving |
|---|---|
| Lazy-load Recharts only on `/insights` route | ~15 KB from all tab routes |
| Restrict `Space_Grotesk` to `weight: ["600", "700"]` | ~15–25 KB fonts |
| Verify `domAnimation` not `domMax` in `MotionProvider` | up to ~9 KB |

**Notable good decision already made:**
The `RadarChart` was built as a **pure custom SVG**, not using Recharts. This saves ~35 KB from the Insights route for a single chart.

---

## 3. Video / Animation Discussions

### Exercise Demo Animations

**Decision: Use Lottie or Rive — not actual video files.**

| Format | File Size | Personalization | Interactivity |
|---|---|---|---|
| MP4 video | 2–15 MB each | No | No |
| Lottie JSON | 15–80 KB each | Limited | Plays/pauses |
| Rive | 20–100 KB each | Full | State machine |

The correct UX pattern in all cases is **thumbnail-first**: show a static thumbnail image, load and play the animation only when the user taps. Users who never tap a demo download zero bytes for it.

Animation files live in `public/animations/` — they are static assets served by Next.js, not bundled into JS. The app bundle itself does not grow with the number of animations.

### Personalized Animations

**Decision: Rive is the correct tool for personalized, data-driven body animations.**

Rive uses a **state machine** system where you define inputs in the animation editor, then drive them from React code:

```tsx
// Set animation state from the user's profile
buildInput.value = user.experienceLevel === "advanced" ? 80 : 40;
goalInput.value  = user.goal === "bulk" ? 100 : 20;
```

This enables:
- **Onboarding body shape selection** — silhouette morphs as user picks their body type.
- **Exercise demos** — the animated figure matches the user's build (lean, balanced, bulky).
- **Home screen figure** — future: body visually reflects pillar progress over time (the "Tamagotchi effect").

**Bundle cost:** `@rive-app/react-canvas` is ~40 KB gzipped, added once. Each `.riv` file is lazy-loaded on demand.

**Creation path:**
1. Build animation in the free Rive editor at rive.app — define the state machine inputs.
2. Export as `.riv` file, place in `public/animations/`.
3. React code drives the state machine from user profile data.

Alternatively, hire a Rive animator ($50–$300 per animation on Fiverr/Upwork) if the in-house design skill is not available.

---

## 4. Open Decisions (Requires Action)

| Decision | Owner | Phase |
|---|---|---|
| Choose video hosting service for workout demos (Mux vs Cloudflare Stream vs YouTube) | Product | Phase 5 |
| Commission or create Rive animations for exercise demos | Design | Phase 5 |
| Commission or create Rive body shape animation for onboarding | Design | Before onboarding polish |
| Add unit tests for `lib/score.ts` | Engineering | Before Phase 5 |
| Decide: replace BMI pillar with Weight Trend | Product | Phase 4 |
| Design AI program generation pipeline (LLM → WorkoutTemplate) | Engineering | Phase 5 |
| Build cardio session logging screen | Engineering | Phase 5 |
| Add progressive overload suggestion to session screen | Engineering | Phase 5 |
| Commit current unstaged work | Engineering | Now |
| Verify `lucide-react` actual installed version | Engineering | Now |
| Add `.gitattributes` for LF line endings | Engineering | Now |
