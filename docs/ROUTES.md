# Routing Architecture

How navigation is structured, why, and how it grows. Framework: Next.js App
Router. Route names use the shipped navigation vocabulary from `/design`
(**Train / Insights / Compete**), which is canonical over older doc names
(Workout / Analytics / Community).

Guiding rule: **every meaningful application state has a URL.** Deep links,
notifications, AI-suggested actions, and offline resume all depend on this.
If a screen can't be linked to, it can't be pushed to, shared, or restored.

---

## Route hierarchy

Three route groups, three layout worlds:

```
(auth)                      public, minimal layout (logo, no nav)
  /login
  /signup
  /forgot-password

(onboarding)                protected, step-flow layout (progress, no tabs)
  /onboarding              → step flow: goal, experience, split,
                             rest days, water, DNA result

(app)                       protected, tab shell layout (bottom nav)
  /home
  /train
  /train/exercises/[id]     exercise detail
  /insights
  /compete
  /compete/challenges/[id]  challenge detail
  /profile
  /profile/settings         settings sections as sub-routes as they grow
  /profile/achievements     full collection view

(app, full-screen — inside auth, outside the tab shell)
  /session/[id]             workout session: live view while active,
                            summary/celebration once completed

/                           entry redirect (see navigation flow)
```

### Why this shape

- **One tab shell layout owns the bottom navigation.** The five tabs are
  siblings under `(app)`; switching tabs never remounts the nav, so the
  active-pill animation and scroll positions behave like a native app. Tab
  screens stay light and prefetched — tab switching must feel instant.
- **The session is a route, not a modal.** It is long-lived (an hour), must
  survive refresh/app-kill, needs deep linking ("resume your workout"
  notification), and hides the tab bar (full attention, one-handed use). It
  lives inside the authenticated group but outside the tab layout.
- **Detail screens nest under their tab** (`/train/exercises/[id]`) so back
  behavior is predictable and the correct tab stays active — "users should
  never wonder where they are."
- **No parallel routes, no intercepted routes, no modal routing.** The app's
  navigation model is tabs + push + one full-screen flow. Advanced App Router
  features add maintenance cost with no user-visible benefit here.

## Layouts

| Layout | Owns | Used by |
|---|---|---|
| Root | Theme, fonts, providers, viewport | everything |
| `(auth)` | Centered minimal frame | login/signup |
| `(onboarding)` | Step progress header, step transitions | onboarding flow |
| `(app)` tab shell | Bottom navigation, safe areas, max-width mobile column | five tabs + their details |
| Session | Timer-first chrome, no tabs, leave-guard | /session/[id] |

The tab shell also implements the responsive strategy: a centered mobile-width
column on ≥768px viewports. True desktop layouts are out of scope until
designed.

## Public vs. protected

- **Public:** `(auth)` routes and the root redirect. Nothing else.
- **Protected:** `(app)`, `(onboarding)`, `/session/*`.
- **Phase 1 (UI recreation):** no real guard exists; all routes render with
  mock identity. The *structure* is built now so Phase 3 adds enforcement
  (middleware session check) without moving a single route.
- Auth state has three answers, and routing must handle all of them:
  unauthenticated → `(auth)`; authenticated without completed onboarding →
  `(onboarding)`; authenticated + onboarded → `(app)`.

## Navigation flows

**Entry:** `/` resolves auth state and redirects to `/login`, `/onboarding`,
or `/home`. The app has no public landing page yet; when marketing pages
arrive they take `/` and a `(marketing)` group, moving this redirect logic —
reserve for it, don't build it.

**Auth flow:** login/signup → success → onboarding check → `/home`.
Onboarding is skippable-forward only (sensible defaults), never re-entered
implicitly; it can be revisited from settings.

**Session flow (the critical path):**
1. Mission card or Train hero → **creates a WorkoutSession** → pushes
   `/session/[id]`.
2. In session: back/gesture triggers a leave-guard — *pause and keep* (never
   discard silently; abandoned work is saved, per the never-punish principle).
3. While a session is `active`, every tab screen shows a persistent
   resume banner → deep-links back to `/session/[id]`. Refresh, app kill, or
   offline mid-session must all restore into the same route with state intact
   (session state is local-first — see DATA_MODELS.md).
4. Completion finalizes the session; `/session/[id]` now renders the
   summary/celebration (XP animation) instead of the live view — **one route,
   two states, keyed off session status**. Done → `/home`. Because completed
   sessions keep their URL, historical workout detail views and
   feed/notification links to past sessions come free.

**Back behavior contract:** within a tab, back pops the tab's stack; the
Android back gesture from a tab root goes to Home, then exits. Details never
cross tabs.

## Deep linking

Canonical URLs are a product feature, not a technicality:

- Notifications land on exact targets: streak-risk → `/home`, challenge
  result → `/compete/challenges/[id]`, resume → `/session/[id]`.
- AI Insights carry a suggested-action link (an Insight about hydration links
  into the log flow; one about a bench PR links to `/train/exercises/[id]`).
- Insights time ranges (7D/30D/90D/1Y) are URL search params — shareable and
  restorable. Ephemeral filters (muscle-group chips) stay in component state;
  promote to params only when a real link-to-filtered-view need appears.
- **Quick-log actions (water) are moments, not destinations** — they
  render as sheets, not routes. But hydration reminders and Insight actions
  must be able to open them, so they get an addressable trigger: a search
  param on the owning tab (`/home?log=water`). Rule of thumb: destinations
  get paths, moments get params.

## Offline

- Routing never depends on the network: screens render from the local data
  layer (mock fixtures now; local store/cache later), so every route resolves
  offline by construction.
- The app shell (layouts, nav, fonts) is static and cacheable — a PWA
  service-worker phase caches the shell without route changes.
- `/session/[id]` is the hard requirement: fully functional in airplane mode.
  This is guaranteed by the data layer, but the route contract is stated here
  because navigation into/out of a session must never block on network.

## Future expansion (reserved, not built)

| Route | Feature |
|---|---|
| `/coach` | Conversational AI Coach, if it outgrows inline cards |
| `/fuel` or `/fuel/scanner` | Food scanner / full nutrition logging |
| `/profile/photos` | Progress photos |
| `/profile/history` | Full session-history list (detail already exists at `/session/[id]`) |
| `/profile/integrations` | Wearables / Apple Health / Health Connect |
| `(marketing)` group at `/` | Public site, SEO pages |

Rule for adding routes: a new feature gets a new route when it is a
*destination* (linkable, restorable, back-navigable). It stays a component
when it is a *moment* (celebration overlay, confirmation sheet). When in
doubt, ask whether a notification would ever need to link to it.
