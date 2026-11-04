# PhysIQx — Weekly Quests (spec)

*Written 2026-11-04 (W9 in `docs/NEXT_ROUND_PLAN.md`). Source idea:
`docs/GAMIFICATION_STUDY.md` §4 (Fitocracy / Duolingo-style quests).*

## What the athlete sees

A **"This week's quests"** card on Home, under Today's workout:

- Three quests, each with a progress bar, e.g. "Move 13,500 kg (8,200 / 13,500)".
- How many days are left in the week.
- A check and "+50 XP" on each finished quest.
- When all three are done, a "Clean sweep +100 XP" line.

No mascots, no pop-ups. Quests are rule-based, so the copy never says "AI".

## Rules

1. **A week** is Monday to Sunday, in the athlete's local calendar.
2. **Derived, not stored.** Quests and their progress are computed from the workout log, plan and profile, like XP and medals. Every device shows the same quests, and a restore brings them back with no new sync.
3. **Targets are fixed when the week starts.** Each target is computed only from data before that Monday, so training harder mid-week never moves the goalpost.
4. **Personal, and only a little harder.** Each target is about 10% above the athlete's own recent average (the last four weeks), rounded to a friendly number, with a small minimum. A quest needs enough history to set its target; otherwise it isn't offered.
5. **No double-dipping.** A perfect week already rewards hitting the planned number of training days, so quests stretch something else.
6. **Three a week.** The quests rotate by week number from the eligible pool below, so the mix changes and every device picks the same three.

## The pool

| Quest | Target | Eligible when |
|---|---|---|
| **Move it** | Weekly volume (kg), +10%, rounded to 500 | 2+ weeks with workouts |
| **More sets** | Working sets logged, +10%, rounded up | 2+ weeks with workouts |
| **Long session** | One workout with 20% more sets than the athlete's usual (median of the last 4 weeks), at least 8 | 2+ weeks with workouts |
| **Break a record** | Set 1 personal record | 4+ weeks of lifting history |
| **Cardio minutes** | Weekly cardio minutes, +10%, rounded to 10, minimum 60 | Any cardio imported in the last 4 weeks |
| **Check in** | 2 weigh-ins on different days | Any weigh-in logged before |
| **Rate your effort** | Log RPE in 2 workouts | RPE logged in the last 4 weeks |

A brand-new athlete with nothing eligible gets the starter set: "Finish 1 workout", "Log 10 sets" and "Weigh in once".

**As built (2026-11-04):** "Every day of the plan" was replaced by **Long session**, because plans rotate their days, so it would mostly duplicate the perfect week. **Rate your effort** counts workouts with RPE logged, because summaries keep the average, not every set. Eligibility depends only on logged data, never on a setting, so past weeks never change.

## XP

- **50 XP** per quest and **100 XP** for a clean sweep, so 250 a week at most.
- A new XP source, "Quests", appears in the XP breakdown. It counts toward levels like every other source.
- Quest XP lands on the day each quest is finished.
- Quests start with the release week (Monday 2026-11-02, `QUESTS_FIRST_MONDAY`), so past weeks don't all pay out at once and jump everyone's level.

## Build

- A pure `lib/gamification/quests.ts` (`weeklyQuests(ledger, plan, preferences, todayIso)`), fully unit-tested.
- A Home card component.
- One new source in `progression.ts`.
- No schema change and no sync change.
