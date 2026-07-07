# Data Models

The canonical domain vocabulary for PhysIQx AI. Every feature, mock fixture,
API, and future database table maps to these models. If a concept isn't here,
it isn't a model yet — add it here first.

This is documentation, not a schema. Field lists name what matters and omit
the obvious (every entity has `id`, `createdAt`, `updatedAt`).

---

## Modeling principles

1. **Ledgers over mutable totals.** Anything that accumulates (XP, hydration,
   protein, volume) is stored as an append-only event ledger. Totals, streaks,
   and levels are *derived*. This makes history explainable, sync/offline
   conflict resolution tractable, and bugs reversible.
2. **Definitions vs. user state.** Static catalog content (an exercise, an
   achievement's rules, a program template) is separate from a user's
   relationship to it (their PR on that exercise, their unlock progress).
   Definitions ship with the app; user state syncs.
3. **Derived data is disposable.** Summaries, leaderboards, and scores can
   always be recomputed from ledgers. Never treat a derived model as a source
   of truth.
4. **Mock phase:** fixtures in `src/data/` conform to these models exactly.
   The models are the part of Phase 1 guaranteed to survive every later phase.

---

## Identity

### User
The account. Authentication identity only.
- **Fields:** email, auth provider, account status.
- **Relationships:** has one Profile; owns everything below.
- **Lifecycle:** created at signup (Phase 3); anonymous/local user supported
  for offline-first consideration.
- **Future:** linked wearable accounts, household/coach relationships.

### Profile
Who the user is as an athlete. Everything Onboarding collects.
- **Fields:** display name, avatar, goal (cut / bulk / maintain / endurance),
  experience level, active split reference, training days per week, rest-day
  preferences, protein goal (g), hydration goal (L), DNA archetype (e.g.
  "Endurance-forward hybrid athlete" — the PhysIQ DNA line on Profile),
  units (kg/lb), timezone, app preferences (appearance, notification
  toggles — the Settings section on Profile).
- **Relationships:** belongs to User; goals feed the PhysIQ Score's Nutrition
  pillar; split reference points at a Program.
- **Lifecycle:** created by onboarding; edited in Profile/Settings. Changing
  goals affects score inputs *going forward only* — history is never
  re-judged against new goals.
- **Future:** body metrics history (weight, photos), injury flags,
  equipment availability.

---

## Scoring & gamification

### PhysIQScoreSnapshot
One immutable per-day score record. Full contract in PHYSIQ_SCORE.md.
- **Fields:** date, score, delta, six pillar sub-scores (Consistency,
  Strength, Cardio, BMI, Body Shape, Water — weighted by health impact, not
  equal), weakest pillar, headline, state (calibrating / active / stale),
  scoreVersion, inputs summary.
- **Relationships:** derived from session, body-measurement, hydration, and
  adherence ledgers.
- **Lifecycle:** one per user per day; provisional until day close, immutable
  after; never recomputed under a newer scoreVersion.
- **Note:** the Body Balance radar (Insights) renders these same six pillars
  directly — it is not a separately-shaped decomposition, so there is nothing
  to reconcile between the two views.

### XPTransaction
Append-only XP ledger entry. XP is the *social/comparative* currency;
the score is the *personal* one. They never mix.
- **Fields:** amount, source type (workout complete, mission complete, PR,
  challenge reward, achievement unlock), source reference, timestamp.
- **Relationships:** sourced by Sessions, Missions, Challenges, Achievements;
  summed for Level and Leaderboard.
- **Lifecycle:** written once at the rewarding moment (drives the XP
  animation); corrections are compensating entries, never edits.
- **Future:** seasonal *leaderboard* windows and XP multiplier events.
  Lifetime XP is never reset — Level must remain monotonic. "Seasons" are
  scope windows over the ledger, not ledger truncation.
- **Known design inconsistency:** the mocks show 2,840 lifetime XP on Profile
  but 15,980 XP for the same user on the *weekly* leaderboard — a window sum
  cannot exceed the lifetime total. The model is authoritative: Profile/Level
  read lifetime XP; leaderboards sum transactions inside their scope window.
  Mock fixtures must be generated arithmetically consistent, not copied from
  the designs.

### Level
Fully derived from lifetime XP — **not stored, computed**.
- **Fields (derived):** level number, title (e.g. "Hybrid Athlete" at L14),
  current-level XP, XP to next level.
- **Dependencies:** the XP curve and level titles live in one config owned by
  `lib/gamification`; UI never hardcodes thresholds.

### Achievement (definition) / UserAchievement (state)
The badge catalog vs. the user's collection.
- **Achievement fields:** name, description, rarity (common / rare / epic /
  legendary), hidden flag, unlock criteria (declarative: metric + threshold),
  icon, XP reward.
- **UserAchievement fields:** achievement ref, progress (0–1), state (locked /
  in-progress / unlocked), unlockedAt.
- **Relationships:** criteria evaluate against ledgers; unlock writes an
  XPTransaction and an ActivityEvent.
- **Lifecycle:** definitions versioned with the app; progress recomputable
  from ledgers.
- **Future:** seasonal/limited achievements, badge showcase selection.

### DayStatus (derived series)
The per-day training-status primitive: each user-local day resolves to
`trained | rest-honored | missed | unplanned`, derived from the active
Program's schedule vs. the session ledger. **This is the single source for
the streak, the 12-week heatmap, the This Week bars, and the
Recovery/Consistency pillar inputs.** No view may derive day status
independently — three screens rendering the same day differently is the bug
this model exists to prevent.

### Streak
Derived consistency state — computed from the DayStatus series, cached for
display (the "27 day streak" chip).
- **Fields (derived):** current streak days, longest streak, this-week
  completion %. (The heatmap and weekly bars render DayStatus directly.)
- **Rule:** streak logic must encode forgiveness (per UX principles, a missed
  rest day never breaks a streak). The exact grace rules live in
  `lib/gamification` and are a product decision to finalize.

---

## Training

### Exercise
Catalog definition ("Barbell Bench Press").
- **Fields:** name, muscle groups, equipment, difficulty tier (the "I"
  badge), instructions/media, searchable tags.
- **Relationships:** referenced by WorkoutTemplates, SessionExercises,
  PersonalRecords. 400+ entries; ships as static catalog data.
- **Future:** video demos, alternative-exercise links, user-created exercises.

### Program
A training split the user follows (PPL, Upper/Lower, Bro, Full Body, AI).
- **Fields:** name, type, schedule pattern (which template on which weekday),
  source (preset / AI-generated).
- **Relationships:** contains WorkoutTemplates; Profile points at the active
  one; generates Missions.
- **Future:** AI programs regenerate periodically; progression rules.

### WorkoutTemplate
A planned workout blueprint ("Push Day A": chest/shoulders/triceps, 6 lifts).
- **Fields:** name, target muscle groups, ordered exercise list with target
  sets/reps/rest, estimated duration, intensity tag (the "High" chip),
  base XP reward.
- **Relationships:** belongs to a Program; instantiated by WorkoutSessions;
  surfaced daily as a Mission.

### WorkoutSession
An actual training occurrence — the live screen and the historical record.
This is the highest-write-volume entity and the core offline case.
- **Fields:** template ref (nullable — freestyle allowed), state (active /
  completed / abandoned), start/end time, per-exercise data (see
  SessionExercise), total volume, XP earned, notes.
- **Relationships:** instantiates a WorkoutTemplate; contains
  SessionExercises; completion writes XPTransaction + ActivityEvent, feeds
  Streak, PersonalRecords, and score pillars.
- **Lifecycle:** `active` while training (local-first state — must survive app
  kill and airplane mode); finalized to `completed`; an abandoned session is
  saved, never discarded (never punish).

### SessionExercise / ExerciseSet
The rows inside a session: one SessionExercise per movement, containing
ordered ExerciseSets.
- **Set fields:** weight, reps, RPE (optional), completed flag, PR flag.
- **Relationships:** ExerciseSet references the Exercise catalog; PR-flagged
  sets update PersonalRecord.

### PersonalRecord
Best performance per user per exercise (the Bench Press 92.5 kg card).
- **Fields (derived, cached):** exercise ref, best weight/reps/e1RM, trend
  series for the chart, delta vs. 30 days.
- **Lifecycle:** updated on session completion; recomputable from set history.

### Mission
Today's assigned focus — the "Push Day A · +320 XP" hero card. A Mission is a
*daily pointer with reward framing*, not a copy of the workout.
- **Fields:** date, workout template ref, XP reward, source (program schedule /
  AI), state (pending / started / completed / rest-day).
- **Relationships:** generated from the active Program; starting it creates a
  WorkoutSession.
- **Lifecycle:** one per user per day; completes when the session it spawned
  completes. Whether a freestyle session can satisfy the day's mission is an
  **open product decision** (default until decided: no — the session still
  counts toward pillars and DayStatus, so the user is never punished).
- **Future:** non-workout missions (hydration goals, recovery tasks), AI
  Coach-adjusted missions.

---

## Fuel

### HydrationEntry / ProteinEntry
Append-only intake ledgers behind the two Fuel cards.
- **Fields:** amount (ml / g), timestamp, source (manual; future: food scanner,
  integrations).
- **Relationships:** daily sums vs. Profile goals drive the Fuel progress
  bars and the Nutrition pillar.
- **Lifecycle:** written on quick-log actions (one-tap, per UX principles);
  daily aggregates derived.
- **Future:** full NutritionLog (meals, calories, macros) generalizing
  ProteinEntry — model protein as the first macro, not a special case, so the
  food scanner phase extends rather than replaces this.

---

## Social

### Circle / Friendship
The user's social graph ("Climb with your circle"). Leaderboards and feeds are
friend-scoped by default.
- **Fields:** member refs, connection state (pending / accepted).
- **Future:** multiple circles, gyms, teams.

### LeaderboardEntry
Derived ranking row — a *view*, never stored truth.
- **Fields (derived):** user ref, rank, XP in scope, movement vs. previous
  period (the ↑2 chips), scope (weekly / monthly / all-time), circle vs.
  global.
- **Dependencies:** computed from XPTransactions within the scope window.
- **Note:** the designs show a friend-scoped board ("your circle") while the
  Weekly Challenge shows 2,842 athletes (global). Both scopes exist; the
  model carries scope explicitly.

### Challenge / ChallengeParticipation
Time-boxed community competitions ("Volume King — lift 40,000 kg this week").
- **Challenge fields:** name, description, metric (e.g. total volume),
  target, window (start/end), participant count, reward (badge + tier rule,
  e.g. "top 10% earns Legendary").
- **Participation fields:** challenge ref, progress toward target, rank
  percentile, reward state.
- **Relationships:** progress derives from session ledgers; completion writes
  XPTransaction and possibly UserAchievement.
- **Lifecycle:** upcoming → active → grading → closed. Results are immutable
  after close.

### ActivityEvent
The "Live from your circle" feed. Append-only, generated — never authored.
- **Fields:** actor ref, type (achievement unlock, PR, challenge join,
  level-up), subject reference, timestamp.
- **Lifecycle:** emitted by other systems on milestone moments; feed is a
  query over friends' events. No free-text posts in scope — this is a
  celebration feed, not a social network.
- **Future:** reactions ("fist bump"), which would be the first user-authored
  social write.

---

## Intelligence

### Insight
One AI-generated observation (AI Coach card, "What the data says" cards).
- **Fields:** headline ("You're peaking"), body (≤ 2 sentences — a length
  contract the UI depends on), category (training / nutrition / recovery /
  score), severity (celebrate / suggest / warn), source data reference (which
  metric movement triggered it), suggested action (optional deep link),
  state (fresh / seen / acted / expired), generatedAt, expiry.
- **Relationships:** consumes score pillars, PR trends, fuel ledgers. Never
  computes its own metrics (one scoring brain — see PHYSIQ_SCORE.md).
- **Lifecycle:** generated on data milestones or daily; expires when stale;
  the UI must handle the **no-insight state** gracefully (new users, quiet
  weeks) — mocks must include this case.
- **Future:** conversational AI Coach threads reference the Insight that
  started them; feedback signal (helpful / not) for model tuning.

---

## Aggregates & system

### WeeklySummary
Derived rollup powering "This Week" (86%, daily bars) and Insights summaries.
- **Fields (derived):** completion %, per-day DayStatus, volume, fuel
  adherence, XP earned, score delta.
- **Lifecycle:** recomputed on any contributing event; disposable cache.

### Notification
System-to-user messages (push/local, Phase 5+; the Settings toggle exists in
UI from Phase 1).
- **Fields:** type (mission reminder, streak risk, challenge result, circle
  activity, insight), payload, deep-link target, state (scheduled / sent /
  read), channel preferences per type.
- **Design rule:** notifications encourage, never guilt ("protect your
  streak", not "you failed"). Copy tone is a product contract.

---

## Relationship map

```
User ─ Profile ─ active Program ─ WorkoutTemplates
                        │                │
                     Missions ──────► WorkoutSessions ── SessionExercises ── Sets
                                          │                        │
        (ledgers)  HydrationEntry   XPTransactions          PersonalRecords
                   ProteinEntry           │                        │
                        │                 │                        │
        (derived)  ─────┴────► DayStatus · PhysIQScoreSnapshots · Level · Streak · WeeklySummary
                                          │
        (consumes) ──────────────────► Insights
                                          
User ─ Circle ─► LeaderboardEntries (from XP) · ActivityEvents · Challenges
User ─ UserAchievements ◄─ Achievement catalog (definitions)
```

Source-of-truth entities: sessions, sets, fuel entries, XP transactions.
Everything else is catalog (definitions) or derived (recomputable).
