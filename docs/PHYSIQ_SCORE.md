# PhysIQ Score™

The single source of truth for how the PhysIQ Score works as a product system.
This document defines the **contract** — not the algorithm. Implementation lives
in one module (`lib/score`) and must conform to this document, never the reverse.

---

## Why this score exists

PhysIQx AI is not a logging app. Logging is the input; consistency is the product.
The PhysIQ Score is the mechanism that converts scattered daily actions
(a workout, a glass of water, a rest day honored) into **one
number a user can care about**.

It exists to answer, at a glance:

1. *How am I doing?* — one number, 0–100.
2. *Is it getting better?* — a delta and a trend.
3. *What should I do next?* — the weakest pillar and one recommendation.

If the score ever stops answering all three, it has failed regardless of how
accurate it is.

## Product philosophy

- **The score rewards behavior, never punishes it.** It can rise fast and fall
  slowly. A missed day flattens the trend; it never cliffs it.
- **The score reflects consistency, not fitness.** Two users with different
  strength levels can both hold a 90. It measures how well you are executing
  *your* plan, not how you compare to others. Comparison is XP's job (see
  DATA_MODELS.md) — the two systems must never be conflated.
- **Every movement must be explainable.** Any time the score changes, the
  product must be able to say why in one sentence ("Peak week — training and
  recovery aligned"). A score that moves mysteriously destroys trust and is a
  product bug even if the math is correct.
- **The score is personal and private by default.** It never appears on
  leaderboards or feeds.

## User experience goals

- Displayed as the hero of Home (radial gauge) and Insights (trend + headline).
- Always shown with **context**: current value, weekly delta, and a one-line
  explanation. A bare number is never rendered.
- Score changes animate; changes are celebrated when positive and framed as
  guidance when negative ("Cardio is your weakest link this week"), never
  as failure.
- The user should be able to predict the score's behavior after one week of
  use. Predictability is a feature.

---

## The contract

### Output

| Field | Description |
|---|---|
| `score` | Integer 0–100. The composite. |
| `delta` | Signed change vs. 7 days ago (the "+4 this week" chip). |
| `trend` | Daily score series, queryable at 7D / 30D / 90D / 1Y ranges. |
| `pillars` | Four pillar sub-scores, each 0–100 (see below). |
| `weakestPillar` | The pillar currently holding the score back. |
| `headline` | One human-readable sentence explaining the current state. |
| `state` | `calibrating` \| `active` \| `stale` (see lifecycle). |
| `scoreVersion` | Algorithm version that produced this value (see versioning). |

### Pillars

Four pillars (v3), matching the Home screen exactly. v2's BMI and Hydration
pillars were removed: BMI double-counted body composition with Body Shape
while punishing muscular users, and hydration is a daily habit — still
tracked on Home with its own goal — not a fitness outcome. The set is
**weighted by health impact rather than treated as equal**, following the
mortality evidence (cardiorespiratory fitness and muscular strength are the
two strongest modifiable predictors):

| Pillar | Weight | What it measures | Primary inputs |
|---|---|---|---|
| **Consistency** | 30% | Showing up over time | Streaks, weekly plan adherence, return-after-break behavior |
| **Strength** | 25% | Getting stronger over time | Workout session PRs, volume progression, load trends |
| **Cardio** | 25% | Cardiovascular effort and capacity | Cardio session logs; later: heart-rate zones, VO2 max from wearables |
| **Body Shape** | 20% | Physique level vs. difficulty | User-selected body type (visual picker), confirmed on height/weight updates |

Weights sum to 1 and live in `lib/score` (`pillarWeights`), stamped by
`scoreVersion` — this document fixes the *relative* ordering (Consistency
leads; the two performance pillars follow) but not the exact decimals, which
`lib/score` may tune. What *is* fixed: every pillar always contributes, and
no single day's data can move the composite by more than a few points.

The "Body Balance" radar on Insights renders these same four pillars directly
— it is a visualization of the score's own data, not a second, differently-
shaped scoring system. (There is only one pillar set, used everywhere.)

### Inputs and data sources

| Source | Feeds | Phase |
|---|---|---|
| Workout sessions (completed, PRs, volume) | Strength, Consistency | 4–5 |
| Cardio session logs | Cardio | 4–5 |
| Body-type selection + height/weight entries | Body Shape | 4–5 |
| DayStatus series (derived: Program schedule vs. sessions — see DATA_MODELS.md) | Consistency | 4–5 |
| Wearables: HR zones, VO2 max | Cardio | Future |
| ML predictions | Trend forecasting only | Phase 7 |

All inputs arrive as **events in ledgers** (see DATA_MODELS.md). The score is
always recomputable from raw events; it is never itself a source of truth.

---

## Lifecycle

- **One snapshot per user-local day.** Today's snapshot is provisional while
  the day runs and is **finalized (made immutable) at user-local day close**.
  The headline number always displays the most recent *finalized* value —
  today's activity shapes tomorrow morning's score. This keeps the score calm
  (a weather report, not a stock ticker) and makes "immutable" unambiguous.
- **Intraday**, pillar progress may update live (fuel bars, today's session);
  only the composite waits for finalization.
- The delta compares the latest finalized snapshot to the one 7 days prior.
- Snapshots are keyed to the local calendar date at finalization; at most one
  exists per date, and timezone changes never rewrite or duplicate history.
- Snapshots store their inputs summary alongside the value, so any historical
  score can be explained later.

### Cold start (first 7 days)

New users have no history, and no design exists for this state — it must be
designed deliberately, not improvised:

- The score renders in `calibrating` state: the gauge shows collected-signal
  progress ("3 of 7 days"), **never a low number**. A new user must never open
  the app to a 12/100.
- Pillars display as "gathering data" until each has minimum signal.
- The first real score appears after 7 days and is framed as a baseline
  celebration, not a judgment.
- Missions, XP, and streaks work normally from day one — the score is the only
  system that calibrates.

### Missing data

The score must distinguish **absence of behavior** from **absence of tracking**:

- A pillar with no recent logs enters `low-signal`: its last known value decays
  gently toward neutral (not toward zero) and the UI labels it ("No cardio
  logs this week") rather than scoring it down hard.
- If the user has disabled a tracking feature entirely, the pillar is
  reweighted out of the composite rather than penalized. Users who don't log
  cardio sessions are not "failing cardio."
- After 14+ days of total inactivity the score enters `stale`: **snapshot
  production pauses** (no fabricated decay data), the last finalized value is
  shown dimmed with a re-engagement prompt, and the trend chart renders the
  gap honestly. On return, a short recalibration (a few days, never a full
  cold start) resumes snapshots — the comeback must feel rewarding (core UX
  principle: encourage returning).

---

## Future integration points

These are contracts for later phases; none are built during UI recreation.

- **ML (Phase 7):** models may *predict* the score trajectory and *suggest*
  weights, but the shipped score of record remains deterministic and
  explainable. Predictions render as forecasts, clearly distinct from history.
- **Wearables:** HR zones/VO2 max/resting-HR arrive as new event types
  feeding the Cardio pillar. Adding a source must not require schema changes
  to snapshots — sources are additive inputs behind the same pillar interface.
- **AI Coach:** insight generation *consumes* score outputs (pillar deltas,
  weakest link, trend inflections) and never computes its own. One scoring
  brain; many mouths.

## Versioning

- Every snapshot carries `scoreVersion`. Algorithm changes bump the version.
- **History is never recomputed under a new version.** Old snapshots remain
  as-scored; trend charts may annotate version boundaries if a change is
  user-visible.
- Material changes to weights or inputs are product decisions, announced
  in-app ("Your score now includes sleep"), never silent.

## Engineering considerations

- One pure, deterministic module owns all score math. Same inputs → same
  output, no clock reads, no I/O. This is the most unit-tested code in the app.
- **UI never computes score values.** Screens render the output contract above
  and nothing else. During UI recreation, mock fixtures conform to the exact
  same output shape — when the real engine ships, no screen changes.
- The output contract (table above) is the API. Backend, mobile, and any
  future platform consume it identically; the contract survives a platform
  port even if the UI does not.
- Snapshot storage must support offline: scores render from local data, and a
  device-computed provisional score may display until sync reconciles.
