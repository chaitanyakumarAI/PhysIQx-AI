# Development Workflow

## Objective

Build PhysIQx AI incrementally.

Each feature should be completed, reviewed, and committed before starting the next.

Avoid working on multiple unrelated features simultaneously.

---

# Development Order

## Phase 1

UI Recreation

- Design System
- Shared Components
- Home
- Workout
- Analytics
- Community
- Profile
- Authentication UI
- Onboarding
- Workout Session
- Settings

Mock data only.

---

## Phase 2

Frontend Integration

- Routing
- Navigation
- Theme
- Global State
- Mock Services
- Form Validation

---

## Phase 3

Authentication

- Supabase Auth
- Email Login
- Google Login
- Apple Login
- Session Management

---

## Phase 4

Database

- User Profile
- Workout Logs
- Exercise History
- Water Intake
- Nutrition
- XP
- Achievements

---

## Phase 5

Core Features

Workout Logging

Water Tracking

Protein Tracking

Health Score

Achievements

XP

Levels

Leaderboard

Challenges

Offline Support

---

## Phase 6

AI Features

AI Coach

Workout Recommendation

Health Recommendation

Adaptive Difficulty

PhysIQ Score™

---

## Phase 7

Machine Learning

Health Score Prediction

Workout Recommendation Engine

Consistency Prediction

Progress Forecasting

---

## Phase 8

Optimization

Accessibility

Performance

SEO

Testing

Deployment

---

# Development Rules

Implement one feature at a time.

Finish it completely.

Review.

Commit.

Then continue.

---

# Before Writing Code

Understand the task.

Read only relevant files.

Reuse existing components.

Avoid duplicate code.

---

# Before Creating Components

Check if a similar component exists.

If yes

Reuse it.

If no

Create a reusable component.

---

# Before Creating Screens

Identify

Hero

Primary Action

Secondary Content

Navigation

Loading

Empty State

Error State

---

# Code Standards

TypeScript only.

Strict typing.

No any.

No duplicated logic.

Prefer composition.

Avoid prop drilling when unnecessary.

Use Zustand for shared state.

Use React Hook Form for forms.

Use Zod for validation.

---

# Styling

Tailwind CSS only.

No inline styles.

No duplicated utility classes.

Extract reusable UI when repeated.

---

# Animations

Framer Motion only.

Animations should communicate

Progress

Feedback

Navigation

Completion

Avoid decorative motion.

---

# Git Workflow

Commit frequently.

Recommended commits

Initial Project

Design System

Home Screen

Workout Screen

Analytics

Community

Profile

Authentication UI

Navigation

UI Polish

UI Complete

Authentication Logic

Database

Workout Engine

Health Score

AI Coach

Deployment

---

# Commit Format

feat: home dashboard

feat: workout screen

feat: analytics

fix: navigation bug

refactor: shared cards

style: improve spacing

docs: update project docs

---

# Pull Request Checklist

✓ Builds successfully

✓ No TypeScript errors

✓ No lint errors

✓ Responsive

✓ Accessible

✓ No duplicated components

✓ Uses design system

✓ Motion verified

---

# Definition of Done

A feature is complete only if

✓ Responsive

✓ Accessible

✓ Type-safe

✓ Uses reusable components

✓ Loading state exists

✓ Empty state exists

✓ Error state exists

✓ Animation added

✓ Lint passes

✓ Build passes

✓ Committed

---

# Never

Never redesign without instruction.

Never implement multiple unrelated features.

Never create duplicate UI.

Never leave unused code.

Never leave TODO comments.

Never commit broken code.