"use client";

/* Minimal typings for the Web Speech recognition API (not in lib.dom for all TS versions). */
type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
type RecognitionEvent = { resultIndex: number; results: RecognitionResultList };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function ctor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => Recognition) | null;
}

export function recognitionSupported() {
  return ctor() !== null;
}

export type ListenResult = { alternatives: string[]; error?: "not-allowed" | "no-speech" | "other" };

/** Silence after speech that counts as "finished talking". */
const SILENCE_MS = 1500;
/** How long to wait for the engine's own `end` event after asking it to stop. */
const STOP_GRACE_MS = 1000;

/** Only one recognition session may own the microphone at a time. */
let active: { finish: () => void } | null = null;

/**
 * Listens for one utterance. Resolves with every final alternative the engine produced,
 * so the caller can score against a target and keep the best match.
 *
 * Robust to engines that never fire `end` after `stop()` (Safari / iOS): the session also
 * ends on its own after a pause in speech, and `stop()` force-finishes after a short grace
 * period using whatever was heard, including interim text.
 */
export function listen(opts: { maxMs?: number; onInterim?: (text: string) => void } = {}) {
  const Ctor = ctor();
  let finish: () => void = () => {};
  let requestStop: () => void = () => {};

  // Starting a new session ends any other one (e.g. the learner tapped another 🎤).
  active?.finish();

  const promise = new Promise<ListenResult>((resolve) => {
    if (!Ctor) return resolve({ alternatives: [], error: "other" });
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 5;

    const finals: string[][] = [];
    let interim = "";
    let error: ListenResult["error"];
    let done = false;
    let maxTimer: ReturnType<typeof setTimeout> | undefined;
    let silenceTimer: ReturnType<typeof setTimeout> | undefined;
    let graceTimer: ReturnType<typeof setTimeout> | undefined;

    finish = () => {
      if (done) return;
      done = true;
      clearTimeout(maxTimer);
      clearTimeout(silenceTimer);
      clearTimeout(graceTimer);
      if (active?.finish === finish) active = null;
      r.onresult = r.onerror = r.onend = null;
      try {
        r.abort(); // release the microphone; harmless if already ended
      } catch {
        // ignore
      }
      const segs = finals.filter(Boolean);
      // Combine segments: first alternative for all but the last, which keeps all alternatives.
      const head = segs.slice(0, -1).map((s) => s[0]).join(" ");
      const last = segs.at(-1) ?? [];
      let alternatives = last.map((alt) => `${head} ${alt}`.trim()).filter(Boolean);
      // Stopped before the engine finalised anything: fall back to what was shown live.
      const live = `${segs.map((s) => s[0]).join(" ")} ${interim}`.trim();
      if (!alternatives.length && live) alternatives = [live];
      resolve({ alternatives, error: alternatives.length ? undefined : (error ?? "no-speech") });
    };

    requestStop = () => {
      if (done) return;
      try {
        r.stop(); // lets the engine deliver its final result, then fire `end`
      } catch {
        // ignore
      }
      clearTimeout(graceTimer);
      graceTimer = setTimeout(finish, STOP_GRACE_MS);
    };

    r.onresult = (e) => {
      interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finals[i] = Array.from({ length: res.length }, (_, k) => res[k].transcript);
        else interim += res[0].transcript;
      }
      const sofar = finals.map((f) => f?.[0] ?? "").join(" ");
      opts.onInterim?.(`${sofar} ${interim}`.trim());
      // Auto-finish once the learner pauses, so pressing "Dừng" is optional.
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(requestStop, SILENCE_MS);
    };
    r.onerror = (e) => {
      error =
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "not-allowed"
          : e.error === "no-speech"
            ? "no-speech"
            : (error ?? "other");
    };
    r.onend = finish;

    active = { finish };
    try {
      r.start();
    } catch {
      error = "other";
      finish();
      return;
    }
    if (opts.maxMs) maxTimer = setTimeout(requestStop, opts.maxMs);
  });

  return {
    promise,
    /** Finish now and score what was heard so far. */
    stop: () => requestStop(),
    /** Cancel (still resolves, so awaiting callers never hang). */
    abort: () => finish(),
  };
}
