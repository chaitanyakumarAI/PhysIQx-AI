# PhysIQx — Gamification Study & Design (v2)

*Research and design spec, 2026-10-15. Covers XP, levels, ranks, the
collection, and Kix & Nyra in the app tour. Implementation lives in
`src/lib/gamification/` and `src/features/tour/`.*

---

## 1. What the evidence says

| Finding | Source | What we do with it |
|---|---|---|
| Gamified interventions raise physical activity with a small-to-medium effect (Hedges' g = 0.42; +1,610 steps/day), across 16 RCTs and 2,407 people | Mazeas et al., *JMIR* 2022 | Worth doing — but keep expectations honest |
| The effect **fades when the game stops** (g = 0.15 at 12–24 weeks after) | same | The system must be permanent and woven into training, not a launch campaign |
| The **number of game mechanics doesn't change the effect** | same (meta-regression β = .01) | Few mechanics, done well: XP → levels → ranks → collection, plus characters |
| Rewards tied to **performance** don't undermine intrinsic motivation; rewards for merely showing up, expected and tangible, can (d ≈ −0.3 to −0.4). Positive *competence* feedback increases it (d = 0.33) | Deci, Koestner & Ryan 1999 (128 studies); Cameron et al. | XP scales with work actually done; badges mark mastery and milestones, never "opened the app" |
| Streak motivation decays as streaks grow (2→3 days = +50%; 200→201 = +0.5%). Fear of losing a streak can stop people from starting one — hence Streak Freeze | Duolingo streak research | Milestones get further apart (7/30/90/365). Our weekly rest allowance is the built-in freeze |
| Retention is most fragile in the **first 7 days** | Duolingo (Lenny's Podcast) | Early levels come fast; first badges are reachable in session one (endowed progress) |
| Characters engage when they have **consistent personalities** and **react to what you do**; animations on success are rewards in themselves | Duolingo (Ryan Sims, design); Finch reviews | Kix and Nyra speak in character, react to real events, never nag |
| Show-then-explain onboarding; gate features to limit cognitive load | Clash of Clans tutorial analyses (Game Developer) | The tour points at the real UI while the characters talk; it never shows slides |

## 2. How the real apps do it

| App | Mechanic | Detail | Take |
|---|---|---|---|
| **Fitocracy** (the original gamified lifting app) | Points per logged exercise, scaled by estimated benefit → levels; achievements with bonus points; time-limited quests | Levels come "fairly often and early"; bodyweight work was under-scored (a known flaw) | ✅ XP from training, front-loaded levels. ⚠️ Don't under-reward bodyweight: our XP uses completed sets, not load |
| **Garmin Connect** | Badges worth 1–8 points by difficulty → 10 levels | Players complain thresholds were never published | ✅ Badge XP by difficulty. ✅ Always show exactly what's needed for the next level |
| **Peloton** | Milestone ladders per class type (10/25/50/100 "Century"/1,000 "Millennium"); daily and weekly streak badges; challenges | Weekly streaks run to 52/104/208 weeks; a streak can be earned again | ✅ Milestone ladders. ✅ Weekly consistency (Perfect Week) suits strength training better than daily |
| **Apple Fitness** | Perfect Week / Perfect Month; streak records; monthly personalised challenges; limited editions | Personal goals, so everyone can earn them | ✅ Perfect Week/Month against *your* plan, not a universal target |
| **Nike Run Club** | Run Levels by lifetime distance, each a colour (Yellow → Orange → Green → Blue → Purple → Black → Volt) worn across the UI | Identity through colour | ✅ Ranks with a material/colour that appears on the profile and level badge |
| **Pokémon GO** | Each medal has Bronze/Silver/Gold/Platinum tiers; many are hidden until you start; platinum medals gate high levels | Long-tail goals for every play style | ✅ Four tiers per family. ✅ Top tiers gated by level (the requested "unlock after a certain level") |
| **Strava** | Challenges with digital trophies; Local Legends rewards *frequency* over speed on a 90-day window | Consistency beats talent | ✅ Count effort and showing up, not just peak numbers |
| **Duolingo** | XP; weekly leagues with promotion/demotion; streak + freeze; cast of characters | Leagues need a real user base | ⏳ Leagues later (Compete needs real users). ✅ Character cast |
| **Clash of Clans** | Town Hall levels gate buildings; characters (Master Builder etc.) introduce new areas with speech bubbles, pointing at what to tap | Unlocks feel like growth | ✅ Level-gated collection. ✅ The tour as a character dialogue over the real UI |
| **Finch** | A pet character whose wellbeing mirrors your self-care | Emotional attachment drives habit | ✅ Kix and Nyra react to the athlete's real progress (future: home reactions) |

### What we deliberately avoid
- **Pay-to-win or pay-for-badges** (Garmin's 2025 subscriber-only double points drew backlash).
- **Leaderboards against strangers before there's a community** — social comparison scored low in our own survey (n = 10).
- **XP for opening the app** or other empty actions (overjustification risk).
- **Punishing loss mechanics** — no XP loss and no level decay. The score already handles "recent form".

## 3. The design

### 3.1 XP — what earns it

XP is derived from the ledger (recomputable, like the score), so it can't
drift. Effort is the unit: completed sets, minutes, real records.

| Activity | XP | Guard against grinding |
|---|---|---|
| Finish a workout | The plan day's reward (150–400) × completed ÷ planned sets | Empty sets can't be completed |
| New personal record (best estimated 1RM on a lift) | +50 | Max 3 per workout |
| Cardio (20 min or longer) | 2 per minute | Max 120 per activity |
| Weigh-in | +15 | Once per 7 days |
| Perfect Week (weekly target hit) | +150 | Once per week |
| Setup completed (welcome bonus) | +150 | Once — gets new athletes to level 2 with their first workout (endowed progress) |
| Collection item earned | Bronze 50 · Silver 100 · Gold 250 · Platinum 500 · Legendary 1,000 | Each once |

Typical pace: 4 workouts, 2 cardio sessions and a weigh-in per week ≈ 1,500 XP.

### 3.2 Levels — harder as you go

Total XP to reach level L: **500 × (L − 1)^1.5** (polynomial; each level
costs more than the last — ~900 XP for level 2, ~2,250 at level 10, ~5,250
at level 50). Max level 100.

| Level | Total XP | At ~1,500 XP/week |
|---|---|---|
| 2 | 500 | First workout |
| 5 | 4,000 | ~2–3 weeks |
| 10 | 13,500 | ~2 months |
| 20 | 41,400 | ~6 months |
| 30 | 78,100 | ~1 year |
| 50 | 171,500 | ~2 years |
| 100 | 492,500 | Years — a lifetime badge |

### 3.3 Ranks — identity by level (Nike-style)

| Rank | Levels | Material |
|---|---|---|
| Rookie | 1–4 | Matte stone |
| Iron | 5–9 | Brushed steel |
| Bronze | 10–19 | Bronze |
| Silver | 20–29 | Silver |
| Gold | 30–39 | Gold |
| Platinum | 40–49 | Platinum |
| Diamond | 50–74 | Ice diamond |
| Obsidian | 75–99 | Black glass, green core |
| Legend | 100 | Obsidian with violet (the only legendary violet) |

Reaching a rank adds its insignia to the collection.

### 3.4 The collection — 70 items

**13 families × 4 tiers** (Bronze → Silver → Gold → Platinum). **Gold needs
level 10 and Platinum needs level 25**: progress always counts, but the
badge seals until you reach the level (Clash-style unlocks).

| Family | Measures | Bronze / Silver / Gold / Platinum |
|---|---|---|
| Iron Ledger | Workouts completed | 10 / 50 / 150 / 500 |
| Tonnage | Lifetime volume | 10 t / 100 t / 500 t / 2,000 t |
| Record Breaker | Personal records | 5 / 25 / 75 / 200 |
| Perfect Week | Weeks you hit your target | 1 / 4 / 12 / 52 |
| Unbroken | Longest streak (rest honoured) | 7 / 30 / 90 / 365 days |
| Cardio Engine | Cardio minutes | 300 / 1,500 / 5,000 / 15,000 |
| Long Haul | Cardio distance | 25 / 100 / 500 / 2,000 km |
| Steady Scale | Weigh-ins | 4 / 12 / 26 / 52 |
| Strength Standard | Best main-lift tier | Novice / Intermediate / Advanced / Elite |
| PhysIQ Climber | Score reached | 60 / 70 / 80 / 90 |
| Explorer | Different exercises logged | 10 / 25 / 50 / 100 |
| Big Session | Sets in one workout | 20 / 30 / 40 / 50 |
| Double Duty | Days with lifting + 20 min cardio | 1 / 10 / 50 / 150 |

**10 milestones**: First Rep · Calibrated (score unlocked) · Body Map (build
set + first weigh-in) · First Import (first cardio import) · Comeback Kid
(back after 14+ days away) · Full House (all four pillars ≥ 70 on one day,
Gold) · Perfect Month (every week of a month on target, Gold) · Iron Year
(100 workouts in 365 days, Platinum, level 25) · Anniversary (one year
since your first workout, Legendary, level 30) · Unshakeable (52 weeks on
target, Legendary, level 40).

**8 rank insignia**: Iron, Bronze, Silver, Gold, Platinum, Diamond,
Obsidian, Legend.

Every item stores the date it was earned. Locked items show exactly what's
left ("12 more workouts"); sealed items show "Unlocks at level 25".

### 3.5 Kix & Nyra in the tour

Modelled on how Supercell introduces areas and features. The characters
slide in from the screen edge, talk in speech bubbles, and point at the
real UI while the rest dims. Two voices make it a conversation rather than
a manual:

- **Kix**, warm and eager, owns effort, PRs and celebration; he's the one
  who gets corrected.
- **Nyra**, blunt and precise, owns standards, rest and the data. Her slow
  nod is saved for the finale.

Rules: one line at a time, under 140 characters; tap to finish the
typewriter, tap again for the next line; Skip always visible; reduced
motion turns off the typing and the bobbing. Canon change (owner request,
2026-10-15): the characters may speak in the tour and in celebration
moments; elsewhere they still appear only at moments of emotion.

## 4. Later (not in this pass)

- **Weekly quests** (Fitocracy/Duolingo style): 3 personal goals a week,
  generated from the plan.
- **Leagues** once Compete has real users.
- **Character reactions** on Home to real events (PR → Kix joy, rest
  ignored → Nyra narrowed).
- **Limited-edition badges** (New Year, anniversaries).

## Sources

- Mazeas A. et al. (2022). *Evaluating the Effectiveness of Gamification on Physical Activity: Systematic Review and Meta-analysis of RCTs.* JMIR. https://pmc.ncbi.nlm.nih.gov/articles/PMC8767479/
- Deci, Koestner & Ryan (1999). *A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation.* https://home.ubalt.edu/ntygmitc/642/Articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf
- Duolingo streak research — https://blog.duolingo.com/duolingo-streak-research/ ; Lenny's Newsletter, *Behind the product: Duolingo streaks* — https://lennysnewsletter.com/p/behind-the-product-duolingo-streaks
- Duolingo characters — *Behind the Design: Duolingo* (Apple) https://cur.at/I0sPK5n?m=web
- Fitocracy — GeekDad (2011) https://geekdad.com/2011/10/get-fit-earning-achievements-leveling-up-and-accepting-quests/2/ ; Wikipedia https://www.Wikipedia.com/wiki/Fitocracy
- Garmin badges & levels — Garmin forums https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-web/287826/what-are-the-number-of-points-needed-for-levels-from-challenges-badges/1397014 ; Connect+ points controversy https://gadgetsandwearables.com/2025/03/28/garmin-badge-pay/
- Peloton badges — https://www.champagneandcoffeestains.com/peloton-badge-achievement-guide-video/
- Apple Fitness awards — Macworld https://www.macworld.com/article/672553/how-to-get-every-apple-watch-activity-achievement-badge.html
- Nike Run Levels — https://www.nike.com/help/a/nrc-run-level
- Pokémon GO medals — https://pokemongo.fandom.com/wiki/Medals
- Strava Local Legends — https://dcrainmaker.com/2020/06/strava-legends-feature.html
- Clash of Clans onboarding — https://www.gamedeveloper.com/business/clash-of-clans-vs-boom-beach-part-1-the-hook
- XP curve design — https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds- ; OSRS XP table https://osrstoolkit.com/calculators/experience-table/
- Finch — https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/
