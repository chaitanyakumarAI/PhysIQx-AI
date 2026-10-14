# PhysIQx — Master Plan

Created 2026-10-14. Draft for discussion. Once we agree on items, the
accepted ones get folded into `docs/TODO.md`, which stays the live checklist.

## Your decisions (2026-10-14)

- **Go:** implement the plan; big changes are approved where they're needed.
- **No AI coach for now.** Instead, a deterministic Coach recommendation
  engine with a solid algorithm (new item **K1**). `/coach` stays off.
- **Hydration/water is not part of the app.** Remove every trace (A9 widened).
- **Cardio sync must be rock-solid** (new item **K2**: a provider-agnostic
  sync pipeline with deduplication, retries and honest connection states).
- **Full UI/UX overhaul is approved** (new Track **U**). This is the "Polish"
  phase the earlier design decision deferred.
- Open decisions without an answer use **my call** from the tables below.

| ID | What & why | Effort |
|---|---|---|
| K1 | **Coach engine:** a ranked recommendation from real data (plan adherence, recovery/training load, PR readiness, stalled lifts, weakest pillar, comeback after a break, rest-day guidance), with one clear action each. No mascot art and no sci-fi copy. | L |
| K2 | **Cardio sync pipeline:** a provider adapter interface, one normalised activity model, deduplication across sources (time-overlap matching), an idempotent upload queue with backoff, per-provider status (connected / syncing / error / last synced), and file import (GPX/TCX) as the first real source that works on the web. | L |
| U | **UI/UX overhaul:** refresh design tokens and typography (mono numerals for hero stats), tighter Home hierarchy (one primary action), bento density where it helps, consistent empty and loading states, motion polish across every screen. | L |

## Progress & replan — after Sprints 1–2 (2026-10-14)

**Verified:** 223 unit tests passing, 0 type errors, 0 lint errors, and a
clean production build. A full browser run as a new user went through
first run → onboarding → workout from Home → finish → Insights → Profile
→ cardio import → demo mode.

### Done

| Sprint | Shipped |
|---|---|
| 1 (`75630bb`) | A1–A7, A9, A11 (validated sets, ghost-value completion, local dates, XP by work done, barbell-only plates, e1RM cap, 1,000-workout history), A6 seeded photos removed, G7, I1 CI, I3/I4 dead code + lint |
| 2 (`a6cf2bd`) | **B1** one local ledger feeding every screen through `lib/athleteState`, **B2** demo mode, **B3** onboarding drives plan/profile/score, **B4** fixture seams deleted, **C1–C3** Score v4, **K1** coach engine, **D1** Training Load, **D2** honest integrations, **D4** strength standards from real data, **E1–E3** plan-day sessions + rotation + personalized starter plan, **F1** About-you + build picker, **F5**, **A8**, **A10** streak, **K2** cardio import/dedup/outbox sync (G5), migration 005 |

### What testing found (still open)

| # | Finding | Fix in |
|---|---|---|
| T1 | Body Stats mixes a **seeded fake weight history** with real weigh-ins; the "digital twin" shows the *goal* physique, not the current build; there's no way to update the build later | S3 |
| T2 | Calendar is hardcoded to "Push Pull Legs" instead of the active plan | S3 |
| T3 | Notifications are **seeded fakes** (badge shows "4" on a brand-new account) | S3 |
| T4 | New accounts get a stock-photo avatar instead of initials | S3 |
| T5 | Guided tour: the first tap after "Skip" is swallowed; several tour stops point at elements Home no longer has | S3 |
| T6 | Insights: coach cards lose their titles; the PR picker lists every lift (25 in demo); calibration copy ignores "day N of 7" | U |
| T7 | History: "Time under bar" is really session duration; "377.5k kg"-style formatting (I8) | U |
| T8 | Accessibility: `Input` labels aren't associated (fields announce their placeholder) | U |
| T9 | Compete is still entirely fictional (D3) | S3 |
| T10 | Login/sign-up/sync to Supabase not exercised; migrations 001–005 must be applied to the live project; profile, plans and weigh-ins don't sync yet; a new device can't restore from the cloud | S4 |

### Revised order

1. **Sprint 3 — finish the truth pass (small, no decisions):** T1–T5, T9
   (Compete → personal weekly challenge from the ledger + "Coming soon"
   for social), retire the unused Phase-6 overlay components and
   `GenerateProgramScreen` (content files stay), remove stale docs (I6).
2. **Track U — UI/UX overhaul (the big one):** design system first, then
   screen by screen, Home → Session → Train → Insights → Profile/Body →
   Onboarding → Cardio/Compete → Settings. I'll show Home first before
   rolling the style out. T6–T8 land here.
3. **Sprint 4 — cloud:** apply migrations, generated DB types (G2),
   atomic workout RPC (G4), RLS hardening (G6), sync profile/plans/weigh-ins,
   restore-on-sign-in, auth flow test (T10).
4. **Launch track (J)**, image compression (I5), Strava (G8) when you want it.

## How to use this

- Every item has an ID, an effort size, **my call** (Do / Later / Drop), and a
  **Your call** column. Fill that in, or just tell me in chat ("A7 skip, D3 hide").
- Items marked **Decision** change product behaviour. I won't build them
  without your answer.
- Effort: **S** = under an hour · **M** = a few hours · **L** = a day or more.
- "(audit 2.4)" points to the finding in `docs/APP_AUDIT.md`.

## Where we stand

- **Healthy:** 142/142 tests pass, the type check is clean, the build passes
  (fixed in `ea59cf1`), shared JS is 102 KB, and the offline-first engines are solid.
- **The real problem:** `APP_AUDIT.md` (2026-09-29) found about 60 issues. I
  re-checked them against the code today and **nearly all are still open**. Work
  since then went into the coach characters and chat. The biggest issue is that
  the app has three different "truths": server mock fixtures, local stores and
  hardcoded constants. On one fresh device, a new user sees "Alex", a 27-day
  streak and a score of 84 on Profile, and "Calibrating" on Home.
- **My recommendation:** pause new features (Phase 6/7) until Tracks A–D land.
  Trust first, then delight.

---

## Track A — Data-integrity bugs (do now, no decisions)

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| A1 | **Set validation.** A blank set can be ticked complete, and −20 kg × 500 reps is accepted. That produced −9,200 kg of volume in History. (audit 2.1, 2.2) | S | Do | |
| A2 | **Cap e1RM reps at 10.** `MASTER_BRIEF` says reps are capped; `prEngine` doesn't cap them, so 500 reps gives an absurd 1RM. (2.8) | S | Do | |
| A3 | **Finished workouts are saved with status "active"** because `summarize()` runs before the status changes. History badges show "active". (2.4) | S | Do | |
| A4 | **Workout date uses UTC.** A workout in India between 00:00 and 05:30 is filed under yesterday, which breaks the streak and calendar. (2.6) | S | Do | |
| A5 | **The Plates button shows on every exercise**, including cable fly and lateral raise. Show it on barbell lifts only. (2.5) | S | Do | |
| A6 | **Three fake progress photos are written into the user's saved data** and get exported as theirs. Remove the seed. (7.2) | S | Do | |
| A7 | **The full +320 XP is awarded for any finish**, even 3 sets in 6 seconds. Proposed rule: XP = base × completed ÷ planned sets. (2.3) | S | Do | |
| A8 | **Today's Mission never marks itself done.** After finishing, Home still shows the play button. (2.9) | S | Do | |
| A9 | **Leftovers:** Compete feed says "started 30-day hydration challenge"; Preferences offers a mascot toggle while mascots are off; recovery code comments still mention hydration. (6.2, 7.6) | S | Do | |
| A10 | **Two streak implementations.** Home uses the strict one, where a rest day resets the streak. That breaks "never punish the lifter". Unify on the forgiving `streakEngine`. (10.6) | M | Do | |
| A11 | **Local history is capped at 60 sessions.** Guests silently lose older workouts after about 3 months, and PRs and the heatmap lose data. Raise to about 1,000 (~1.5 MB); move to IndexedDB later. (10.4) | M | Do | |

## Track B — One source of truth (architecture)

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| B1 | **Local ledger layer.** Sessions, cardio, weigh-ins and profile/onboarding live in client stores. Every screen derives from them, and Supabase becomes a sync target, not a second source. Fixes the "three truths" problem. (audit §0) **Decision:** approve the architecture. | L | Do | |
| B2 | **Demo mode.** Mocks only appear behind an explicit toggle or seeded demo account, never as a silent fallback. **Decision:** keep a demo mode at all? It's useful for showing the app to people. | M | Do | |
| B3 | **Onboarding answers drive the app:** Profile, Home mission, archetype, PhysIQ Split days. Today nothing reads them. (9.2, 3.5, 7.1, 4.4) | M | Do | |
| B4 | **Data seams return a typed "unavailable" state** instead of catch-and-return-mock. Also stops the build-log noise. (10.8) | S | Do | |
| B5 | **Cross-screen tests:** finishing a workout must update history, streak, score, profile and achievements consistently. Nothing tests this today. (12.5) | M | Do | |
| B6 | **Designed empty states for every screen.** Once mocks are gone, a new user sees real emptiness, and it needs to look intentional. (11.5) | M | Do | |

## Track C — PhysIQ Score v4 (formulas need your sign-off)

The current `scoreEngine.ts` doesn't follow `PHYSIQ_SCORE.md`:
- Consistency mixes sessions per month with a weekly target.
- The first workout lowers the Consistency pillar.
- Strength is a volume step function.
- Cardio is hardcoded to 70.
- Body Shape just checks "has a goal?".
- Delta and the 7-day trend are fabricated.
- It only runs server-side, so guests never get a real score.

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| C1 | **One pure `computeScoreSnapshot(ledger, profile, date)`** shared by client and server. Works offline and for guests. | L | Do | |
| C2 | **Pillar formulas.** Consistency = planned-vs-trained adherence over 4 weeks, rest days honoured. Strength = e1RM vs bodyweight standards. Cardio = weekly minutes vs 150, left out of the score if the user never tracks cardio. Body Shape = selected build adjusted by height/sex/age (per `MASTER_BRIEF`). **Decision:** I'll bring exact formulas and worked examples to approve. | M | Do | |
| C3 | **Daily snapshots** give a real delta and real 7-day trend; "Calibrating" until there's enough data. | M | Do | |

## Track D — Honesty pass

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| D1 | **Recovery screen** claims "Neuromuscular Excitability", "Autonomic Balance" and a "Banister model". It's really simple formulas, and its workload ratio means nothing before 4 weeks of data. Rename to "Training Load", show only what we can compute, and hide the ratio until 28 days. (5a) **Decision.** | M | Do | |
| D2 | **Integrations** shows Apple Health and Garmin as "connected · synced 4 mins ago". That's fake. A web app can't read HealthKit or Health Connect at all. Show honest "Not connected / Coming soon" states. (8.1, 8.2) | S | Do | |
| D3 | **Compete is entirely fictional:** "2,842 athletes", named users, live feed, cheer wall. Options: (a) hide the tab, (b) keep the personal parts (your weekly challenge, your XP) and mark the social parts "Coming soon", (c) build it for real (needs a backend). **Decision.** I recommend (b). | M | Do (b) | |
| D4 | **Strength Standards** uses a fixed bodyweight instead of the latest weigh-in, the sex they depend on is never asked, and the 1RMs are editable on a page that says they're "estimated". Fix after F1. (5b) | M | Do | |
| D5 | **Insights coach suggests a "20-min zone-2 walk"** although cardio nudges were removed from Home. Should Insights stay strength-only too? (5.2) **Decision.** | S | ? | |

## Track E — Training & session experience

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| E1 | **Program days become real sessions.** Only one mission ("Push-Heavy") exists. Program days and the PhysIQ Split can't launch their own workouts. Highest-value product item. (2.10) | L | Do | |
| E2 | **Today's Mission = the next day of your active plan**, rotated using history ("Pull today — you pushed yesterday"). Needs E1. | M | Do | |
| E3 | **Personalise the PhysIQ Split** from onboarding. The logic exists in `GenerateProgramScreen` but has no route; it opens on 3 days even when you said 4. (4.4) | M | Do | |
| E4 | **Wire adaptive difficulty** (deload when average RPE ≥ 9) into next-session suggestions. Logic and tests exist but aren't connected. | M | Later | |
| E5 | **"Your last / best" on exercise detail pages.** `ExerciseHistoryCard` exists but is unrouted; it was archived earlier. (4.3) **Decision.** | S | Do | |
| E6 | **Rest timer:** a chime or notification when the app is in the background; voice announcements off by default (surprising in a gym). (2.12) | M | Do | |
| E7 | **Easier-to-scan exercise list:** muscle-group icons or colours instead of the same dumbbell everywhere, and label the unexplained % badge. (4.1, 4.2) | S | Later | |
| E8 | **kg/lb units.** The setting exists in the types, but there's no UI and everything shows kg. **Decision:** do your target users need lb? | M | ? | |

## Track F — Onboarding & first week

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| F1 | **"About you" onboarding step:** name, sex, bodyweight, height, age. Strength standards, the Body Shape score and BMI all need them, and none are asked today. (9.1) | M | Do | |
| F2 | **Guest-first or sign-in-gated?** The middleware documents a 3-way guard but lets everyone through. I recommend guest-first (fits offline-first), plus a prompt to create an account to back up data after the first workout. (9.4) **Decision.** | S | Guest-first | |
| F3 | **Hide the disabled "Continue with Apple" button** until it works. (9.5) | S | Do | |
| F4 | **Honest day-0 Home:** no fake streak, and the week strip shows only real days. Today "Saturday" is hardcoded as today. (3.1, 3.2) | M | Do | |
| F5 | **"Twice a day" frequency** is collected and never used. Use it or drop the question. (9.3) **Decision.** | S | Drop | |

## Track G — Backend, sync & security

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| G1 | **Schema mismatch.** Insights reads `title`, `mission_id`, `duration_seconds` and `sets_completed`; none of those columns exist, so signed-in users get zeros. (10.1) | S | Do | |
| G2 | **Generate database types** (`supabase gen types`) so a mismatch like G1 fails the type check. | M | Do | |
| G3 | **Missing tables** for weigh-ins, plans and preferences, so that data never leaves the device. Drop the leftover hydration table from migration 002. (10.2) | M | Do | |
| G4 | **Atomic workout save** through one Postgres function. Today a partial failure plus a retry can duplicate sets. (10.5) | M | Do | |
| G5 | **Sync queue:** guests' workouts are re-queued forever with no limit or backoff, and people without an account see "1 workout pending sync". (10.3) | S | Do | |
| G6 | **Security.** `xp_transactions` and `sessions` allow every operation to the row owner, so anyone can insert any XP or volume using the public key. Compute XP server-side and allow inserts only through a function. Must land before any real leaderboard. | M | Do | |
| G7 | **One failed reachability check puts a signed-in user into offline mode for 5 minutes.** Shorten that to about 15 seconds and remove the duplicate copy of the check. (10.7) | S | Do | |
| G8 | **Strava as the first real cardio source:** the cheapest real integration from a web app. **Decision.** | L | Later | |
| G9 | **Apple Health / Health Connect** need a native wrapper (e.g. Capacitor). | L | Later | |

## Track H — Kix & Nyra (Phase 6/7)

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| H1 | **Redesign the briefing and explainer screens.** **Decision:** now, or after A–D? I recommend after; the characters would otherwise be narrating wrong numbers. | L | After A–D | |
| H2 | **`CoachRecommendationWidget` is still on Home** and reads the same mixed mock/live data. Keep it, or hide it until B1? | S | Keep | |
| H3 | **Phase 7 video series** is marketing content, not app code. I can draft scripts if you want. **Decision.** | M | ? | |
| H4 | **Mascots stay hidden** until you decide how to bring them back. | — | Your call | |

## Track I — Engineering health

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| I1 | **CI** (GitHub Actions): lint + type check + tests + build on every push. It would have caught the broken build. | S | Do | |
| I2 | **End-to-end smoke test** (Playwright): onboarding → workout → history. | M | Do | |
| I3 | **Dead code:** the Fuel/nutrition suite (its store still loads on every start), the chat coach, PlateCalculatorScreen, MuscleAnatomyVisualizer, ExerciseDemoPlayer, MovementFormGuide, and the `/playground/*` and `/hologram-demo` routes, which ship in production. Delete them (git keeps history, `FUTURE_WORK.md` documents them), except pieces reused by E3/E5. **Decision.** | M | Delete | |
| I4 | **112 lint warnings**, mostly unused imports. | S | Do | |
| I5 | **Images:** `public/body-shapes` is 41 MB of PNGs at 0.4–1.1 MB each. Converting to WebP at ≤ 150 KB brings it to about 5 MB. (12.2) | M | Do | |
| I6 | **Too many docs (24)** with overlap and stale claims (e.g. the handoff said the build was clean). Keep the core set, move the rest to `docs/archive/`. **Decision**, since docs are frozen unless you say so. | M | Do | |
| I7 | **`npm run lint` and the build run different linters** (`eslint .` vs `next lint`). Align them. | S | Do | |
| I8 | **One `formatKg()` helper** to stop "59.0k kg" and "82.5k"; one brand-spelling rule. (11.2, 11.4) | S | Do | |

## Track J — Launch readiness (timing is your call)

| ID | What & why | Effort | My call | Your call |
|---|---|---|---|---|
| J1 | **Hosting:** Vercel plus a production Supabase project, env setup and preview deploys. **Decision.** | M | ? | |
| J2 | **Error monitoring** (Sentry or similar), an external service. **Decision.** | S | ? | |
| J3 | **Account deletion and a privacy policy.** Data export already exists. | M | Before launch | |
| J4 | **PWA polish:** install prompt, icons, offline-page check. | M | Before launch | |

## Parked — recommend not building now

- **Conversational coach (`/coach`):** you deferred it; keep it deferred.
- **Fuel / nutrition / barcode scanner:** outside a lifting-first product; delete with I3.
- **Hydration:** removed by your directive; only clean up leftovers (A9).
- **Real AI (WebLLM), pose estimation, Three.js hologram, Rive onboarding, WebM exercise clips:** high cost, low value until the core numbers are trustworthy.

---

## Proposed order

1. **Sprint 1 — Stop the bleeding:** A1–A11, G1, G5, G7, I1, I4, I7. No decisions needed.
2. **Sprint 2 — One truth:** B1–B6, F1, F3, F4, D2. Needs B1, B2, F2.
3. **Sprint 3 — Score v4:** C1–C3, D1, D4. Needs formula sign-off.
4. **Sprint 4 — Training core:** E1–E3, E5, E6.
5. **Sprint 5 — Backend & cleanup:** G2–G4, G6, I3, I5, I8.
6. **Then:** Kix & Nyra redesign (H1), Compete (D3), launch track (J).

## Decisions needed from you

B1 · B2 · C2 · D1 · D3 · D5 · E5 · E8 · F2 · F5 · G8 · H1 · H3 · I3 · I6 · J1 · J2
