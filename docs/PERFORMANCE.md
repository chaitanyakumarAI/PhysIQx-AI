# Performance Budget

Size and smoothness are different problems. The APK may spend up to 80MB
on disk; the main thread gets nothing extra, ever. A big app lags only
when it's built lazily — these rules are what "built properly" means for
PhysIQx, and every asset or feature addition is gated against them.

**The one-line policy: spend megabytes on disk freely, spend ZERO extra
on the main thread.**

## Hard numbers (the gates)

| Metric | Budget | How it's checked |
|---|---|---|
| JS per route (gzipped, first load) | ≤ 200KB | `npm run build` output table |
| Animation frame rate | 60fps at 4× CPU throttle | Throttled puppeteer/Lighthouse run on the affected flow |
| Layout shift (CLS) | 0 — no exceptions | Every image/embed declares dimensions |
| Interaction latency (INP) | < 200ms on throttled profile | Throttled run |
| Simultaneous playing videos | 1 | Code review — off-screen media pauses |
| Total APK | ≤ 80MB | Release build |
| PWA first visit | ≤ ~1MB transferred | Network tab, cold cache |
| GIF files in the repo | 0 | Non-negotiable |

The benchmark device is NOT the developer's machine: it is a budget
Android (~3GB RAM). All fps/latency gates run with 4× CPU throttling to
simulate it.

## Rendering rules (why the app feels fast)

1. **GPU-only animation.** Everything animates `opacity`/`transform`
   exclusively — never width/height/top/left or anything that triggers
   layout. This is the difference between 60fps and jank and it is a
   hard rule, already true across the codebase.
2. **Entrance choreography plays once per session** (`useEntranceOnce`).
   Returning to a screen renders instantly. New screens follow suit.
3. **Route-level code splitting** (Next.js default — don't defeat it):
   no barrel imports that drag one tab's dependencies into another's
   bundle; heavy client components load via `next/dynamic` when they
   aren't needed for first paint.
4. **Long lists never fully render.** The catalog pages at 10 with
   Show-more; any future list past ~30 rows pages or virtualizes.
5. **Static prerendering stays on.** Screens arrive as ready HTML.
   `useSearchParams` consumers live inside `<Suspense>` so they can't
   force a route dynamic.

## Asset rules (where quality-without-lag is won or lost)

1. **Nothing loads until it's needed.** Exercise demos load only when
   that exercise's page opens — Train never touches them. Mascot
   animations load on the surfaces that show them. On the APK, lazy
   assets are on disk (instant); on PWA they stream per-view.
2. **Right format, full quality — never "compressed-looking":**
   - Images: WebP/AVIF (≈half the bytes of PNG at identical visual
     quality). PNG only where transparency tooling demands it.
   - Mascot & celebration effects: **Rive** (vector — crisp at every
     size, ~1% of a GIF's weight). Lottie acceptable; GIF banned.
   - Exercise demos: 2–4s looping **WebM**, ~150–250KB each, muted,
     `playsInline`, paused the moment they leave the viewport.
   - Audio: short OGG/M4A cues, loaded on first user interaction.
3. **Decode off the main thread.** Images use `decoding="async"` and
   explicit width/height (or aspect-ratio boxes) so scrolling never
   blocks and nothing shifts.
4. **One media element plays at a time.** IntersectionObserver pauses
   everything off-screen.
5. **The mascot never blocks anything.** He animates in his own
   composited layer; under `prefers-reduced-motion` or on struggling
   devices he degrades to a static pose rather than dragging the UI.
6. **Fonts stay at one family** (Space Grotesk + system fallbacks),
   subset and `display: swap`.

## The 80MB spending plan (approved allocation)

| Asset | Budget | Rule that keeps it smooth |
|---|---|---|
| Exercise demo clips (189 × ~200KB WebM) | ~30–45MB | Lazy per-detail-page, one playing, pause off-screen |
| Mascot suite (Rive) | ~2–4MB | Own layer, static-pose fallback |
| Body-type silhouettes (18, retina) | ~3–5MB | Lazy on picker open, WebP |
| Sound + haptics pack | ~2–3MB | Loaded on first interaction |
| Celebration effects (Rive) | ~1MB | Fire-and-forget, GPU layer |
| Current app | ~15–25MB | Already within all gates |

Refused regardless of headroom: full-length tutorial video in the bundle
(streaming's job), 4K anything, second font families, GIFs.

## Verification workflow

Any PR/commit that adds an asset class or a new animated surface must
include a throttled-profile check of the affected flow (puppeteer with
CPU throttling or Lighthouse), and the build-output size table for
touched routes. "It feels fine on my machine" is not a gate.
