"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, Zap, Dna, ExternalLink } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { mockProfile } from "@/data/profile";
import type { ProfileGoal, ExperienceLevel } from "@/types/profile";
import {
  generateCoachResponse,
  defaultQuickPrompts,
  type CoachMessage,
  type CoachPersona,
} from "@/lib/aiCoachChat";

const initialMessages: Record<CoachPersona, CoachMessage> = {
  kix: {
    id: "init-kix",
    sender: "coach",
    persona: "kix",
    text: "Locked in and ready to work. What lift, split adjustment, or progressive overload target are we tackling today?",
    timestamp: "Just now",
  },
  nyra: {
    id: "init-nyra",
    sender: "coach",
    persona: "nyra",
    text: "Sensors calibrated for biomechanical efficiency and active recovery. Ask me about movement execution, tempo, or fatigue management.",
    timestamp: "Just now",
  },
};

export function CoachScreen() {
  const onboarding = useProfileStore((state) => state.onboardingProfile);

  const goal = (onboarding?.goal as ProfileGoal) || mockProfile.goal;
  const experienceLevel = (onboarding?.experienceLevel as ExperienceLevel) || mockProfile.experienceLevel;

  const [persona, setPersona] = useState<CoachPersona>("kix");
  const [messages, setMessages] = useState<CoachMessage[]>([initialMessages.kix]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handlePersonaSwitch(newPersona: CoachPersona) {
    if (newPersona === persona) return;
    setPersona(newPersona);
    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        sender: "coach",
        persona: newPersona,
        text: initialMessages[newPersona].text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }

  function handleSend(queryText?: string) {
    const textToSend = (queryText || input).trim();
    if (!textToSend) return;

    const userMsg: CoachMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const coachReply = generateCoachResponse(textToSend, persona, {
      displayName: mockProfile.displayName,
      goal,
      experienceLevel,
      currentStreakDays: 27,
      weakestPillarId: "cardio",
    });

    setMessages((prev) => [...prev, userMsg, coachReply]);
    setInput("");
  }

  return (
    <PageContainer withBottomNav={false} className="flex flex-col h-dvh pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 pt-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/home"
              aria-label="Back to Home"
              className="grid size-10 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              <ArrowLeft size={iconSize.sm} aria-hidden />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold">AI Coach Dialogue</h1>
              <p className="text-xs text-foreground-secondary">
                Contextual training intelligence · &le;2 sentence tactical cues
              </p>
            </div>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-surface-elevated/70 border border-border/60">
          <button
            type="button"
            onClick={() => handlePersonaSwitch("kix")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold transition-all",
              persona === "kix"
                ? "bg-brand text-background shadow-md shadow-brand/20"
                : "text-foreground-secondary hover:text-foreground"
            )}
          >
            <Zap size={14} aria-hidden />
            Kix (Power & Discipline)
          </button>
          <button
            type="button"
            onClick={() => handlePersonaSwitch("nyra")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold transition-all",
              persona === "nyra"
                ? "bg-info text-background shadow-md shadow-info/20"
                : "text-foreground-secondary hover:text-foreground"
            )}
          >
            <Dna size={14} aria-hidden />
            Nyra (Biomechanics)
          </button>
        </div>
      </div>

      {/* Quick Prompts Row */}
      <div className="py-3 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
        {defaultQuickPrompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => handleSend(prompt.text)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-border/70 bg-surface/60 text-foreground-secondary hover:text-foreground hover:border-brand/50 hover:bg-surface-elevated transition-colors"
          >
            {prompt.text}
          </button>
        ))}
      </div>

      {/* Conversation Stream */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}
            >
              <div className="flex items-center gap-1 px-1">
                {!isUser && (
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded",
                      msg.persona === "kix"
                        ? "bg-brand/15 text-brand"
                        : "bg-info/15 text-info"
                    )}
                  >
                    {msg.persona === "kix" ? "Kix" : "Nyra"}
                  </span>
                )}
                <span className="text-[10px] text-foreground-secondary">{msg.timestamp}</span>
              </div>

              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  isUser
                    ? "bg-surface-elevated text-foreground border border-border/80 rounded-br-sm"
                    : msg.persona === "kix"
                    ? "bg-brand/10 border border-brand/20 text-foreground rounded-bl-sm"
                    : "bg-info/10 border border-info/20 text-foreground rounded-bl-sm"
                )}
              >
                <p>{msg.text}</p>

                {msg.suggestedAction && (
                  <Link
                    href={msg.suggestedAction.href}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ExternalLink size={12} aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 shrink-0 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${persona === "kix" ? "Kix" : "Nyra"} a training question...`}
            className="w-full h-11 pl-4 pr-10 rounded-full border border-border bg-surface text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-brand/60"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send query"
          className="grid size-11 place-items-center rounded-full bg-brand text-background font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-strong transition-colors"
        >
          <Send size={16} aria-hidden />
        </button>
      </form>
    </PageContainer>
  );
}
