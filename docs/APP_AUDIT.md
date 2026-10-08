# PhysIQx — App Audit (2026-09-29)

How this was run: production build (`next build` + `next start`) in a clean
workspace, driven with Playwright at a 390×844 phone viewport, as a **guest
with no Supabase keys** (so every screen shows what a new, not-signed-in user
sees). Walked all 33 routes, ran a real workout (blank set, normal set, bad
input), finished it, completed onboarding, then re-checked every screen.
Code for scoring, stores, sync, and the Supabase seams was read alongside.
Only difference from your machine: Google Fonts were self-hosted for the test
because the sandbox can't reach fonts.googleapis.com.

Severity: **P0** = wrong data / broken trust · **P1** = real bug or
misleading UX · **P2** = polish / tech debt.

---

## 0. The one root problem

**The app has three different "truths" and screens pick different ones.**

| Source | Who reads it |
|---|---|
| Server mock fixtures (`features/*/mocks`) — returned for every guest | Profile, Insights score/PR chart/heatmap, Compete, Recovery card |
| Client Zustand stores (localStorage) | Home streak & week, History, Calendar, Strength Standards, Session |
| Hardcoded constants in components/engines | Integrations, Recovery dimensions, hydration defaults |

Result, on one fresh device, same minute:

- Home score: **Calibrating** · Insights score: **84** · Profile: **84 PhysIQ Score**
- Home streak **1 day** (after my workout) · Profile streak **27d**, **148 sessions**
- History: **1 session** · Profile: **148 sessions**, **42,650 XP** vs History **+320 XP**
- Onboarding answered **Bulk / PPL / 4 days** → Profile still shows **Cut / PPL / 5 days**, name **"Alex"**, archetype **"Endurance-forward hybrid athlete"**
- Bench: History top set 100 kg × 8 → Strength Standards **126.5 kg e1RM (Advanced)**; PR chart still **92.5 kg** (mock)

**Fix direction (P0):** one client-side "ledger" layer (sessions, cardio,
weigh-ins, profile) that every screen derives from, with Supabase as a
sync target, not a second source. Mocks become an explicit **demo mode**
(a toggle / seeded demo account), never a silent fallback for real users.
Everything below gets easier once this exists.

---

## 1. Scoring logic (PhysIQ Score) — `lib/scoreEngine.ts`

The code doesn't follow `docs/PHYSIQ_SCORE.md`.

| # | Finding | Sev |
|---|---|---|
| 1.1 | **Consistency** = sessions in last **30 days** ÷ target days per **week** × 100. 4 sessions in a month on a 4-day plan = 100%. Unit mismatch. | P0 |
| 1.2 | Consistency with **0 sessions = 60**, with 1 session floors at **50** → logging your first workout *lowers* the pillar. | P0 |
| 1.3 | **Strength** = 30-day total volume step function (>10,000 kg → 92). One PPL session clears 10 t. Measures volume, not "getting stronger" (doc says PRs / load trends). | P0 |
| 1.4 | **Cardio** hardcoded `hasCardioLog: false` → always 70. Cardio logs are never read. | P0 |
| 1.5 | **Body Shape** = "has a goal body shape?" → 88 else 70. Not a measure of anything. | P1 |
| 1.6 | `delta` (+3) and the 7-day `weekTrend` are **fabricated** ("simulation" in code). Doc: delta = snapshot vs 7 days ago. | P0 |
| 1.7 | Guest fallback pillars are fixed 75/80/70/78 → a user who never logged anything still gets a score on Insights. Doc says cold start = "Calibrating", never a number. | P1 |
| 1.8 | No daily snapshots, no `stale` state, no low-signal decay, no reweighting when a pillar isn't tracked — all specified in the doc, none implemented. | P1 |
| 1.9 | Score only computes server-side from Supabase → **guests and offline users can never get a real score** despite the app being local-first. | P0 |

**Proposal:** a pure `computeScoreSnapshot(ledger, profile, date)` function
(client + server share it), per pillar:

- Consistency — planned-vs-trained adherence over rolling 4 weeks from the DayStatus series (rest days honored), with a streak bonus.
- Strength — trend of e1RM on the user's main lifts (slope over 4–8 weeks), not raw volume.
- Cardio — weekly minutes vs 150-min target, reweighted **out** if the user never logs cardio (doc rule).
- Body Shape — progress toward target weight/shape from weigh-ins; low-signal if no weigh-ins.

Store one snapshot per local day → real delta and trend. Fully testable.
**I'll bring you the exact formulas to approve before coding (it changes product behaviour).**

---

## 2. Workout session (`/session/[id]`, `sessionStore`)

| # | Finding | Evidence | Sev |
|---|---|---|---|
| 2.1 | **Empty set can be ticked complete** (no weight, no reps) and counts toward progress + unlocks Finish. | "1 of 19 sets" after ticking a blank row | P1 |
| 2.2 | **No input validation**: −20 kg × 500 reps accepted. Summary showed **Volume −9,200 kg**; History total **−9200 kg**. | flow screenshots | P0 |
| 2.3 | **Full +320 XP for any finish** (3 of 19 sets, 6 seconds). XP should scale with work done. | summary card | P1 |
| 2.4 | Finished workout saved to history with **status "active"** — `summarize()` runs on the pre-finish session object. History badge shows "active". | `sessionStore.ts` finishSession | P1 |
| 2.5 | **Plates button on every exercise** incl. Cable Fly, Lateral Raise, Rope Pushdown; opens barbell plate math (60 kg on a cable fly). Show only for barbell lifts. | 6 "Plates" buttons | P1 |
| 2.6 | Session date = `completedAt.slice(0,10)` on a **UTC** ISO string. In IST, a workout between 00:00–05:30 is filed under **yesterday** → breaks streaks/calendar. Other code uses local dates. | `summarize()` | P1 |
| 2.7 | Duration shows **0m** for short sessions, "Time under bar" **includes cardio minutes** (mislabeled — it's just duration). | History | P2 |
| 2.8 | Epley e1RM has no rep cap; 500 reps → absurd 1RM. Cap at ~10–12 reps for e1RM or ignore. | `prEngine.ts` | P1 |
| 2.9 | After finishing, Home still shows **Today's Mission: Push-Heavy, play button** — mission never marks done. | after_home | P1 |
| 2.10 | Only **one** mission exists server-side (`mission-push-a`). Program days / PhysIQ Split don't produce real sessions of their own. | `getSessionSetup.ts` | P1 |
| 2.11 | Last row of each exercise has an ✕ that shrinks its inputs → rows don't line up. | session screenshot | P2 |
| 2.12 | Voice announcements default **ON** during rest — surprising in a gym; default off or ask once. | rest timer "Voice ON" | P2 |

Good: rest timer inline and clear; resume after reload works (3/19 kept);
Finish gated on at least one set.

---

## 3. Home

| # | Finding | Sev |
|---|---|---|
| 3.1 | New user sees mock "Alex", **27-day streak**, 4 notifications, **83% week** with trained/missed days — alongside a "Calibrating" score. Contradictory on the first screen. | P0 |
| 3.2 | Mock week marks **Tuesday as Missed** and highlights **Saturday as today** (`isToday: index === 5` hardcoded; today is Tuesday). Fixed after a real workout, but the first impression is wrong. | P1 |
| 3.3 | Priority #1 "Hit today's Push-Heavy session" repeats the Mission card directly above. Priorities need to add something the mission doesn't. | P2 |
| 3.4 | Quick actions **Train** and **Compete** duplicate the bottom nav. Could be Cardio / Weigh-in / Calendar instead. | P2 |
| 3.5 | Mission and archetype ignore onboarding (Bulk/PPL/4 days still shows "Endurance-forward hybrid athlete"). | P0 (part of §0) |

---

## 4. Train, exercise library, programs, calendar

| # | Finding | Sev |
|---|---|---|
| 4.1 | Every exercise row uses the **same dumbbell icon**; muscle-group color/icon would make the 189-list scannable. | P2 |
| 4.2 | The **55% / 100%** badge on each row is unexplained (it's primary-muscle share). Label it or drop it from the list. | P2 |
| 4.3 | Exercise detail is thin: muscle split + one generic "level guide" sentence. No cues, no "your last / best" for that lift. (You archived the history card — flagging only; your call.) | P2 |
| 4.4 | **PhysIQ Split** opens on **3 days/week** even when onboarding said 4; described as "bulk, intermediate" for everyone (known TODO: personalise). | P1 |
| 4.5 | Calendar says "Planned days vs. real training" but a fresh user sees plan dots only; fine. After adopting nothing it still shows **PPL** — calendar should follow the *active* plan. | P2 |
| 4.6 | Cardio: clean. 150-min weekly target is hardcoded; make it a preference. | P2 |

---

## 5. Insights

| # | Finding | Sev |
|---|---|---|
| 5.1 | Score 84 / trend / "+4" are mock for guests (see §0, §1). | P0 |
| 5.2 | Coach card suggests "**a 20-min zone-2 walk today**" — you removed cardio nudges from Home; confirm whether Insights should also stay strength-only. | Q |
| 5.3 | **PR chart (92.5 kg bench)** is mock while the Strength card beside it uses real data (126.5 kg). Same page, two answers. | P0 |
| 5.4 | 12-week heatmap is random mock for a new user — shows months of "history" that never happened. | P1 |
| 5.5 | Body Balance repeats the four pillar numbers already shown… fine, but they're mock too. | P1 |

### 5a. Recovery & Readiness (`/insights/recovery`, `recoveryEngine.ts`)

| # | Finding | Sev |
|---|---|---|
| 5a.1 | Labels like **"Neuromuscular Excitability 95%"**, **"Autonomic Balance"**, **"Cellular Glycogen & Hydration"** imply physiological measurement. They're simple formulas on volume + a **hydration input** (screen shows 1,800 / 3,000 ml; hydration tracking was removed) + a **hardcoded streak of 3**. Same honesty issue as the "AI" labels. | P0 |
| 5a.2 | Code claims a "Banister Impulse-Response model" — not implemented; it's ACWR + fixed deductions. | P1 |
| 5a.3 | **ACWR is meaningless without ≥ 3–4 weeks of data.** For a new user chronic ≈ acute → ratio ≈ 4.0 ("overreach"); with no data it shows **0×** yet the headline says "workload within your sweet spot" (85%). | P1 |
| 5a.4 | Negative volume (see 2.2) makes the baseline ≤ 0, so ACWR silently becomes 1.0 and readiness jumped to 88% "**Peak — ideal day for PRs**" right after my test workout. Garbage in → confident advice out. | P1 |
| 5a.5 | "7-day" acute window uses `daysAgo <= 7` = 8 days. | P2 |

**Proposal:** rename to "Training Load", show only what we can compute
honestly (this week's volume vs your 4-week average, sets at RPE ≥ 9, days
since last rest), hide ACWR until 28 days of data, drop the hydration and
"autonomic" dimensions until a wearable supplies HRV.

### 5b. Strength Standards (`/insights/strength`)

| # | Finding | Sev |
|---|---|---|
| 5b.1 | Uses a **75 kg reference bodyweight** while Body Stats says **77.6 kg**. Should read latest weigh-in. | P1 |
| 5b.2 | Standards depend on **sex**, which onboarding never asks (body picker's Male/Female only switches the image). | P1 |
| 5b.3 | Footer shows raw LaTeX: `\(w \times (1 + r / 30)\)`. | P2 |
| 5b.4 | Tier chips read "82.5k", "112.5k" — looks like 82,500. Use "82.5 kg". | P2 |
| 5b.5 | +/− steppers let you edit your own 1RMs on a page that claims they're "estimated from your logged sets". Pick one: derived (read-only) or manual override (labelled). | P2 |

---

## 6. Compete

| # | Finding | Sev |
|---|---|---|
| 6.1 | Entire screen is fictional: "2,842 athletes", Sarah K./Marcus T., live feed, cheer wall. No backend exists for any of it. Fine for a demo; **must not ship to real users as-is**. | P0 (before launch) |
| 6.2 | Feed item "started 30-day **hydration** challenge" — hydration was removed. | P2 |
| 6.3 | XP leaderboard ranks raw XP → rewards volume/time spent, easy to game (see 2.3). | P1 |

---

## 7. Profile, Body, Photos, Achievements

| # | Finding | Sev |
|---|---|---|
| 7.1 | Profile ignores onboarding and local data entirely (server mock for guests): name, goal, split, days, sessions, streak, XP, level L14. | P0 |
| 7.2 | **Three fake progress photos are written into the persisted user store** (`physiqx-profile.photos` "Baseline check-in…"). They'd be exported and synced as the user's own data. | P0 |
| 7.3 | Achievements: **Hydration Master unlocked 100%** (feature removed); Profile shows **Iron Month** unlocked while Achievements shows it **locked 17%**. | P1 |
| 7.4 | Achievement cards print the badge name twice (inside icon tile and as title). | P2 |
| 7.5 | Body Stats: weight history + trend are mock for a new user; hologram labelled "Average • Athletic" before any input. | P1 |
| 7.6 | Preferences still offers **"Mascot Coach Tips & Presence"** toggle although mascots are disabled. | P2 |
| 7.7 | `hydrationGoalLiters` still saved by onboarding; `nutritionStore` / `hydrationStore` still hydrate on every start. | P2 |

---

## 8. Wearables & Integrations (`/profile/integrations`)

| # | Finding | Sev |
|---|---|---|
| 8.1 | Shows **Apple Health and Garmin "connected · synced 4 mins ago", "2 active telemetry streams", "battery impact < 0.5%"**. None of it exists. | P0 |
| 8.2 | System-design reality: **a web/PWA app cannot read Apple HealthKit or Health Connect at all.** Options: (a) native shell (Capacitor / Expo) later, (b) now: Strava / Garmin / Oura / WHOOP web OAuth, (c) now: import Apple Health export `.zip` / `.fit` / `.gpx` files. | — |

**Proposal:** replace the screen with honest states ("Not connected" +
"Coming soon") and, if you want one real integration first, Strava OAuth is
the cheapest path for cardio.

---

## 9. Onboarding & Auth

| # | Finding | Sev |
|---|---|---|
| 9.1 | Onboarding never asks **name, sex, bodyweight, height** — yet strength standards, BMI, and body scan need them. Add one short "About you" step. | P1 |
| 9.2 | Onboarding answers are saved (`onboardingProfile`) but **nothing reads them** except the DNA result card. | P0 |
| 9.3 | "Twice a day" session frequency is collected but unused anywhere. | P2 |
| 9.4 | `middleware.ts` documents a 3-way guard (→ /login, → /onboarding) but **only redirects logged-in users away from /login**. No onboarding gate; `/` always goes to `/home`. Decide: guest-first (then fix the docs) or gated. | P1 |
| 9.5 | "Continue with Apple" is a disabled button — hide until it works. | P2 |

---

## 10. Backend, sync & data management

| # | Finding | Sev |
|---|---|---|
| 10.1 | **Schema ↔ code mismatch.** `getInsightsData` reads `title`, `mission_id`, `duration_seconds`, `sets_completed` — the `sessions` table has `template_name`, `template_id`, no duration, no sets count. Signed-in users would get zeros. | P0 |
| 10.2 | No tables for **cardio logs, weigh-ins, plans, photos, preferences** → those can never leave the device. Hydration table exists for a removed feature. | P1 |
| 10.3 | **Guests' workouts go into the sync queue forever** (server action returns "not authenticated" → re-queued, `retryCount` grows unbounded, no max, no backoff). Also shows "1 workout pending sync · Sync now" to someone with no account. | P1 |
| 10.4 | Local history capped at **60 sessions** (`HISTORY_LIMIT`). For a guest (no server copy) that silently deletes older workouts → lifetime PRs, 12-week heatmap and streak lose data after ~3 months. | P0 |
| 10.5 | Retry path de-dupes `sessions` and `session_exercises` but **not `exercise_sets`** → a partial failure + retry can duplicate sets. Should be one RPC/transaction. | P1 |
| 10.6 | Two streak implementations: `liveProgress.deriveStreakDays` (strict consecutive days — **a rest day resets it**, against "never punish the lifter") and `streakEngine.computeStreakSummary` (forgiving). Home uses the strict one. | P1 |
| 10.7 | Supabase reachability check duplicated in `middleware.ts` and `server.ts`; a single failed probe caches "offline" for **5 minutes**, treating signed-in users as guests for that window. Shorter negative TTL (≈15 s). | P2 |
| 10.8 | `catch → return mock` in every `get*Data` hides real errors (and swallows Next's dynamic-render signal — build log noise). Return a typed "unavailable" state instead. | P2 |

---

## 11. Design system / UI

| # | Finding | Sev |
|---|---|---|
| 11.1 | Overall look is strong and consistent (dark, neon green, rounded cards). Keep it. | — |
| 11.2 | Brand spelling drifts: "PhysIQx", "PhysIQ DNA", "PhysIQ Score", "PhysIQ Split", "PhyslQx" (Space Grotesk renders I/l alike in the logo). Pick one rule. | P2 |
| 11.3 | Copy tone swings into jargon ("The machine is running hot", "telemetry streams", "substrate availability"). UX_Principles says zero fluff. | P2 |
| 11.4 | Numbers formatting: "59.0k kg", "-9200 kg", "82.5k". One `formatKg()` helper. | P2 |
| 11.5 | Empty states: most screens never show one because mocks fill them. Once mocks are gone, every screen needs a designed empty state (first-week experience). | P1 |

---

## 12. Performance & code health

| # | Finding | Sev |
|---|---|---|
| 12.1 | Prod TTFB ~220 ms, shared JS 102 kB — good. | — |
| 12.2 | 67 body-shape PNGs are 0.4–1.1 MB each (~45 MB). `next/image` helps at runtime, but source files should be WebP/AVIF ≤ 150 kB; `sw.js` precache must not include them. | P2 |
| 12.3 | 8 ESLint errors → plain `npm run build` fails (only `--no-lint` passes). | P1 |
| 12.4 | ~10 unreachable components (Fuel suite, HydrationLogSheet, MuscleAnatomyVisualizer, ExerciseDemoPlayer, MovementFormGuide, PlateCalculatorScreen, GenerateProgramScreen, CoachScreen…) still compiled and linted. | P2 |
| 12.5 | Tests cover engines well (131) but nothing covers the **cross-screen consistency** that's actually broken. Add a few store-level integration tests ("finish workout → history, streak, score, profile agree"). | P1 |

---

## Proposed order of work

1. **Stop the bleeding (small, safe):** session input validation + blank-set guard (2.1, 2.2, 2.8), status bug (2.4), local-date fix (2.6), Plates only on barbell (2.5), remove seeded fake photos (7.2), lint errors (12.3). Tests for each.
2. **Single source of truth:** ledger layer + demo mode; Home/Profile/Insights/Achievements all derive from it; onboarding answers flow through (§0, 3.5, 7.1, 9.2). Unify streak (10.6).
3. **Scoring v4:** approve formulas → implement pure `computeScoreSnapshot` + daily snapshots (§1).
4. **Honesty pass:** Recovery → "Training Load" (5a), Integrations → real states (§8), Compete → demo-labelled or hidden (§6).
5. **Backend:** fix schema mismatch, add cardio/weigh-in/plans tables, transactional save RPC, guest queue rules, lift the 60-session cap (§10).
6. **Polish:** onboarding "About you" step, strength standards from real bodyweight/sex, formatting helper, empty states, image compression (§4, 5b, 9, 11, 12).

Decisions needed from you are marked in-line: 1 (score formulas), 5.2
(cardio suggestions on Insights), 6 (Compete: hide or demo-label), 9.4
(guest-first vs gated), 4.3 (exercise history on detail page).
