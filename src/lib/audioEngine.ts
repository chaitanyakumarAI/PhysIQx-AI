import { useProfileStore } from "@/store/profileStore";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Plays a pure synthesized tone with exponential decay envelope.
 */
function playTone(freq: number, durationSec: number, type: OscillatorType = "sine", gainLevel = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {
    // Audio contexts can be blocked by browser autoplay policies
  }
}

/**
 * Countdown tick (e.g. 3, 2, 1) during rest intervals.
 */
export function playCountdownTick() {
  playTone(880, 0.06, "sine", 0.12);
}

/**
 * Rest timer completed tone â€” bright 2-note ascending chime.
 */
export function playRestComplete() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    playTone(587.33, 0.18, "triangle", 0.18); // D5
    setTimeout(() => {
      playTone(880.0, 0.35, "sine", 0.2); // A5
    }, 120);

    triggerHaptic("medium");
  } catch {
    // Fallback
  }
}

/**
 * Set completed sound â€” crisp affirmation chime.
 */
export function playSetComplete() {
  try {
    playTone(659.25, 0.1, "sine", 0.12); // E5
    setTimeout(() => {
      playTone(783.99, 0.18, "sine", 0.15); // G5
    }, 70);

    triggerHaptic("light");
  } catch {
    // Fallback
  }
}

/**
 * Major celebratory fanfare chord for workout completion or new PR.
 * Respects user preferences `celebrationEffects`.
 */
export function playCelebrationFanfare() {
  try {
    if (typeof window !== "undefined") {
      const prefs = useProfileStore.getState().preferences;
      if (prefs && !prefs.celebrationEffects) {
        return;
      }
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, delay: 0 },   // C5
      { freq: 659.25, delay: 90 },  // E5
      { freq: 783.99, delay: 180 }, // G5
      { freq: 1046.5, delay: 270 }, // C6
    ];

    notes.forEach(({ freq, delay }) => {
      setTimeout(() => {
        playTone(freq, 0.45, "triangle", 0.18);
      }, delay);
    });

    triggerHaptic("success");
  } catch {
    // Fallback
  }
}

/**
 * Vibration feedback using the Web Vibration API when available on mobile devices.
 */
export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" = "light") {
  if (typeof navigator === "undefined" || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case "light":
        navigator.vibrate(15);
        break;
      case "medium":
        navigator.vibrate(35);
        break;
      case "heavy":
        navigator.vibrate(60);
        break;
      case "success":
        navigator.vibrate([30, 40, 50]);
        break;
    }
  } catch {
    // Vibrate may be restricted by iframe or permissions
  }
}
