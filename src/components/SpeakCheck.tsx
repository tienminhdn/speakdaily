"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { addMistake, markGoodAttempt, recordSpeaking, useProgress } from "@/lib/progress";
import { listen, recognitionSupported } from "@/lib/recognition";
import { bestAttempt, MISS, PASS, verdict, type ScoreResult } from "@/lib/score";
import { speak, stopSpeech } from "@/lib/speech";

const noop = () => () => {};
/** false on the server / during hydration, real value afterwards. */
export function useRecognitionSupported() {
  return useSyncExternalStore(noop, recognitionSupported, () => false);
}

const TONE = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-accent-soft text-accent",
  bad: "bg-bad-soft text-bad",
};

/** Renders the target sentence with each word coloured by whether it was heard. */
export function MarkedSentence({ result }: { result: ScoreResult }) {
  return (
    <p className="text-lg font-semibold leading-relaxed">
      {result.marks.map((m, i) => (
        <span key={i} className={m.ok ? "text-ok" : "rounded bg-bad-soft px-0.5 text-bad underline decoration-wavy"}>
          {m.word}{" "}
        </span>
      ))}
    </p>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const v = verdict(score);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold ${TONE[v.tone]}`}>
      {v.emoji} {Math.round(score * 100)}%
    </span>
  );
}

/**
 * Speak-and-check: listens to the learner, scores against `target`, highlights missed words,
 * logs misses to the mistakes notebook and good attempts towards fixing them.
 */
export function SpeakCheck({
  target,
  vi,
  source,
  hideTarget = false,
  autoStart = false,
  onScored,
  compact = false,
}: {
  target: string;
  vi?: string;
  source: string;
  /** Hide the English until an attempt is made (reverse-translation drills). */
  hideTarget?: boolean;
  autoStart?: boolean;
  onScored?: (score: number) => void;
  compact?: boolean;
}) {
  const { rate } = useProgress();
  const supported = useRecognitionSupported();
  const [state, setState] = useState<"idle" | "listening" | "done">("idle");
  const [interim, setInterim] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selfRated, setSelfRated] = useState<null | boolean>(null);
  const handle = useRef<ReturnType<typeof listen> | null>(null);
  const started = useRef(false);

  useEffect(() => () => handle.current?.abort(), []);

  async function start() {
    stopSpeech();
    setError(null);
    setInterim("");
    setState("listening");
    const words = target.split(/\s+/).length;
    handle.current = listen({ maxMs: Math.max(5000, words * 900 + 3000), onInterim: setInterim });
    const { alternatives, error: err } = await handle.current.promise;
    handle.current = null;
    if (err === "not-allowed") {
      setError("Chưa có quyền dùng micro. Hãy bấm biểu tượng 🔒 trên thanh địa chỉ và cho phép Micro.");
      setState("idle");
      return;
    }
    if (!alternatives.length) {
      setError("Không nghe thấy gì. Hãy nói to, rõ hơn và thử lại.");
      setState("idle");
      return;
    }
    const r = bestAttempt(target, alternatives);
    setResult(r);
    setState("done");
    recordSpeaking(r.score >= PASS, r.score);
    if (r.score >= PASS) markGoodAttempt(target);
    else if (r.score < MISS) addMistake({ en: target, vi, said: r.said, source });
    onScored?.(r.score);
  }

  useEffect(() => {
    if (autoStart && supported && !started.current) {
      started.current = true;
      // Defer so the effect itself doesn't set state synchronously.
      queueMicrotask(start);
    }
  });

  function rateSelf(ok: boolean) {
    setSelfRated(ok);
    recordSpeaking(ok);
    if (ok) markGoodAttempt(target);
    else addMistake({ en: target, vi, source, note: "Tự chấm: chưa nói đúng" });
    onScored?.(ok ? 1 : 0);
  }

  const showTarget = !hideTarget || state === "done" || selfRated !== null;

  return (
    <div className={compact ? "" : "rounded-xl border border-line bg-surface-2/60 p-4"}>
      {!compact && vi && <p className="mb-1 text-sm text-muted">{vi}</p>}
      {result && state === "done" ? (
        <MarkedSentence result={result} />
      ) : showTarget ? (
        !compact && <p className="text-lg font-semibold">{target}</p>
      ) : (
        <p className="text-sm italic text-muted">Nói câu này bằng tiếng Anh…</p>
      )}

      {state === "listening" && (
        <p className="mt-2 flex items-center gap-2 text-sm">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bad opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-bad" />
          </span>
          <span className="text-muted">{interim || "Đang nghe… hãy nói"}</span>
        </p>
      )}

      {result && state === "done" && (
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <ScoreBadge score={result.score} />
            <span className="font-semibold">{verdict(result.score).label}</span>
          </div>
          <p className="text-muted">
            Máy nghe được: <i>&ldquo;{result.said}&rdquo;</i>
          </p>
          {result.score < MISS && <p className="text-xs text-muted">Đã lưu vào Sổ tay lỗi để ôn lại.</p>}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-bad">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-ghost px-3 py-1.5 text-xs"
          onClick={() => speak(target, { rate })}
          disabled={!showTarget && hideTarget}
          title={!showTarget ? "Nói thử trước, rồi nghe mẫu" : undefined}
        >
          🔊 Nghe mẫu
        </button>
        {supported ? (
          state === "listening" ? (
            <button
              type="button"
              className="btn bg-bad px-3 py-1.5 text-xs text-white"
              onClick={() => handle.current?.stop()}
            >
              ■ Dừng
            </button>
          ) : (
            <button type="button" className="btn btn-primary px-3 py-1.5 text-xs" onClick={start}>
              🎤 {state === "done" ? "Nói lại" : "Nói"}
            </button>
          )
        ) : selfRated === null ? (
          <>
            {hideTarget && !showTarget ? (
              <button type="button" className="btn btn-primary px-3 py-1.5 text-xs" onClick={() => setSelfRated(true)}>
                Xem đáp án
              </button>
            ) : (
              <>
                <span className="text-xs text-muted">Tự chấm:</span>
                <button type="button" className="btn btn-on px-3 py-1.5 text-xs" onClick={() => rateSelf(true)}>
                  ✓ Nói đúng
                </button>
                <button
                  type="button"
                  className="btn bg-bad-soft px-3 py-1.5 text-xs text-bad"
                  onClick={() => rateSelf(false)}
                >
                  ✗ Chưa đúng
                </button>
              </>
            )}
          </>
        ) : (
          <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={() => setSelfRated(null)}>
            Chấm lại
          </button>
        )}
      </div>
      {!supported && !compact && (
        <p className="mt-2 text-xs text-muted">
          Trình duyệt này chưa hỗ trợ chấm giọng nói tự động. Hãy dùng Chrome hoặc Edge để được chấm điểm.
        </p>
      )}
    </div>
  );
}
