# PhysIQx — Next Round Plan

*Written 2026-11-02 at the owner's request ("continue the left-out part,
apart from video generation; make a plan and implement it"). Video and
animation work is out of scope (`docs/ANIMATION_PROMPTS.md`, waiting on
billing).*

## 1. What's left, and what this round does

| # | Item | Why now | This round |
|---|---|---|---|
| W1 | Merge the finished a11y branch; stale docs; lint ignores | Done work sitting unmerged; docs that describe behaviour the code doesn't have | Implement |
| W2 | Photos and avatar out of `localStorage` into IndexedDB | **Bug:** a full-size photo is stored as a data URL in the profile store; one large photo can exceed the ~5 MB quota, after which *every* profile write (weigh-ins, settings) silently fails to persist | Implement |
| W3 | RPE in top sets | The overload engine already reads `top.rpe`, but summaries never store it, so RPE auto-regulation never runs | Implement |
| W4 | Personalise the PhysIQ Split page | `/train/programs/ai` shows a program built once with defaults (bulk, intermediate), not the athlete's answers | Implement |
| W5 | Privacy switches that persist | **Bug:** the three switches are component state, reset on every visit | Implement |
| W6 | Tests: RLS cross-user checks and one end-to-end flow | Cross-account safety is untested | Implement (the SQL check runs in the SQL Editor, like the migrations) |
| D1 | Photos and avatar in the cloud (Supabase Storage) | Needed for restore on a new device | **Needs a decision** (§3) |
| D2 | Wire adaptive difficulty (`adaptProgramDifficulty`) | Logic and tests exist, unused | **Needs a decision** (§3) |
| D3 | Weekly quests · character reactions on Home · Figma v2 screens · Phase 6 explainer cards | Product features | **Needs a go-ahead** (§3) |
| — | Leagues | Blocked until Compete has real users | Not this round |
| — | Pull/restore Phase E | Needs the owner to sign in on two browsers | Owner |

## 2. Design notes

**W2 — media store.**
- A small IndexedDB module (`lib/media/mediaStore.ts`, DB `physiqx-media`, one object store of Blobs keyed by id).
- The profile store keeps only metadata: a photo gets `mediaId`; the avatar gets `avatarMediaId`.
- Images are downscaled on import (photos ≤ 1600 px, avatar 512 px, JPEG ~0.85) before they're stored.
- A `useMediaUrl(id)` hook turns a Blob into an object URL and revokes it on unmount.
- **Migration:** existing data-URL photos and avatars are moved into IndexedDB once after hydration, then stripped from the persisted state. Until that move finishes, the data URL still renders, so nothing disappears.
- Clearing local data on sign-out (Phase D) also clears the media store.
- Export keeps working: it reads the Blobs.

**W3.** `TopSet` gains an optional `rpe`, taken from the heaviest set's RPE. The restore mapper gets it for free, because it rebuilds summaries through `summarize`.

**W4.** The program page renders the PhysIQ Split from the athlete's onboarding goal and experience on the client. Every other program stays static.

**W5.** The switches persist in `profileStore.preferences.privacy` and travel in the synced settings snapshot. They still only describe Compete features; nothing enforces them yet, because Compete has no real users.

**W6.**
- `supabase/tests/rls_check.sql` impersonates two users inside a transaction, asserts each sees and can write only its own rows in every synced table, then rolls back. The owner runs it in the SQL Editor; it changes nothing.
- One Playwright test (guest, offline → online): log a workout offline and check it's queued; go back online and check delivery is attempted and paused for a guest. A signed-in variant runs only when `E2E_EMAIL` and `E2E_PASSWORD` are set by the owner.

## 3. Decisions for the owner

**Answered 2026-11-02:**
- **D1:** opt-in. A Privacy switch, "Back up progress photos", off by default. The avatar always syncs when signed in.
- **D2:** suggest only. A chip on the session; the athlete taps to apply.
- **D3:** weekly quests and Figma v2 screens are in this round; each gets a short spec first. Character reactions on Home and Phase 6 cards are not in this round.

These add W7 (cloud media), W8 (adaptive suggestion), W9 (weekly quests) and W10 (Figma v2 screens). Order: W1 → W3 → W5 → W4 → W2 → W7 → W8 → W6 → W9 → W10.

The questions as asked:

1. **D1 — photo backup.** Progress photos are body photos. Options: back up automatically when signed in (private bucket, owner-only access); **opt-in switch in Privacy, off by default (recommended)**; or keep them on the device only.
2. **D2 — adaptive difficulty.** Options: **suggest only — a chip on the session ("Deload suggested") that the athlete accepts (recommended)**; apply automatically; or leave unwired.
3. **D3 — which product features next.** Weekly quests; character reactions on Home (needs a change to the mascot rule, which limits them to the tour and celebrations); Figma v2 screens; Phase 6 explainer cards.

## 4. Order and verification

W1 → W3 → W5 → W4 → W2 → W6, one commit each. Each runs the typecheck, tests, lint and build; UI changes are checked in the browser.

## 5. Status (2026-11-04)

- Done and committed: W1, W3, W5, W4, W2 (media in IndexedDB), W7 (cloud media, migration 008), W8 (difficulty suggestion), W6 (RLS check + offline e2e), W9 (weekly quests), W10 (Figma v2 screens, `docs/FIGMA_PLAN.md` §9).
- Owner actions: apply `supabase/migrations/008_athlete_media.sql`, run `supabase/tests/rls_check.sql`, set `E2E_EMAIL`/`E2E_PASSWORD` for the signed-in e2e.
