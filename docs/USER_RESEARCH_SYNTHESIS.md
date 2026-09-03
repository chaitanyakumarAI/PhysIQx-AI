# PhysIQx AI — User Research Synthesis
*Survey (n=10, July 2026) × Fitness Knowledge Base (50-question research compilation)*

> This document cross-references real user behavior patterns from the survey
> against the evidence from the knowledge base. Every item below maps to a
> specific app decision — feature priority, copy direction, scoring logic, or
> UX design choice.

---

## 1. WHO OUR USERS ACTUALLY ARE

### 1.1 Identity snapshot (survey)

| Dimension | Finding |
|---|---|
| Baseline behaviour | 7/10 go to the gym even when tired — intrinsic identity ("gym = reset button"), not motivation-dependent |
| Primary falloff cause | Exams/college stress (4/10), Injury (2/10), No partner (1/10), No visible progress (1/10) |
| Progress tracking method | Weights/reps going up = progress (6/10) — **numbers-first mindset** |
| Social comparison interest | Low — most scored 1–3 / 5; nobody scored 5 |
| Cardio relationship | Split: love it / hate it / only strength / occasional |
| Workout logging attitude | Ranges from "love it, data is the point" to "extra homework, keep forgetting" |
| Guilt on missed session | Spread 1–5; not uniformly high — no single dominant response |

### 1.2 Science overlay (knowledge base §5, §10)

- The "gym = reset button" identity marker is the strongest predictor of long-term adherence — users who train because of **identity** ("I am a gym person") are far more resilient than those who train for outcome alone (§23).
- College stress as #1 dropout cause is expected: high cortisol from exams competes directly with recovery capacity — the knowledge base flags stress as a legitimate deload trigger (§45), not a willpower failure.
- "No partner" as a dropout cause is the single easiest fix: social accountability mechanics (partner mode, check-in sharing) have the strongest behavioural literature behind them — and this survey confirms it firsthand (§26).

---

## 2. WHAT USERS WANT — FEATURE PRIORITY MATRIX

### Raw feature votes from the survey (top picks)

| Feature | Votes |
|---|---|
| See a clear trend of whether I am improving over weeks | 7 |
| A score or number that shows my overall fitness level | 5 |
| Log what I lifted today (weights, sets, reps) | 5 |
| Track my body measurements or weight over time | 5 |
| Get told what to train next based on my goals | 4 |
| Track my cardio (time, distance) | 4 |
| See how I compare with friends | 2 |

### Science confirmation (knowledge base)

| Feature | Science verdict | Priority |
|---|---|---|
| **Trend visibility** | Most defensible scoring approach is trend-based, not point-in-time (§39, §8). Users are right to want this. | ✅ SHIP NOW |
| **Overall fitness score** | PhysIQ Score is already the hero metric — validated by survey demand | ✅ SHIP NOW |
| **Workout log (sets/reps/weights)** | Estimated 1RM from rep-max formulas is the best practical strength proxy (§8). Logging is the prerequisite. | ✅ SHIP NOW |
| **Body measurements** | Circumference tracking is more sensitive than weight alone during recomposition (§38). Weight + waist is the minimum viable body tracking stack. | 🔶 PHASE 4 |
| **"What to train next"** | The strongest-evidence AI insight is plateau detection → deload/program-adjust (§44, §20). This is exactly what users are asking for. | 🔶 PHASE 5 |
| **Cardio tracking** | Session type + duration + RPE is a legitimate, evidence-supported proxy for cardio fitness without a wearable (§14). | 🔶 PHASE 4 |
| **Social comparison** | Only 2 votes — and knowledge base warns comparison can demotivate (§48). Keep it **opt-in only**, never a core mechanic. | 🔴 OPT-IN |

---

## 3. THE FIVE BIGGEST DESIGN DECISIONS — RESOLVED

### 3.1 Streak design — does a missed day break the streak?

**Survey says**: One respondent explicitly says *"I would be consistent to maintain streak at least, I would show for at least 15 mins for the sake of streak."* This is exactly the maladaptive streak-anxiety the knowledge base warns about.

**Science says (§24, §27)**: Streaks built on loss-aversion cause some users to train through injury/fatigue to protect the number. The "what-the-hell effect" (one lapse → complete abandonment) is well-documented.

**Decision**:
- Planned rest days = streak continues (not a miss).
- Unplanned misses: the streak pauses, NOT resets to zero.
- Monthly "freeze days" (2–3) absorb genuine life events (exams, illness).
- Personal-best streak is preserved permanently even after a break.
- Framing: "Your streak is resting" not "Streak broken."

---

### 3.2 Progress feedback — when to tell users "you're improving"

**Survey says**: Multiple respondents mention not knowing if they're improving as a source of anxiety (*"Google why am I not seeing results at midnight"*, *"Lack of motivation"*). One directly names *"Right progression methods"* as the undertalked frustration.

**Science says (§6, §40)**:
- Visible change: 8–16 weeks minimum.
- Neural gains (feeling stronger): 2–4 weeks.
- Body-shape category shift: 3–6 months.

**Decision**:
- Week 1–3: celebrate **process signals** ("You've logged 3 sessions this week — your nervous system is already adapting").
- Week 4–8: surface **strength trend** (estimated 1RM on key lifts moving).
- Month 3+: surface **body shape trend** (weight + measurements + self-report composite).
- Never surface a progress score during the first 7 days (calibrating state already handles this).

---

### 3.3 Personalisation vs. same-plan-for-everyone

**Survey says**: The strongest open-text signal in the whole dataset — *"Fitness apps adapted workouts and nutrition to my progress instead of giving everyone same plan"*. Also: *"Mixed approaches from mixed persons can result in failure."*

**Science says (§42)**: Individualisation factors in order of evidence strength: training experience > goal > available time/frequency > injury history > age > sex.

**Decision — onboarding must capture**:
1. Training experience level (already collected)
2. Goal (cut/bulk/maintain/endurance — already collected)
3. Days available per week (already collected)
4. Session length preference (not yet collected — **add to onboarding**)
5. Equipment access (home/gym/both — not yet collected — **add to onboarding**)

---

### 3.4 DNA Archetype — keep it, rename it

**Survey says**: Users respond to the identity/archetype framing — it creates a clear sense of personal relevance.

**Science says (§43)**: Genetic variation in trainability is real, but consumer "DNA" claims from a quiz are not scientifically supportable. The correct framing is a **behavioural + performance profile**, not a genetic claim.

**Decision**:
- Rename internally: "Performance Profile" or "Training DNA Profile".
- Copy direction: *"Based on your goals, history, and first weeks of data, your training profile is [Archetype]."*
- Never imply genetic determination. Archetype should update as the user's data evolves.
- The 4 current types (Endurance / Strength / Hybrid / Recomposition) are behaviorally valid — keep the structure, update the language.

---

### 3.5 Workout logging — reduce friction without losing data

**Survey says**: Split between "love logging" and "feels like extra homework / keep forgetting." This is the core logging UX tension for every fitness app.

**Science says (§8, §44)**: The estimated 1RM from logged sets is the best practical strength metric. You need the raw log data to compute it. But you don't need it logged with perfect form every time — a minimum viable log (exercise, weight, reps) is sufficient.

**Decision**:
- Default log view: **3 fields only** — exercise, weight, reps. Sets auto-count.
- Previous session auto-filled as default: user just confirms or adjusts (+2.5kg tap, +1 rep tap).
- Full editing available but never default.
- Post-session summary shows estimated 1RM delta and weekly volume — gives immediate reward for logging.
- Weekly log reminder: context-aware (sent at usual gym time, not a fixed time).

---

## 4. SCORING ENGINE — SPECIFIC CALIBRATIONS

Cross-referencing the knowledge base with the app's current `pillarWeights` and scoring logic:

### 4.1 Consistency pillar (current weight: 30%) — VALIDATED

Survey confirms: 7/10 users track their progress by numbers going up (which requires showing up consistently). Knowledge base confirms consistency is the strongest long-term outcome predictor (§23). Weight appropriate.

**Calibration note**: Planned rest days must be coded as POSITIVE, not neutral or negative (§11). The scoring engine should distinguish `planned_rest` from `unplanned_miss`.

### 4.2 Strength pillar (current weight: 25%) — VALIDATED

Knowledge base: estimated 1RM trend on key compound lifts (squat, deadlift, bench, OHP, row) is the best practical proxy (§8). Current mock uses volume — should eventually use estimated 1RM trend as the primary signal.

**Calibration note**: Expected gain rates must be experience-level-gated (§9):
- Beginner: flag plateau after 4+ weeks of no 1RM movement.
- Intermediate: flag plateau after 6–8 weeks.
- Advanced: flag plateau after 8–12 weeks.

### 4.3 Cardio pillar (current weight: 25%) — VALIDATED

Without wearable: session RPE × duration × type is a legitimate proxy (§14). 30 min Zone 2 ≠ 15 min HIIT — weight by estimated training stress, not raw minutes (§15).

**Calibration note**: A user who doesn't log any cardio should NOT score zero — they should enter `low-signal` state with a soft prompt, per the existing score lifecycle design.

### 4.4 Body Shape pillar (current weight: 20%) — NEEDS REFINEMENT

Current design: user-selected body type only. Knowledge base: user-selected self-report is the least reliable signal on its own (§38).

**Calibration note**: Body Shape score should eventually be a composite of:
1. Weight trend (weekly average, not daily) — 40% weight
2. Self-reported body type selection — 30% weight
3. Circumference input (optional, when user provides) — 30% weight

Until input #3 is available (Phase 4+), the score should display as "partial signal" and explain what would improve its accuracy.

---

## 5. AI INSIGHT GENERATION — EVIDENCE-RANKED PRIORITY

What the AI should surface (in priority order, from knowledge base §44 + survey open text):

| Rank | Insight Type | Evidence basis | Trigger condition |
|---|---|---|---|
| 1 | Plateau detected → suggest deload or program change | §20, §44 | 1RM stalled for experience-appropriate window |
| 2 | Weekly volume on-track / behind target | §12, §44 | Sets-per-muscle comparison to 10-set floor |
| 3 | Under-recovery warning before high-intensity session | §34, §44 | RPE trend creeping up + performance declining |
| 4 | Consistency drift alert | §23, §44 | Attendance rate dropping week-over-week |
| 5 | Hydration before session flagged | §29, §44 | Hydration log below goal before a logged session |
| 6 | Comeback encouragement (no shame) | §27, §50 | User returns after 7+ day gap |
| 7 | Protein target awareness | §31 | After nutrition tracking is enabled |

**Insight copy rules (from §50 + survey tone)**:
- Never: shame language, "you failed", "you missed", comparison to other users.
- Always: reframe setbacks as information, not failure.
- Use present-tense framing: "Your strength trend is flat this week" not "You haven't improved."
- Quote from survey: *"Body is not made in GYM, it is made in KITCHEN"* — users already understand the role of diet; nutrition insights will land well.

---

## 6. ONBOARDING GAPS — ITEMS TO ADD

Current onboarding: Goal → Body Shape → Experience → Split → Rest Days → Session Frequency → DNA Result.

Missing inputs identified from this synthesis:

| Missing field | Why it matters | Where to add |
|---|---|---|
| Session duration preference (30 / 45 / 60 / 90 min) | Drives workout plan length (§22) | After Session Frequency step |
| Equipment access (full gym / home + dumbbells / bodyweight only) | Changes exercise pool entirely (§42) | After Session Duration step |
| Main reason for starting (social, health, aesthetics, sport performance) | Better AI motivation copy (§26, §46) | Welcome step (1 tap, not a form) |
| Starting body type (current, not goal) | Body Shape pillar needs a "before" reference to measure change (§38) | After Goal Body Shape step (reframe: "Where are you now vs where you want to be") |

---

## 7. WHAT TO NEVER BUILD (or build last)

From the convergence of survey signals and knowledge-base warnings:

1. **Global leaderboards / ranked social comparison**: only 2/10 users wanted it; knowledge base warns of comparison-driven demotivation for behind-average users (§48). Opt-in, friends-only maximum.

2. **BMI as a pillar or score input**: knowledge base explicitly validates the app's decision to remove BMI — it punishes muscular users and double-counts with Body Shape (already noted in PHYSIQ_SCORE.md).

3. **DNA claims from a quiz**: survey users respond to the archetype concept; knowledge base says the genetic framing is unsupportable without actual genetic testing (§43). Reframe to "Performance Profile."

4. **Daily weigh-in as a primary metric**: knowledge base warns daily weight fluctuates several pounds from water/food/sodium — weekly averages are the only defensible signal (§38). Daily weigh-in as input is fine; surfacing it as a score driver daily is not.

5. **Rigid streak-or-zero mechanics**: directly causes maladaptive training-through-injury behavior (confirmed by one survey respondent explicitly) and drives the "what-the-hell" abandonment pattern (§24, §27).

---

## 8. COPY & TONE DIRECTION

From the survey open text, users communicate in plain, self-aware, slightly blunt language. Notable direct quotes:

- *"Gym is my reset button"* → identity-level framing works for our users.
- *"Doing Squats with heavy weights"* as best workout → strength/compound-focused users dominate.
- *"Lat pulldown. Coz I like the stretch"* → users track enjoyment, not just performance.
- *"Body is not made in GYM it is made in KITCHEN"* → nutrition literacy is there, not preachy.
- *"Whatever you lift, don't get embarrassed"* → psychological safety matters in the gym context.
- *"Cleaner way of showing what's important other than having too much noise on screen"* → **directlyvalidates the minimalist, one-score design philosophy of PhysIQx**.
- *"Fitness = chaitanya"* → your brand is already personal to them.

**Tone rules**:
- No corporate wellness-speak. No "crush your goals." No "unstoppable."
- Short, direct, honest. Treat users as already-capable adults who need data, not motivation speeches.
- Celebrate consistency as the real achievement, not peak performance moments.
- Safety framing should feel matter-of-fact, not protective/paternalistic.

---

## 9. ACTION MAP — NEXT BUILD PRIORITIES

Based on this synthesis, the highest-evidence, highest-user-demand items in order:

| Priority | Item | Phase |
|---|---|---|
| P0 | Workout log (exercise + weight + reps) with previous-session autofill | Phase 4 |
| P0 | Streak protection: planned rest ≠ miss; freeze days | Phase 4 |
| P1 | Strength trend (estimated 1RM) as primary Strength pillar signal | Phase 4 |
| P1 | Plateau detection → deload/program-change AI insight | Phase 5 |
| P1 | Add session duration + equipment to onboarding | Phase 4 |
| P2 | Body measurement input (waist + weight weekly average) | Phase 4 |
| P2 | RPE field on session log → feeds under-recovery insight | Phase 4 |
| P2 | Rename DNA Archetype → Performance Profile; update copy | Phase 4 |
| P3 | Cardio session log with type + duration + RPE | Phase 4 |
| P3 | Starting body type capture in onboarding | Phase 4 |
| P4 | Hydration goal scaled to bodyweight + logged activity | Phase 5 |
| P4 | Protein tracking (calories + protein, not full macros) | Phase 6 |
| P5 | Social/partner features (opt-in, friends-scoped) | Phase 6 |

---

*Sources: Survey (n=10, July 2026) + docs/FITNESS_KNOWLEDGE_BASE.md (50 Q&A from ACSM, ISSN, NSCA, Schoenfeld et al., Cooper Institute literature)*
*Cross-referenced against: src/lib/score.ts, src/types/score.ts, docs/PHYSIQ_SCORE.md, src/features/onboarding/*
