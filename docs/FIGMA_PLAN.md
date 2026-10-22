# PhysIQx — Figma Design System Plan

*Phase 0 (brief & inventory) — 2026-10-22. Status: **awaiting your approval
(Gate 0).** Nothing in Figma changes until you approve.*

File: [PhysIQx Design System](https://www.figma.com/design/Py9qoiT5srEZTnuX8PqMBj)

---

## 1. Why a second pass

The first pass (2026-10-21) was built without an agreed scope or review points:
one long page, 7 of the app's 32 shared components, none of its 74 icons, only
default/disabled states, no documentation, no screens. This plan fixes the
process first: lock the scope, set the quality bar on one pilot family, and
stop for your review after every phase.

## 2. Principles

1. **Code is the source of truth for v1.** Every token, component, variant and
   state mirrors something in `src/`; each component's description names its
   file. Redesign happens in Figma *after* the file matches the app.
2. **Tokens, not values.** Fills, strokes, radii, spacing and text use the
   variables and styles. Raw values only where Figma can't bind them
   (gradient stops, shadow colours), and those are listed in Getting Started.
3. **Work inside the free plan** (verified on Figma's plans page):
   - **3 files per team, no shared libraries** → the system *and* the screens
     live in this one file.
   - **No Dev Mode or Code Connect** → code links go in component descriptions.
   - **One mode per variable collection** → dark only (the app is dark-only).
   - **Reads capped at ~20 a month** → build only with write tools
     (`use_figma`, `upload_assets`), check with in-file snapshots, keep reads
     for turning finished screens into code later. **Planned reads: 0.**
4. **Review gates.** I stop after each phase with snapshots and a checklist.
   Nothing scales past the pilot until you approve it.
5. **Restructure, don't restart.** Keep the 66 variables, 17 styles and the
   medal/rank vectors; rebuild everything that doesn't meet the bar. Nothing is
   deleted until its replacement is approved — v1 parts move to Archive first.

## 3. File structure

| Page | Sections |
|---|---|
| **Cover** | Name, version, status, last update, links to the app and this plan |
| **Getting Started** | How to use tokens and components, naming, raw-value exceptions, how a component maps to code |
| **Foundations** | Color · Typography · Spacing & Radius · Elevation & Effects · Motion · Layout grid · Iconography |
| **Components** | Buttons & Controls · Inputs · Surfaces · Feedback · Navigation · Data display · Gamification · Characters |
| **Patterns** | Home cards · Session · Insights cards · Collection tiles · Celebration blocks |
| **Screens** | Home · Collection · Workout Complete (v1); Train · Insights · Profile · Session (v2) |
| **Archive** | The first-pass page, until its replacements are approved |

*Fallback:* the plans page doesn't say whether pages per file are capped. If
Figma refuses new pages, the same structure becomes named **sections** on three
pages (Foundations, Components, Screens).

## 4. Inventory and v1 scope

### Foundations — keep, then add

| Group | Today | Add |
|---|---|---|
| Colour | 25 primitives → 25 semantic, CSS-variable code syntax | Documentation only |
| Type | 13 text styles (Space Grotesk display, Inter body) | Usage notes per style |
| Effects | 4 styles (card, elevated, accent, brand glow) | — |
| Spacing & radius | Spacing 4–48, radius 16/20/24/full, control heights 44/48/56 | **Icon sizes** 16/20/24/28/32 (`constants/icons.ts`) |
| Motion | — | **Durations** press .12 · fast .2 · dialog .25 · sheet .3 · progress .6 · count .8 s, **easing** `[0.16, 1, 0.3, 1]` (`lib/motion.ts`) |
| Layout | — | 390 × 844 frame, 20 px gutters, 448 px max column (`PageContainer`) |

### Icons — all 74 Lucide icons the app uses

Imported as editable vectors (SVG upload), one component each (`Icon/Name`),
stroke bound to a colour variable, sized by instance. Used by every component
that takes an icon (swap property — never one variant per icon).

### Components — 32 shared, plus the feature parts the v1 screens need

| Family | Components (code in `src/components/…` unless noted) | Variants and states to build | Phase |
|---|---|---|---|
| **Buttons & Controls** *(pilot)* | Button, IconButton, Chip, FilterChipRow, Switch, OptionCard, RangeSelector (`features/insights`) | Button: 4 styles × 3 sizes × Default/Pressed/Focus/Disabled/Loading, leading/trailing icon, full width. IconButton: ghost/surface/brand × states. Chip: solid/accent × selected × states, icon. Switch: on/off × disabled. OptionCard: selected/not. RangeSelector: 7D/30D/90D/1Y | **3a** |
| Inputs | Input, TextArea, SearchInput, Field | Default/Focus/Error/Disabled, helper and error text | 3b |
| Surfaces | Card (rebuild with slots), BottomSheet, Section, Skeleton | Card: default/elevated/accent × padding | 3b |
| Feedback | Badge, DeltaBadge, ProgressBar, CircularProgress, EmptyState, ErrorState, DemoBanner, NetworkStatusIndicator | Badge: 6 tones. Delta: up/down/flat. Ring: tones × sizes × glow. Network: offline/pending/failing | 3b |
| Navigation | BottomNavigation, ScreenHeader, ResumeSessionBanner | Bottom nav: 5 tabs × active | 3b |
| Data display | StatTile, Stat Chip, Avatar, TrendChart, RadarChart, Heatmap cell | Avatar: 5 sizes × default/brand. Heatmap: intensity 0–4, rest, missed, today, future | 3b |
| Gamification | Medal ✓, Rank Insignia ✓, Level Card, XP chip, Collection tile, Level meter | Medal gets an emblem swap slot | 3b |
| Characters | Kix & Nyra busts (stage-cut images), Speech bubble, Tour pointer | Bubble: Kix/Nyra × final line | 3b |

**Patterns for the v1 screens** (`src/features/…`): WelcomeHeader,
DailyMissionCard, CoachCard, PhysIQScoreCard, WeeklyActivityCard (Home);
LevelCard, family/milestone/rank tiles, CollectibleSheet (Collection); XP block,
LevelMeter, BadgeReveal grid, records list, CastReaction, StatChipRow
(Workout Complete).

**Not in v1:** auth forms, onboarding steps, Compete (mock data), HologramBodyScan,
CommandPalette, MuscleAnatomyVisualizer, ExerciseDemoPlayer, CoachAvatar (hidden).

### Screens

- **v1:** Home, Collection, Workout Complete — 390 × 844, built only from
  instances, filled with the app's sample data.
- **v2:** Train, Insights, Profile, Session.

## 5. Definition of done (per component — the pilot proves it)

- Every variant and state that exists in code, named `Property=Value`.
- Visuals bound to variables and styles; any raw value is a listed exception.
- Properties: text, show/hide, icon swap — no duplicated variants for content.
- A documentation block on its page: purpose, anatomy, labelled variant grid,
  do / don't, code path.
- Checked side by side with the app (Figma snapshot vs app screenshot).
- Used in at least one pattern or screen.

## 6. Phases, gates and budget

| Phase | Deliverable | Write calls (est.) | Gate |
|---|---|---|---|
| **0** Brief & inventory | This plan | 0 | **You approve the scope** |
| **1** Structure | Pages (or sections), Cover, Getting Started, documentation template; first-pass page → Archive | ~2 | You approve the structure |
| **2** Foundations | New tokens (icon sizes, motion) + style-guide pages for colour, type, spacing, effects, motion, layout | ~4 | You approve the look |
| **3a** Pilot | 74 icons + Buttons & Controls to the full definition of done | ~5 + 1 upload | **You approve the bar** — fixes happen here, before scaling |
| **3b** Components | The other families, one at a time, each to the pilot's bar | ~15–20 | Snapshot per family |
| **4** Screens | Home, Collection, Workout Complete | ~6 | You review the screens |
| **5** QA & handoff | Audits run as scripts (raw colours, naming, text contrast, detached instances), Getting Started finalised | ~3 | Final sign-off |

Metered reads planned: **0**. AI image credits planned: **0**.

## 7. Decisions taken (change any at Gate 0)

- Restructure the existing file instead of starting a new one.
- Pilot family: **Buttons & Controls**.
- Dark mode only.
- Icons are the Lucide set the code uses.
- Kix and Nyra appear as their stage-cut images, not redrawn.
