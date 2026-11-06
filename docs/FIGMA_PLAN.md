# PhysIQx — Figma Design System Plan

*Approved 2026-10-22 (Gate 0). **All phases complete 2026-10-22** — after
Gate 1 the owner asked for the remaining phases without further input, so
gates 2–5 were self-reviewed against §5. Outcome and deviations: §8.*

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

The Starter plan allows **3 pages per file** (Figma refused a fourth), so the
planned pages became named **sections** on three pages. Sections act as
sub-pages: jump between them from the Layers panel.

| Page | Sections |
|---|---|
| **Guide & Foundations** | Cover · Getting Started · Documentation kit; below them, **Foundations**: Color · Typography · Spacing & Radius · Elevation & Effects · Motion · Layout grid · Iconography |
| **Components** | Overview · Buttons & Controls · Inputs · Surfaces · Feedback · Navigation · Data display · Gamification · Characters · Patterns · Archive — first pass (left to right, in build order) |
| **Screens** | Overview · Home · Collection · Workout Complete (v1) · Train · Insights · Profile · Session (v2) — one section per screen, top to bottom, its states left to right |

Every section holds one documentation frame built from the **documentation
kit**: Doc/Page Header (overline, title, description, code path), Doc/Section
Title, Doc/Row (name + description), Doc/Usage (Do / Don't) and Doc/Status
(Done / In review / Planned / Neutral, with its own label). The frames
themselves are plain auto-layout frames, so no instance ever needs detaching.
Until its phase, each section lists what it will hold.

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

### Icons — all Lucide icons the app uses (100; the first count of 74 missed multi-line imports)

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

## 8. Outcome (2026-10-22)

**Built.** 217 variables (Primitives, Color, Radius, Spacing, Motion), 44 text
styles, 5 paint styles, 20 effect styles, 1 grid style; 48 component sets and
683 components including variants; 101 icon components (100 Lucide + Play
Filled); documentation for every component (purpose, variants, properties,
anatomy or usage, code path); screens Home, Collection (default + badge sheet)
and Workout Complete (quiet day from the sample data + an illustrative big
day). Metered reads used: 0.

**Checked.** Scripted audits over all three pages: 0 raw solid fills, 0 raw
strokes, 0 text layers without a style, 0 generic layer names, 0 components
without a description, 0 detached instances. The three screens were compared
side by side with the running app (sample data).

**Deviations from the plan, and why.**
- Three pages with sections (Starter plan limit), as the fallback in §3.
- 100 icons, not 74 — the first inventory missed multi-line imports.
- Translucent colours are their own tokens (e.g. `color/bg/brand-subtle`):
  Figma drops paint opacity on token-linked fills.
- Display text styles use Tailwind's size names (Display/2XL = `text-2xl`);
  Label/Overline corrected to the app's 12 px; missing sizes added.
- Progress values are variants (ProgressBar, Level Bar): Figma can't resize
  layers inside an instance.
- Character images are PNG copies of the WebP stage cuts (Figma doesn't decode
  WebP here); Space Grotesk SemiBold isn't available, so Bold stands in for
  speech bubbles.
- "XP chip" isn't a component in code (XP shows inline in labels); Field is
  built into Input and TextArea, as in code; RadarChart is documented but no
  screen uses it yet.
- Patterns use the Card styles directly rather than nesting a Card instance.

**Found in code while mirroring it.** Small labels in `text-foreground-muted`
(CoachCard kicker, badge-sheet XP, heatmap labels) are below AA at 11–12 px;
the Figma components mirror them and their descriptions flag it.

**Next.** v2 screens (Train, Insights, Profile, Session); delete the Archive
section after approval; set the Cover as the file thumbnail (right-click ›
Set as thumbnail — the API can't).

## 9. Outcome v2 (2026-11-04)

**Built.** Train, Insights, Profile and Session — Default (390 wide, Home's shell:
padding 16/20/144/20, gap 32, ambient light, fixed BottomNavigation; Session has
no nav), built only from instances with the app's sample data. 20 new patterns
in the Patterns section with docs blocks: WorkoutHeroCard (Ready / Rest day),
ProgramSummaryCard, MyPlansEmpty, Exercise Row; ScoreTrendCard, Insight Card,
BodyBalanceCard, TrainingLoadCard, Lift Standard, StrengthStandardsCard,
PersonalRecordCard, StreakHeatmapCard; ProfileHeaderCard, Settings Row,
Settings List; Session Top Bar, Session Progress, Difficulty Suggestion,
Set Row, Exercise Session Card. New icons: Cloud, LogIn. Doc/Status set to Done.

**Checked.** Scripted audits: 0 raw fills or strokes, 0 unstyled text, 0
components without a description, 0 horizontal overflow. Compared with the
running app (sample data). Small heatmap labels and the CoachCard / Tier Row
mirrors now use `color/text/secondary`, as in code. Metered reads used: 5.

**Deviations.** Chip rows on the v2 screens are clipped frames of Chip
instances (FilterChipRow's fixed 80 px chips cut long labels); the profile
avatar shows initials, not the sample photo; the TrendChart line is the
component's sample curve; TrainingLoadCard's StatChipRow puts the value above
the label (code: label first).

**Approved** by the owner 2026-11-06. The Archive section (first-pass Button, Chip, Card, Stat Chip, Progress Bar and review frame; no instances outside it) was then deleted, with its Guide and overview rows; Figma's version history keeps it.

**Next.** Set the Cover as the file thumbnail (right-click › Set as thumbnail — the API can't).
