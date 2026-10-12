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

/**
 * Listens for one utterance. Resolves with every final alternative the engine produced,
 * so the caller can score against a target and keep the best match.
 */
export function listen(opts: { maxMs?: number; onInterim?: (text: string) => void } = {}) {
  const Ctor = ctor();
  let rec: Recognition | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const promise = new Promise<ListenResult>((resolve) => {
    if (!Ctor) return resolve({ alternatives: [], error: "other" });
    rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 5;

    const finals: string[][] = [];
    let error: ListenResult["error"];

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finals[i] = Array.from({ length: r.length }, (_, k) => r[k].transcript);
        else interim += r[0].transcript;
      }
      const sofar = finals.map((f) => f?.[0] ?? "").join(" ");
      opts.onInterim?.((sofar + " " + interim).trim());
    };
    rec.onerror = (e) => {
      error = e.error === "not-allowed" || e.error === "service-not-allowed" ? "not-allowed" : e.error === "no-speech" ? "no-speech" : error;
    };
    rec.onend = () => {
      clearTimeout(timer);
      const segs = finals.filter(Boolean);
      // Combine segments: first alternative for all but the last, which keeps all alternatives.
      const head = segs.slice(0, -1).map((s) => s[0]).join(" ");
      const last = segs.at(-1) ?? [];
      const alternatives = last.map((alt) => `${head} ${alt}`.trim()).filter(Boolean);
      resolve({ alternatives, error: alternatives.length ? undefined : (error ?? "no-speech") });
    };
    rec.start();
    if (opts.maxMs) timer = setTimeout(() => rec?.stop(), opts.maxMs);
  });

  return {
    promise,
    stop: () => (rec as Recognition | null)?.stop(),
    abort: () => (rec as Recognition | null)?.abort(),
  };
}
