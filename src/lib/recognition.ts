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

/** Raw SpeechRecognition error codes, plus "start-failed" when start() throws. */
export type RecognitionError =
  | "not-allowed"
  | "service-not-allowed"
  | "no-speech"
  | "network"
  | "audio-capture"
  | "language-not-supported"
  | "bad-grammar"
  | "aborted"
  | "start-failed"
  | "other";

export type ListenResult = { alternatives: string[]; error?: RecognitionError };

/** Errors that will keep happening on this browser/device, so retrying is pointless. */
const HARD: RecognitionError[] = [
  "not-allowed",
  "service-not-allowed",
  "network",
  "audio-capture",
  "language-not-supported",
  "start-failed",
];
export const isHardError = (e?: RecognitionError) => !!e && HARD.includes(e);

// Once a hard error happens, every speak-check on the page falls back to self-rating.
let broken: RecognitionError | null = null;
const brokenListeners = new Set<() => void>();
export function markRecognitionBroken(e: RecognitionError) {
  if (broken) return;
  broken = e;
  brokenListeners.forEach((l) => l());
}
export function recognitionBrokenReason() {
  return broken;
}
export function subscribeRecognition(cb: () => void) {
  brokenListeners.add(cb);
  return () => brokenListeners.delete(cb);
}

export function recognitionSupported() {
  return ctor() !== null && broken === null;
}

function browser() {
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const nav = typeof navigator === "undefined" ? {} : (navigator as unknown as Record<string, unknown>);
  if (/coc_coc/i.test(ua)) return "Cốc Cốc";
  if (nav.brave) return "Brave";
  if (/OPR\//.test(ua)) return "Opera";
  if (/CriOS|FxiOS|EdgiOS/.test(ua) || (/iPhone|iPad/.test(ua) && /Safari/.test(ua))) return "iOS";
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) return "Safari";
  return "";
}

/** Vietnamese, actionable explanation of a recognition error. */
export function explainError(e: RecognitionError): string {
  const b = browser();
  switch (e) {
    case "not-allowed":
      return "Micro đang bị chặn. Bấm biểu tượng 🔒 trên thanh địa chỉ → cho phép Micro → tải lại trang. Trên Mac, kiểm tra thêm Cài đặt hệ thống → Quyền riêng tư & Bảo mật → Micrô → bật cho trình duyệt.";
    case "service-not-allowed":
      return b === "Safari" || b === "iOS"
        ? "Safari cần bật Đọc chính tả. iPhone/iPad: Cài đặt → Cài đặt chung → Bàn phím → bật Đọc chính tả. Mac: Cài đặt hệ thống → Bàn phím → Đọc chính tả. Sau đó tải lại trang."
        : "Trình duyệt này không cho dùng dịch vụ nhận diện giọng nói. Hãy mở trang bằng Chrome hoặc Edge.";
    case "network":
      return b
        ? `${b} không hỗ trợ nhận diện giọng nói (không kết nối được máy chủ nhận diện). Hãy mở trang bằng Google Chrome hoặc Microsoft Edge.`
        : "Không kết nối được dịch vụ nhận diện giọng nói. Kiểm tra mạng, hoặc mở trang bằng Google Chrome / Microsoft Edge.";
    case "audio-capture":
      return "Không lấy được âm thanh từ micro. Kiểm tra micro đã cắm, không bị ứng dụng khác (Zoom, Meet…) chiếm, và trên Mac đã bật quyền Micrô cho trình duyệt.";
    case "language-not-supported":
      return "Trình duyệt này không nhận diện được tiếng Anh. Hãy dùng Chrome hoặc Edge.";
    case "start-failed":
      return b === "iOS"
        ? "Trình duyệt trên iPhone này không mở được nhận diện giọng nói. Hãy dùng Safari (và bật Đọc chính tả)."
        : "Không khởi động được nhận diện giọng nói trên trình duyệt này. Hãy dùng Chrome hoặc Edge.";
    case "no-speech":
      return "Không nghe thấy gì. Hãy nói to, rõ hơn và thử lại.";
    default:
      return "Nhận diện giọng nói gặp lỗi. Hãy thử lại, hoặc dùng Chrome / Edge.";
  }
}

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
    if (!Ctor) return resolve({ alternatives: [], error: "start-failed" });
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
      const head = segs
        .slice(0, -1)
        .map((s) => s[0])
        .join(" ");
      const last = segs.at(-1) ?? [];
      let alternatives = last.map((alt) => `${head} ${alt}`.trim()).filter(Boolean);
      // Stopped before the engine finalised anything: fall back to what was shown live.
      const live = `${segs.map((s) => s[0]).join(" ")} ${interim}`.trim();
      if (!alternatives.length && live) alternatives = [live];
      const err = alternatives.length ? undefined : error && error !== "aborted" ? error : "no-speech";
      if (isHardError(err)) markRecognitionBroken(err!);
      resolve({ alternatives, error: err });
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
      // Keep the first meaningful error; "aborted" is just us cancelling.
      if (e.error !== "aborted" || !error) error = (e.error as RecognitionError) || "other";
      if (isHardError(error)) finish();
    };
    r.onend = finish;

    active = { finish };
    try {
      r.start();
    } catch {
      error = "start-failed";
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
