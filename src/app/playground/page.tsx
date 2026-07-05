"use client";

import { useState } from "react";
import {
  BarChart3,
  Dumbbell,
  Home,
  Inbox,
  Plus,
  Settings,
  User,
  Users,
} from "lucide-react";
import { iconSize } from "@/constants/icons";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { TextArea } from "@/components/ui/TextArea";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import {
  BottomNavigation,
  type BottomNavItem,
} from "@/components/navigation/BottomNavigation";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";

/**
 * Dev-only design-system preview: every foundation primitive in every state.
 * This page is the visual checkpoint against /design — it is not a product
 * screen and ships no application data.
 */

const navItems: BottomNavItem[] = [
  { href: "/playground", label: "Home", icon: Home },
  { href: "/playground/train", label: "Train", icon: Dumbbell },
  { href: "/playground/insights", label: "Insights", icon: BarChart3 },
  { href: "/playground/compete", label: "Compete", icon: Users },
  { href: "/playground/profile", label: "Profile", icon: User },
];

const filterOptions = ["AI", "PPL", "Upper/Lower", "Bro", "Full Body"];
const muscleOptions = ["Chest", "Back", "Legs", "Shoulders"];

export default function PlaygroundPage() {
  const [filter, setFilter] = useState("AI");
  const [muscle, setMuscle] = useState("Chest");

  return (
    <PageContainer>
      <ScreenHeader
        title="Playground"
        subtitle="Every foundation primitive, every state."
        trailing={<Avatar name="Alex Example" variant="brand" size="sm" />}
      />

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" variant="secondary">
            Small
          </Button>
          <IconButton label="Add" variant="brand">
            <Plus size={iconSize.sm} aria-hidden />
          </IconButton>
          <IconButton label="Settings" variant="surface">
            <Settings size={iconSize.sm} aria-hidden />
          </IconButton>
        </div>
        <Button size="lg" fullWidth>
          Full width · lg
        </Button>
      </Section>

      <Section title="Cards">
        <Card>
          <p className="text-sm text-foreground-secondary">Default card</p>
        </Card>
        <Card variant="elevated">
          <p className="text-sm text-foreground-secondary">Elevated card</p>
        </Card>
        <Card variant="accent">
          <p className="text-sm text-foreground-secondary">
            Accent card — the green-tinted signature surface
          </p>
        </Card>
      </Section>

      <Section title="Badges & chips">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">AI Programmed</Badge>
          <Badge tone="warning">27 day streak</Badge>
          <Badge tone="neutral">52 min</Badge>
          <Badge tone="info">Rare</Badge>
          <Badge tone="danger">-2</Badge>
          <Badge tone="outline">Outline</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Chip
              key={option}
              selected={filter === option}
              onClick={() => setFilter(option)}
            >
              {option}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {muscleOptions.map((option) => (
            <Chip
              key={option}
              variant="accent"
              selected={muscle === option}
              onClick={() => setMuscle(option)}
            >
              {option}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Progress">
        <div className="flex flex-col gap-3">
          <ProgressBar value={74} aria-label="Sample brand progress" />
          <ProgressBar
            value={60}
            tone="info"
            aria-label="Sample info progress"
          />
          <ProgressBar
            value={35}
            tone="warning"
            size="sm"
            aria-label="Sample warning progress"
          />
        </div>
        <div className="flex items-center gap-6">
          <CircularProgress
            value={87}
            size={120}
            strokeWidth={10}
            glow
            aria-label="Sample score"
          >
            <span className="text-3xl font-bold">87</span>
          </CircularProgress>
          <CircularProgress value={45} aria-label="Sample small ring" />
        </div>
      </Section>

      <Section title="Forms">
        <Input label="Label" placeholder="Placeholder" helper="Helper text" />
        <Input
          label="With error"
          defaultValue="wrong@value"
          error="That doesn't look right."
        />
        <Input label="Disabled" placeholder="Can't touch this" disabled />
        <SearchInput placeholder="Search 400+ exercises" shortcut="⌘K" />
        <TextArea label="Notes" placeholder="How did it feel?" />
      </Section>

      <Section title="Avatars">
        <div className="flex items-end gap-3">
          <Avatar name="Alex Example" variant="brand" size="xl" />
          <Avatar name="Marcus T" size="lg" />
          <Avatar name="Sarah K" size="md" />
          <Avatar name="Priya R" size="sm" />
          <Avatar name="Yuki H" size="xs" />
        </div>
      </Section>

      <Section title="Loading">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-card" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Empty & error states">
        <Card padding="none">
          <EmptyState
            icon={Inbox}
            title="Nothing here yet"
            description="This is what an empty state looks like — always with a next action."
            action={<Button size="sm">Do the thing</Button>}
          />
        </Card>
        <Card padding="none">
          <ErrorState onRetry={() => undefined} />
        </Card>
      </Section>

      <BottomNavigation items={navItems} />
    </PageContainer>
  );
}
