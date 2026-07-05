# Component Architecture

Goal

Everything should be reusable.

Avoid duplicated UI.

Prefer composition over large components.

---

# Component Categories

components/

ui/

cards/

charts/

layout/

navigation/

feedback/

---

# UI Components

Button

Input

SearchInput

Chip

Badge

Avatar

Separator

ProgressBar

CircularProgress

Dialog

BottomSheet

Tabs

Toast

Skeleton

Tooltip

Dropdown

Switch

Slider

Checkbox

Radio

Stat

IconButton

---

# Navigation

BottomNavigation

TopBar

ScreenHeader

BackButton

FloatingActionButton

NavigationItem

---

# Cards

HealthScoreCard

XPCard

MissionCard

WorkoutCard

ExerciseCard

StatCard

AchievementCard

ChallengeCard

LeaderboardCard

FitnessDNACard

ProgressCard

AIRecommendationCard

ProfileSummaryCard

UpcomingWorkoutCard

---

# Charts

WeightChart

ProteinChart

WaterChart

XPChart

WorkoutChart

RadarChart

WeeklyProgressChart

MonthlyProgressChart

HeatmapCalendar

---

# Layout Components

PageContainer

Section

CardGrid

ScreenLayout

ScrollableContent

SafeArea

EmptyState

LoadingState

ErrorState

---

# Home Screen

GreetingHeader

XPProgress

HealthScoreCard

MissionSection

QuickActions

ProgressSection

UpcomingWorkout

RecentAchievement

AIInsight

BottomNavigation

---

# Workout

WorkoutHero

WorkoutCategories

ExerciseSearch

ExerciseCard

WorkoutSchedule

SplitSelector

WorkoutSummary

RestTimer

WorkoutProgress

---

# Analytics

AnalyticsHeader

HealthRadar

MetricCards

TrendCards

Charts

WeeklySummary

MonthlySummary

Insights

---

# Community

Leaderboard

ChallengeCard

FriendCard

ActivityFeed

WeeklyCompetition

CommunityStats

---

# Profile

ProfileHeader

FitnessDNA

Achievements

Statistics

SettingsShortcut

ProgressOverview

---

# Authentication

Logo

LoginForm

SignupForm

SocialLoginButtons

ForgotPassword

---

# Onboarding

Welcome

GoalSelection

ExperienceSelection

WorkoutPreference

RestDaySelection

ProteinGoal

WaterGoal

FitnessDNAResult

---

# Reusable Rules

If two screens share the same UI

Extract a component.

If a component exceeds roughly 300 lines

Split it.

Keep business logic outside UI.

Use composition.

Avoid duplicate styling.

---

# Motion

Use Framer Motion.

Animate

Cards

Buttons

Page transitions

Charts

XP

Progress bars

Level Up

Avoid excessive motion.

Motion should communicate state.

---

# Styling

Dark mode first.

Large border radius.

Consistent spacing.

Minimal shadows.

Consistent icon sizes.

Large touch targets.

Premium appearance.

---

# Naming

PascalCase

Examples

HealthScoreCard.tsx

WorkoutHero.tsx

BottomNavigation.tsx

LeaderboardCard.tsx

---

# File Structure

components/

cards/

HealthScoreCard.tsx

WorkoutCard.tsx

MissionCard.tsx

AchievementCard.tsx

ui/

Button.tsx

Input.tsx

Chip.tsx

Badge.tsx

ProgressBar.tsx

navigation/

BottomNavigation.tsx

ScreenHeader.tsx

features/

home/

components/

workout/

components/

analytics/

components/

community/

components/

profile/

components/

---

# Never Do

Duplicate components.

Duplicate styles.

Large page components.

Inline repeated styles.

Hardcoded spacing values.

Multiple button implementations.

Multiple card implementations.

Everything should come from reusable building blocks.