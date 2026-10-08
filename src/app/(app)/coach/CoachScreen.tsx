"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, ChevronRight, Send, Sparkles, User } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { useSessionStore } from "@/store/sessionStore";
import {
  generateCoachResponse,
  defaultQuickPrompts,
  type CoachMessage,
  type CoachPersona,
  type CoachContext,
} from "@/lib/aiCoachChat";
import { deriveStreakDays } from "@/features/shared/lib/liveProgress";

// ─── Static seed ─────────────────────────────────────────────────────────────

const WELCOME_MESSAGE: CoachMessage = {
  id: "msg-welcome",
  sender: "coach",
  persona: "kix",
  text: "What are we working on today? Ask me anything about training, recovery, or your PhysIQ score.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BubbleProps {
  message: CoachMessage;
  persona: CoachPersona;
}

function ChatBubble({ message, persona }: BubbleProps) {
  const isUser = message.sender === "user";

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full gap-2.5", isUser ? "justify-end" : "justify-start")}
    >
      {/* Coach avatar */}
      {!isUser && (
        <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
          <Bot size={14} aria-hidden />
        </span>
      )}

      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser && "items-end")}>
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-brand text-zinc-950 font-medium"
              : "rounded-tl-sm bg-surface-elevated border border-border/60 text-foreground",
          )}
        >
          {message.text}
        </div>

        {/* Suggested action chip */}
        {!isUser && message.suggestedAction && (
          <Link
            href={message.suggestedAction.href}
            className="flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand hover:bg-brand/15 transition-colors"
          >
            {message.suggestedAction.label}
            <ChevronRight size={11} aria-hidden />
          </Link>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-foreground-secondary px-1">
          {message.timestamp}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-surface-elevated border border-border/60 text-foreground-secondary">
          <User size={14} aria-hidden />
        </span>
      )}
    </m.div>
  );
}

// ─── Persona toggle ───────────────────────────────────────────────────────────

interface PersonaToggleProps {
  persona: CoachPersona;
  onChange: (p: CoachPersona) => void;
}

function PersonaToggle({ persona, onChange }: PersonaToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-surface-elevated p-1">
      {(["kix", "nyra"] as CoachPersona[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "flex-1 rounded-lg py-1 text-xs font-semibold capitalize transition-colors",
            persona === p
              ? "bg-brand text-zinc-950 shadow-sm"
              : "text-foreground-secondary hover:text-foreground",
          )}
        >
          {p === "kix" ? "⚡ Kix" : "🛡 Nyra"}
        </button>
      ))}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

/**
 * Conversational AI Coach — full /coach route.
 *
 * Built on `generateCoachResponse()` from `src/lib/aiCoachChat.ts`.
 * No API calls: the rule-engine runs 100% client-side, using the user's
 * persisted profile + session ledger as context. Quick prompts cover the six
 * most common coaching categories; free-text input handles everything else.
 */
export function CoachScreen() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real context from stores
  const onboardingProfile = useProfileStore((s) => s.onboardingProfile);
  const history = useSessionStore((s) => s.history);
  const streakDays = deriveStreakDays(0, history);

  const coachContext: CoachContext = {
    goal: (onboardingProfile?.goal as CoachContext["goal"]) ?? "bulk",
    experienceLevel:
      (onboardingProfile?.experienceLevel as CoachContext["experienceLevel"]) ?? "intermediate",
    currentStreakDays: streakDays,
  };

  const [persona, setPersona] = useState<CoachPersona>("kix");
  const [messages, setMessages] = useState<CoachMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isThinking) return;

      const userMsg: CoachMessage = {
        id: `msg-user-${Date.now()}`,
        sender: "user",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsThinking(true);

      // Simulate a brief thinking delay for natural UX cadence
      setTimeout(() => {
        const reply = generateCoachResponse(text, persona, coachContext);
        setMessages((prev) => [...prev, reply]);
        setIsThinking(false);
      }, 600 + Math.random() * 400);
    },
    [isThinking, persona, coachContext],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    // Full viewport, no PageContainer scroll — we own the scroll area
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* ── Header ── */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border/40 bg-background/90 px-4 py-3 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="grid size-9 place-items-center rounded-full text-foreground-secondary hover:bg-surface-elevated hover:text-foreground transition-colors"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <span className="grid size-8 place-items-center rounded-full bg-brand/20 text-brand">
            <Sparkles size={16} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-base font-bold leading-tight">AI Coach</h1>
            <p className="text-[11px] text-foreground-secondary">
              {persona === "kix" ? "Kix · drive & overload" : "Nyra · precision & recovery"}
            </p>
          </div>
        </div>

        {/* Persona toggle in header — compact */}
        <div className="w-[120px] shrink-0">
          <PersonaToggle persona={persona} onChange={setPersona} />
        </div>
      </header>

      {/* ── Quick Prompt Chips ── */}
      <div className="shrink-0 overflow-x-auto px-4 py-2.5">
        <div className="flex gap-2 pb-0.5">
          {defaultQuickPrompts.map((qp) => (
            <button
              key={qp.id}
              type="button"
              onClick={() => sendMessage(qp.text)}
              disabled={isThinking}
              className="whitespace-nowrap rounded-full border border-border/60 bg-surface-elevated px-3 py-1.5 text-[11px] font-medium text-foreground-secondary transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand disabled:pointer-events-none disabled:opacity-50"
            >
              {qp.text}
            </button>
          ))}
        </div>
      </div>

      {/* ── Message thread ── */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex flex-col gap-4 pb-2">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} persona={persona} />
            ))}
          </AnimatePresence>

          {/* Thinking indicator */}
          <AnimatePresence>
            {isThinking && (
              <m.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex items-center gap-2.5"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
                  <Bot size={14} aria-hidden />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-elevated border border-border/60 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-brand/60 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 border-t border-border/40 bg-background/90 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about training, recovery, or your score…"
            disabled={isThinking}
            className="h-11 flex-1 rounded-full border border-border/60 bg-surface-elevated px-4 text-sm text-foreground placeholder:text-foreground-secondary/60 focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/40 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            aria-label="Send message"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-zinc-950 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none hover:brightness-110"
          >
            <Send size={16} aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
