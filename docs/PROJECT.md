# PhysIQx AI

## Vision

PhysIQx AI is a premium AI-powered fitness platform that combines
fitness tracking, gamification, intelligent recommendations,
and beautiful analytics.

The application should feel closer to Apple Fitness, WHOOP,
Nike Training Club and Linear than a traditional fitness tracker.

The objective is not simply logging workouts.

The objective is helping users build long-term fitness consistency.

---

# Current Phase

UI Recreation

Current objective:

Recreate the Lovable UI with reusable React components.

Use mock data only.

No backend implementation.

---

# Product Philosophy

Users should feel

- Motivated
- Rewarded
- Healthy
- Consistent

Never punished.

The app celebrates progress rather than perfection.

---

# Core Identity

Everything revolves around

PhysIQ Score™

Every user action contributes to improving this score.

Examples

Workout

↓

Health Score

Protein

↓

Health Score

Hydration

↓

Health Score

Consistency

↓

Health Score

The score becomes the center of the application.

---

# Primary Features

Authentication

Home Dashboard

Workout Planner

Workout Session

Exercise Library

Analytics

Community

Achievements

Leaderboard

Profile

AI Coach

Settings

Offline Support

---

# Future Features

Health Connect

Apple Health

Wearables

AI Food Scanner

Progress Photos

Recovery Analytics

ML Recommendation Engine

These should NOT be implemented during UI recreation.

---

# UI Principles

Premium

Minimal

Modern

Dark Mode First

High information hierarchy

Large touch targets

Smooth motion

Subtle gamification

Avoid clutter.

Avoid unnecessary decorations.

---

# UX Principles

One primary action per screen.

Fast interactions.

Minimal cognitive load.

Everything important should be visible within one scroll.

No unnecessary dialogs.

---

# Current Development Phase

Only recreate UI.

Mock data only.

No authentication logic.

No API calls.

No backend.

No database.

---

# Tech Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion

Charts

- Recharts

State

- Zustand

Forms

- React Hook Form
- Zod

---

# Folder Structure

src/

app/

components/

features/

hooks/

lib/

store/

constants/

types/

data/

styles/

---

# Development Order

1 Home

2 Workout

3 Analytics

4 Community

5 Profile

6 Authentication

7 Onboarding

8 Workout Session

9 Navigation

10 Polish

After UI completion

Authentication

Backend

Database

Offline Mode

AI

ML

Deployment