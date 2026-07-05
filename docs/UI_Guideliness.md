# UI Guidelines

## Design Philosophy

PhysIQx AI should feel like a premium product.

The experience should resemble Apple Fitness, WHOOP, Nike Training Club, Arc Browser and Linear.

The interface should be elegant, minimal, modern and highly polished.

Avoid looking like a generic fitness tracker.

Avoid unnecessary decorations.

Every screen should have one clear purpose.

---

# Design Principles

- Simplicity over complexity.
- Premium over flashy.
- Information over decoration.
- Motion with purpose.
- Consistency over creativity.
- Progress should always be visible.

---

# Color System

## Primary

Green

#4ADE80

Used for

- Primary buttons
- XP
- Progress
- Success
- Health Score
- Active states

---

## Accent

Emerald

#22C55E

Used for

- Hover
- Highlights
- Selected chips

---

## Background

Dark

#09090B

---

## Surface

#111827

---

## Elevated Cards

#18181B

---

## Borders

#27272A

Very subtle.

Never use heavy borders.

---

## Text

Primary

#FAFAFA

Secondary

#A1A1AA

Muted

#71717A

Disabled

#52525B

---

## Status Colors

Success

#22C55E

Warning

#F59E0B

Danger

#EF4444

Info

#3B82F6

---

# Typography

Font

Inter

Fallback

System Fonts

---

# Font Scale

Display

36

Heading

30

Title

24

Section

20

Subtitle

18

Body

16

Caption

14

Small

12

---

# Font Weight

Display

700

Heading

700

Title

600

Body

400

Caption

400

Avoid unnecessary font weights.

---

# Spacing

Use only the 8-point grid.

Allowed values

4

8

12

16

24

32

40

48

64

Never use random spacing.

---

# Border Radius

Buttons

16

Cards

20

Dialogs

24

Inputs

16

Avatars

9999

Keep radius consistent.

---

# Shadows

Very subtle.

Cards

Small elevation.

Buttons

Soft elevation.

Never use heavy shadows.

---

# Icons

Lucide Icons only.

Sizes

16

20

24

28

32

Do not mix icon libraries.

---

# Buttons

Primary

Filled Green

Secondary

Outline

Ghost

Transparent

Danger

Red

Loading state required.

Disabled state required.

Pressed animation required.

---

# Inputs

Rounded

Minimal borders

Soft focus ring

Large touch targets

Support

- label
- helper text
- error state

---

# Cards

Every card should communicate

Status

Progress

Action

Reward

Cards should never only display data.

---

# Navigation

Bottom Navigation

Five tabs

Home

Workout

Analytics

Community

Profile

Active item

Green

Inactive

Muted

Navigation should remain visible.

---

# Motion

Use Framer Motion.

Motion should communicate state.

Avoid decorative animations.

---

# Standard Animations

Page transition

200ms

Card entrance

200ms

Button press

120ms

Progress animation

600ms

XP counting

800ms

Chart animation

600ms

Dialog

250ms

Bottom Sheet

300ms

---

# Scroll

Smooth

Natural

No layout jumps.

---

# Loading

Skeleton loaders.

No spinners unless unavoidable.

---

# Empty States

Illustration

Helpful message

Primary CTA

Never leave blank screens.

---

# Error States

Friendly

Actionable

Retry button

No technical errors shown.

---

# Charts

Use Recharts.

Rounded corners.

Minimal grid lines.

Consistent green palette.

Always include labels.

Always animate.

---

# Dashboard Rules

Top Hero Card

↓

Today's Mission

↓

Progress Cards

↓

AI Insight

↓

Recent Achievement

↓

Quick Actions

Hierarchy should always remain consistent.

---

# Health Score

Health Score is the primary product identity.

Display prominently.

Use circular progress.

Show

Current Score

Trend

Previous Score

Recommendation

---

# XP

XP should always animate.

Show

Current XP

Required XP

Level Progress

Reward

---

# Achievements

Use premium badges.

Support

Locked

Unlocked

Progress

Rare

Epic

Legendary

Hidden

---

# Leaderboards

Avatar

Name

Level

XP

Rank

Movement

Current Position

---

# Accessibility

Minimum touch target

44x44

High contrast.

Readable typography.

Support dynamic text.

Keyboard accessible.

Semantic HTML.

---

# Responsiveness

Mobile-first.

Primary target

390x844

Support

320+

768+

1024+

Never break layouts.

---

# Images

Rounded corners.

Lazy loaded.

Consistent aspect ratios.

Use placeholders during UI phase.

---

# Component Rules

Every repeated UI must become a reusable component.

Never duplicate

Buttons

Cards

Progress Bars

Headers

Navigation

Charts

Inputs

Dialogs

---

# Naming

PascalCase

Examples

HealthScoreCard

WorkoutCard

XPProgress

BottomNavigation

MissionCard

LeaderboardCard

---

# Premium Feel Checklist

Every screen should satisfy:

✓ One clear primary action

✓ Strong visual hierarchy

✓ Plenty of whitespace

✓ Smooth animations

✓ Premium typography

✓ Consistent spacing

✓ Reusable components

✓ No clutter

✓ No unnecessary colors

✓ Minimal cognitive load

✓ One-handed usability

---

# Things to Avoid

Do not use:

Heavy gradients

Glassmorphism everywhere

Bright neon colors

Multiple accent colors

Random spacing

Tiny buttons

Crowded cards

Nested cards

Long forms

Generic dashboard layouts

Clipart

Material Design defaults

Cheap-looking UI kits

---

# Definition of Done

A screen is complete only if it has:

✓ Responsive layout

✓ Loading state

✓ Empty state

✓ Error state

✓ Motion

✓ Accessibility

✓ Reusable components

✓ Type safety

✓ Dark mode consistency

✓ Matches the design system

✓ Production-quality code