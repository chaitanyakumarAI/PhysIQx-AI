# Component Index

One line per component. **Check here before creating anything new** — this
index exists so reuse doesn't require a repo-wide search. Keep it updated when
adding components.

## ui/ — domain-agnostic primitives

| Component | Purpose |
|---|---|
| `Button` | Action button: primary / secondary / ghost / danger, loading + disabled, asChild for links |
| `IconButton` | 44px round icon-only button; required accessible `label` |
| `Card` | Surface container: default / elevated / accent (green-tinted signature card) |
| `Field` | Internal form-field shell (label + helper/error); used by Input & TextArea |
| `Input` | Text input with label, helper, error states |
| `TextArea` | Multiline input, same field chrome as Input |
| `SearchInput` | Pill search field with leading icon + optional shortcut hint |
| `Avatar` | Initials or image avatar; brand gradient variant for the current user |
| `Badge` | Static label pill: neutral / brand / warning / danger / info / outline |
| `DeltaBadge` | Signed-change badge built on Badge: up/down icon, brand/danger tone, "+N"/"N" formatting |
| `Chip` | Toggleable filter pill (aria-pressed); solid or accent selected style |
| `FilterChipRow` | Horizontally scrollable single-select chip row built on Chip; promoted from Train once a third feature (Compete) needed it |
| `ProgressBar` | Linear progress; brand / info / warning / danger / neutral / legendary tones |
| `CircularProgress` | SVG progress ring with center-content slot; optional brand glow |
| `Skeleton` | Pulsing loading placeholder, shaped via className |

## layout/

| Component | Purpose |
|---|---|
| `PageContainer` | Centered mobile column (`<main>`), gutters, bottom-nav clearance |
| `Section` | `<section>` with letter-spaced uppercase heading + action slot |

## navigation/

| Component | Purpose |
|---|---|
| `BottomNavigation` | Fixed five-tab bar; items passed as config; animated active pill |
| `ScreenHeader` | Page title block: display heading, subtitle, leading/trailing slots |

## charts/ — generic visualization primitives

| Component | Purpose |
|---|---|
| `TrendChart` | Sparkline/area chart from a plain `number[]`; brand/info tones |
| `RadarChart` | N-axis polygon chart; hidden text list carries the data for screen readers |
| `HeatmapCalendar` | GitHub-style DayStatus grid; reuses `dayStatusTone` from `@/types/training` |

## feedback/

| Component | Purpose |
|---|---|
| `EmptyState` | Icon + message + CTA for empty content |
| `ErrorState` | Friendly recoverable error with retry button |

## providers/

| Component | Purpose |
|---|---|
| `MotionProvider` | LazyMotion + reduced-motion config; use `m.` components, never `motion.` |

## Rules

- Domain-specific components (anything named Workout/XP/Mission/…) live in
  `src/features/<feature>/components/`, never here.
- Icons: Lucide only, sized via `iconSize` from `@/constants/icons`.
- Animation: durations/variants from `@/lib/motion`; CSS transitions for
  simple press/hover effects.
