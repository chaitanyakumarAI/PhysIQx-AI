# PhysIQx — Pull / Restore Plan

*Drafted 2026-10-23. Decision 1 confirmed by the owner 2026-10-23; decisions 2
and 3 (only needed in Phase D) still open. Phases A and B done 2026-10-23
(007 awaiting the SQL Editor); Phase C next.*

## 1. The problem

Sync is push-only. A signed-in athlete who opens PhysIQx on a new phone, or
clears the browser, sees an empty app — their history exists in Supabase but
nothing ever reads it back. Three smaller gaps make a naive "just download it"
unsafe:

- **Not everything is uploaded.** Weigh-ins, body details (sex, birth year,
  height, build), plans and preferences live only on the device.
- **Deletes don't travel.** Removing a cardio activity or a plan only removes
  it locally, so a restore would bring it back.
- **Local data has no owner.** Signing out keeps everything on the device, and
  signing in as someone else would mix their data with the previous person's.

## 2. What exists today

| Data | On the device | In Supabase |
|---|---|---|
| Workouts | `sessionStore.history` (summaries) | `sessions` + `session_exercises` + `exercise_sets` (atomic since 006) |
| Cardio | `cardioStore.activities` | `cardio_logs` (upsert by `client_ref`) |
| XP, levels, badges, ranks | Derived from the ledger | `xp_transactions` (workouts only) |
| Onboarding answers | `profileStore.onboardingProfile` | `profiles` |
| Name, sex, birth year, height, build | `profileStore` | name only |
| Weigh-ins | `profileStore.weightEntries` (one per day) | — |
| Plans + active plan | `plansStore` | — |
| Preferences, notification prefs, showcase | `profileStore` | — |
| Photos, avatar | `profileStore` (data URLs) | — (separate TODO item) |

Everything the score, coach and collection read comes from four things:
workouts, cardio, weigh-ins and the profile. Restoring those restores every
derived number, so XP and badges never need syncing.

## 3. Design

**The device stays the source of truth while offline; the server is the
source of truth for what other devices have done.**

### 3.1 Schema — migration 007
- `profiles`: add `sex`, `birth_year`, `height_cm`, `current_build`,
  `settings JSONB` (preferences, notification prefs, showcase ids).
- New `weigh_ins` (user, `date`, `weight_kg`, unique per user and date).
- New `plans` (user, `client_ref` = plan id, `payload JSONB`, `is_active`).
- `deleted_at` on `cardio_logs`, `weigh_ins` and `plans`: deletes become
  tombstones, so they reach other devices.
- `updated_at` triggers on every synced table: they drive the pull cursor.
- One read function, `get_ledger_changes(since, limit)`, returning everything
  changed for `auth.uid()` since a cursor in a single round trip. It is
  SECURITY INVOKER, so RLS still decides what comes back.

### 3.2 Push what isn't pushed yet
New outbox job kinds — weigh-in, profile details and settings, plan, and
delete (tombstone) — each with a Zod-validated Server Action, the same pattern
as workouts and cardio. The outbox, retries and backoff don't change.

*As built (Phase B):* the profile travels as one snapshot whose newest copy
wins (`client_updated_at`); unset values are never written, so a new device
can't erase what another one told the server. The one-time backfill dates its
snapshot at onboarding (or 1970), so it never beats a newer device, and skips
a profile nobody filled in.

### 3.3 Pull and merge
- **When:** after sign-in, at app start while signed in, and when the device
  comes back online. Never in sample-data (demo) mode.
- **Cursor:** stored per account (`physiqx-sync-cursor:<userId>`). The first
  pull on a device starts from zero; later pulls fetch only changes, in pages
  of 200.
- **Mapping:** pure functions turn rows back into local types. Workout
  summaries are rebuilt from sets — top sets, volume, average RPE, duration,
  and the local calendar date from `completed_at`.
- **Merge rules** (pure and unit-tested):
  - Union by id (`client_ref`).
  - Anything still waiting in this device's outbox wins: it is newer than
    the server's copy.
  - Otherwise the server copy wins; it can only differ because another
    device changed it.
  - Tombstones remove the local item.
  - Profile and settings: the newer `updated_at` wins.
- **Ownership:** each store records the account it belongs to. That is what
  makes the rules in §6 enforceable.

### 3.4 What the athlete sees
- First sign-in on an empty device: Home shows its skeleton with "Restoring
  your training…", then the restored data.
- Profile › Settings gains a Sync row: last synced time and a Sync now button.
  The network pill already covers offline and failing states.
- Failures never block the app: the local data stays usable and the pull
  retries on the next trigger.

## 4. Phases (each ends with tests, a build and a commit)

| Phase | Deliverable | You do |
|---|---|---|
| **A** Schema | Migration 007 + updated TODO | Apply 007 in the SQL Editor |
| **B** Push the rest | Weigh-ins, profile details and settings, plans and deletes go through the outbox | — |
| **C** Pull + merge | `get_ledger_changes` client, mappers, merge, triggers, cursor | — |
| **D** Ownership + UX | Owner tagging, sign-in and sign-out behaviour from §6, restore state, Sync row | — |
| **E** Verify | Unit tests for every mapper and merge rule; a two-browser check | Sign in on two browsers and confirm a workout made in one appears in the other — I can't sign in for you |

## 5. Out of scope
- Photos and avatar: they move to IndexedDB / Supabase Storage as their own
  item.
- Real-time sync between two open devices: pulls happen on the triggers above
  and on demand, not continuously.
- Editing past workouts: they are append-only, so last-writer-wins is enough.

## 6. Decisions for you

1. **Guest data on first sign-in.** ✅ *Confirmed 2026-10-23:* data logged as a guest
   (never signed in) merges into the first account that signs in on that
   device — it's yours, so you shouldn't lose it.
2. **Switching accounts on one device.** *Recommended:* local data belongs to
   the account it came from. Signing in as a different account first uploads
   anything the previous account still has queued, then replaces the local
   data with the new account's.
3. **Signing out.** *Recommended:* after the outbox has emptied, remove the
   account's data from the device — it's safe in the cloud, and a shared phone
   shouldn't show it. If uploads are still pending (offline), warn and offer
   "Stay signed in" or "Sign out anyway".
