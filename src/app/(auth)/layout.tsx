import type { Metadata } from "next";
import { Dumbbell, Zap, TrendingUp, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s · PhysIQx AI",
    default: "PhysIQx AI",
  },
};

const features = [
  { icon: Zap, text: "AI-powered PhysIQ Score" },
  { icon: TrendingUp, text: "Track strength, cardio & fuel" },
  { icon: Shield, text: "Your data, protected" },
];

/**
 * Premium split-panel auth layout.
 * Left: animated brand panel with floating glow orbs and feature list.
 * Right: glassmorphic card with the form content.
 * Mobile: stacked — brand panel collapses to a top bar, form fills screen.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-root">
      {/* ── Left: Brand panel ── */}
      <div className="auth-brand-panel">
        {/* Animated background orbs */}
        <div className="auth-orb auth-orb-1" aria-hidden />
        <div className="auth-orb auth-orb-2" aria-hidden />
        <div className="auth-orb auth-orb-3" aria-hidden />

        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">
            <Dumbbell size={22} aria-hidden />
          </span>
          <span className="auth-logo-text">PhysIQx</span>
        </div>

        {/* Hero content */}
        <div className="auth-hero">
          <h2 className="auth-hero-headline">
            Every rep feeds<br />
            your <span className="auth-hero-highlight">PhysIQ Score</span>.
          </h2>
          <p className="auth-hero-sub">
            The AI fitness platform that tracks everything — strength, cardio, nutrition, recovery — and turns it into one smart score.
          </p>

          {/* Feature pills */}
          <ul className="auth-features">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="auth-feature-item">
                <span className="auth-feature-icon">
                  <Icon size={14} aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom decorative score badge */}
        <div className="auth-score-badge" aria-hidden>
          <span className="auth-score-number">94</span>
          <span className="auth-score-label">PhysIQ Score</span>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {/* Mobile-only logo */}
          <div className="auth-mobile-logo">
            <span className="auth-logo-icon">
              <Dumbbell size={18} aria-hidden />
            </span>
            <span className="auth-logo-text" style={{ fontSize: "1.1rem" }}>PhysIQx</span>
          </div>

          {children}
        </div>
      </div>

      <style>{`
        /* ─── Root layout ─── */
        .auth-root {
          display: flex;
          min-height: 100dvh;
          background: #0a0d0b;
        }

        /* ─── Brand panel ─── */
        .auth-brand-panel {
          position: relative;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          overflow: hidden;
          background: linear-gradient(
            145deg,
            #0d1410 0%,
            #0a110d 40%,
            #080e0a 100%
          );
          border-right: 1px solid rgba(34, 197, 94, 0.08);
        }

        @media (min-width: 900px) {
          .auth-brand-panel {
            display: flex;
            width: 50%;
            flex-shrink: 0;
          }
        }

        /* Animated background orbs */
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: orb-float 8s ease-in-out infinite;
          pointer-events: none;
        }
        .auth-orb-1 {
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.18) 0%, transparent 70%);
          top: -80px;
          left: -80px;
          animation-delay: 0s;
        }
        .auth-orb-2 {
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.10) 0%, transparent 70%);
          bottom: 80px;
          right: -60px;
          animation-delay: -3s;
        }
        .auth-orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, transparent 70%);
          top: 50%;
          left: 40%;
          animation-delay: -5s;
        }
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(12px, -18px) scale(1.04); }
          66% { transform: translate(-8px, 12px) scale(0.97); }
        }

        /* Logo */
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          position: relative;
          z-index: 1;
        }
        .auth-logo-icon {
          display: grid;
          place-items: center;
          width: 2.25rem;
          height: 2.25rem;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 0.625rem;
          color: #052e16;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
        }
        .auth-logo-text {
          font-family: var(--font-display), ui-sans-serif, system-ui;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fafafa;
          letter-spacing: -0.02em;
        }

        /* Hero content */
        .auth-hero {
          position: relative;
          z-index: 1;
        }
        .auth-hero-headline {
          font-family: var(--font-display), ui-sans-serif, system-ui;
          font-size: clamp(1.9rem, 2.8vw, 2.5rem);
          font-weight: 700;
          line-height: 1.15;
          color: #fafafa;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }
        .auth-hero-highlight {
          background: linear-gradient(90deg, #22c55e, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-hero-sub {
          font-size: 0.9375rem;
          color: #a1a1aa;
          line-height: 1.65;
          max-width: 340px;
          margin-bottom: 2rem;
        }
        .auth-features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .auth-feature-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-size: 0.875rem;
          color: #d4d4d8;
          font-weight: 500;
        }
        .auth-feature-icon {
          display: grid;
          place-items: center;
          width: 1.625rem;
          height: 1.625rem;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 0.375rem;
          color: #22c55e;
          flex-shrink: 0;
        }

        /* Score badge */
        .auth-score-badge {
          position: relative;
          z-index: 1;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          width: 90px;
          padding: 1rem;
          background: rgba(34, 197, 94, 0.06);
          border: 1px solid rgba(34, 197, 94, 0.18);
          border-radius: 1.25rem;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.04),
            0 0 40px -10px rgba(34, 197, 94, 0.25);
        }
        .auth-score-number {
          font-family: var(--font-display), ui-sans-serif, system-ui;
          font-size: 2rem;
          font-weight: 700;
          color: #22c55e;
          line-height: 1;
        }
        .auth-score-label {
          font-size: 0.6875rem;
          color: #71717a;
          margin-top: 0.25rem;
          text-align: center;
          line-height: 1.3;
        }

        /* ─── Form panel ─── */
        .auth-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          position: relative;
        }

        /* Subtle radial glow behind the card */
        .auth-form-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34, 197, 94, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .auth-form-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: rgba(18, 22, 19, 0.8);
          border: 1px solid rgba(39, 44, 40, 0.8);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.04),
            0 4px 6px rgba(0,0,0,0.4),
            0 20px 60px -10px rgba(0,0,0,0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (min-width: 480px) {
          .auth-form-card {
            padding: 2.5rem;
          }
        }

        /* Mobile-only logo */
        .auth-mobile-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(39, 44, 40, 0.6);
        }

        @media (min-width: 900px) {
          .auth-mobile-logo {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
