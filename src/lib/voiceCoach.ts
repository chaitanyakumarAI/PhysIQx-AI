/**
 * Web Speech API Voice Coach for in-gym workouts.
 * Provides voice announcements during rest intervals and set completions
 * so athletes wearing headphones don't have to keep looking at their screen.
 */

let lastSpokenText = "";
let lastSpokenTime = 0;

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface VoiceCueOptions {
  interrupt?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function speakVoiceCue(text: string, options: VoiceCueOptions = {}): boolean {
  if (!isSpeechSynthesisAvailable()) return false;

  const {
    interrupt = true,
    rate = 1.05,
    pitch = 1.0,
    volume = 1.0,
  } = options;

  const now = Date.now();
  // Prevent stuttering repeat of the same sentence within 2 seconds
  if (text === lastSpokenText && now - lastSpokenTime < 2000) {
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    if (interrupt) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Pick an English voice if available
    const voices = synth.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.lang.startsWith("en-") || v.lang === "en") && !v.name.includes("whisper"),
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synth.speak(utterance);
    lastSpokenText = text;
    lastSpokenTime = now;
    return true;
  } catch {
    return false;
  }
}

export function cancelVoiceCues(): void {
  if (!isSpeechSynthesisAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore error
  }
}

/**
 * Returns a concise, motivational voice cue text for specific rest countdown milestones.
 */
export function getRestMilestoneCue(remainingSeconds: number): string | null {
  switch (remainingSeconds) {
    case 60:
      return "One minute remaining. Control your breathing.";
    case 30:
      return "Thirty seconds left. Chalk up and get locked in.";
    case 10:
      return "Ten seconds. Take your stance.";
    case 0:
      return "Rest complete. Time to lift!";
    default:
      return null;
  }
}
