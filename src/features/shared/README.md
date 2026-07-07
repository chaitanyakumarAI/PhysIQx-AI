# Shared Feature Components

Domain-tinted components used by **two or more features**. Not generic enough
for `components/ui` (per that folder's rule: nothing with a domain word in
its name belongs there), but not owned by one feature either.

Promotion rule: a component starts inside the feature that first needs it.
The moment a second feature needs the same component, it moves here — same
pattern as `src/data/` for shared mock fixtures. Don't pre-build here on
spec; only promote on actual second use.

| Component | Used by |
|---|---|
| `AIInsightCard` | Home (AI Coach card), Insights ("What the data says" cards) |
| `StatChipRow` | Profile (identity + progress stat rows, 3 columns), Onboarding (DNA Result summary, 2 columns) |
| `Logo` | Auth layout, Onboarding's Welcome step |
| `PillarGrid` | Home (standalone, under the score), Insights (inside `BodyBalanceCard`, beneath the radar) — same six `PillarScore`s, same component, so the two screens can't show conflicting breakdowns |

`lib/pillarMeta.ts` — pillar → icon/tone lookup, shared by `PillarGrid` and
any standalone pillar callout, so the mapping can't drift between them.

`lib/milestones.ts` — frequent-win milestone definitions + `deriveLatestMilestone`
(streak psychology: first workout / first week / first month / 50 / 100).
Celebrations render through Home's `AchievementSpotlight` (`milestone` kind);
a fresh PR outranks a milestone when both exist.
