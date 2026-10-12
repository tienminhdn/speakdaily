"use client";

// macOS ships novelty/character voices that are hard for learners to follow.
const NOVELTY =
  /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;

function englishVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith("en") && !NOVELTY.test(v.name));
  // Prefer US/GB voices first so the two dialogue speakers sound natural.
  return voices.sort((a, b) => score(b) - score(a));
}

function score(v: SpeechSynthesisVoice) {
  return (v.lang === "en-US" ? 2 : v.lang === "en-GB" ? 1 : 0) + (v.localService ? 0.5 : 0);
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

/** Speaks English text; `voice` picks among available English voices (0 = default, 1 = alternate). */
export function speak(text: string, opts: { rate?: number; voice?: number } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve();
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\.\.\./g, " something "));
    u.lang = "en-US";
    u.rate = opts.rate ?? 0.9;
    const voices = englishVoices();
    if (voices.length) u.voice = voices[(opts.voice ?? 0) % voices.length];
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}
