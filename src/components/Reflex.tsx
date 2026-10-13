"use client";

import { useEffect, useRef, useState } from "react";
import type { Prompt } from "@/data";
import { addMistake, markGoodAttempt, recordSpeaking, useProgress } from "@/lib/progress";
import { isHardError, listen } from "@/lib/recognition";
import { bestAttempt, MISS, PASS, type ScoreResult } from "@/lib/score";
import { speak, stopSpeech } from "@/lib/speech";
import { track } from "@/lib/analytics";
import {
  MarkedSentence,
  ScoreBadge,
  useRecognitionProblem,
  useRecognitionSupported,
  useUnsupportedMessage,
} from "./SpeakCheck";

type Outcome = { prompt: Prompt; result: ScoreResult | null; self?: boolean; late: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Reflex drill: a Vietnamese prompt appears, the learner has a few seconds to start
 * saying it in English. Scored by speech recognition, or self-rated as a fallback.
 */
export function Reflex({
  pool,
  title = "Phản xạ Việt → Anh",
  defaultCount = 10,
  defaultSeconds = 5,
  onFinish,
}: {
  pool: Prompt[];
  title?: string;
  defaultCount?: number;
  defaultSeconds?: number;
  onFinish?: (avg: number) => void;
}) {
  const { rate } = useProgress();
  const supported = useRecognitionSupported();
  const problem = useRecognitionProblem();
  const unsupported = useUnsupportedMessage();
  const [count, setCount] = useState(defaultCount);
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [queue, setQueue] = useState<Prompt[] | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"think" | "listening" | "result">("think");
  const [interim, setInterim] = useState("");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [left, setLeft] = useState(0);
  const handle = useRef<ReturnType<typeof listen> | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const heard = useRef(false);

  useEffect(
    () => () => {
      clearInterval(timer.current);
      handle.current?.abort();
    },
    [],
  );

  const prompt = queue?.[index];
  const done = queue !== null && index >= queue.length;

  function begin() {
    const q = shuffle(pool).slice(0, count);
    setQueue(q);
    setOutcomes([]);
    setIndex(0);
    run(q[0]);
  }

  function countdown(onEnd: () => void) {
    clearInterval(timer.current);
    const end = Date.now() + seconds * 1000;
    setLeft(seconds);
    timer.current = setInterval(() => {
      const ms = end - Date.now();
      setLeft(Math.max(0, Math.ceil(ms / 1000)));
      if (ms <= 0) {
        clearInterval(timer.current);
        onEnd();
      }
    }, 100);
  }

  async function run(p: Prompt | undefined) {
    if (!p) return;
    stopSpeech();
    setInterim("");
    heard.current = false;
    if (!supported) {
      setPhase("think");
      countdown(() => setPhase("result"));
      return;
    }
    setPhase("listening");
    // The learner must START speaking within `seconds`; then they get time to finish.
    countdown(() => {
      if (!heard.current) handle.current?.stop();
    });
    handle.current = listen({
      maxMs: seconds * 1000 + p.en.split(" ").length * 800 + 2500,
      onInterim: (t) => {
        if (t) heard.current = true;
        setInterim(t);
      },
    });
    const { alternatives, error } = await handle.current.promise;
    clearInterval(timer.current);
    if (isHardError(error)) {
      // Recognition can't work here: let the learner self-rate this prompt instead.
      setPhase("result");
      return;
    }
    const late = !heard.current;
    const result = bestAttempt(p.en, alternatives);
    recordSpeaking(result.score >= PASS, result.score);
    if (result.score >= PASS) markGoodAttempt(p.en);
    else if (result.score < MISS)
      addMistake({ en: p.en, vi: p.vi, said: result.said, source: `Phản xạ · ${p.source}` });
    setOutcomes((o) => [...o, { prompt: p, result, late }]);
    setPhase("result");
  }

  function rateSelf(ok: boolean) {
    if (!prompt) return;
    recordSpeaking(ok);
    if (ok) markGoodAttempt(prompt.en);
    else addMistake({ en: prompt.en, vi: prompt.vi, source: `Phản xạ · ${prompt.source}`, note: "Tự chấm" });
    const o: Outcome = { prompt, result: null, self: ok, late: false };
    setOutcomes((prev) => [...prev, o]);
    next([...outcomes, o]);
  }

  function next(all: Outcome[] = outcomes) {
    const i = index + 1;
    setIndex(i);
    if (queue && i < queue.length) run(queue[i]);
    else {
      const scores = all.map((o) => (o.result ? o.result.score : o.self ? 1 : 0));
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      track("reflex_finish", { count: scores.length, avg: Math.round(avg * 100), seconds });
      onFinish?.(avg);
    }
  }

  if (pool.length === 0) {
    return <p className="card p-5 text-sm text-muted">Chưa có câu nào để luyện ở phạm vi này.</p>;
  }

  if (!queue) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted">
          Câu tiếng Việt hiện ra, bạn có vài giây để <b>bắt đầu nói</b> câu tiếng Anh. Không dịch từng chữ, hãy nói cả
          cụm.
          {!supported && (problem || unsupported) && (
            <span className="mt-2 block text-bad">⚠️ {problem ?? unsupported} Bạn sẽ tự chấm sau khi xem đáp án.</span>
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            Số câu
            <select
              className="rounded-md border border-line bg-surface px-2 py-1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {[5, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {Math.min(n, pool.length)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Thời gian bắt đầu nói
            <select
              className="rounded-md border border-line bg-surface px-2 py-1"
              value={seconds}
              onChange={(e) => setSeconds(Number(e.target.value))}
            >
              <option value={8}>8 giây (khởi động)</option>
              <option value={5}>5 giây</option>
              <option value={3}>3 giây (phản xạ)</option>
            </select>
          </label>
        </div>
        <button type="button" className="btn btn-primary mt-5" onClick={begin}>
          ⚡ Bắt đầu
        </button>
      </div>
    );
  }

  if (done) {
    const scored = outcomes.map((o) => (o.result ? o.result.score : o.self ? 1 : 0));
    const avg = scored.reduce((a, b) => a + b, 0) / Math.max(1, scored.length);
    const good = scored.filter((s) => s >= PASS).length;
    return (
      <div className="card p-6">
        <div className="text-center">
          <p className="text-5xl">{avg >= 0.8 ? "⚡" : avg >= 0.5 ? "💪" : "🔁"}</p>
          <h3 className="mt-2 text-2xl font-bold">
            {good}/{outcomes.length} câu đạt · trung bình {Math.round(avg * 100)}%
          </h3>
          <p className="text-sm text-muted">Câu dưới {Math.round(MISS * 100)}% đã được lưu vào Sổ tay lỗi.</p>
        </div>
        <ul className="mt-5 space-y-2">
          {outcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg bg-surface-2 p-3 text-sm">
              {o.result ? <ScoreBadge score={o.result.score} /> : <span>{o.self ? "✓" : "✗"}</span>}
              <div className="min-w-0">
                <p className="text-muted">{o.prompt.vi}</p>
                <p className="font-semibold">{o.prompt.en}</p>
                {o.late && <p className="text-xs text-accent">Bắt đầu nói chậm, lần sau thử nhanh hơn nhé.</p>}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn-primary" onClick={begin}>
            Luyện lượt mới
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setQueue(null)}>
            Đổi cài đặt
          </button>
        </div>
      </div>
    );
  }

  const last = outcomes.at(-1);
  const current = phase === "result" && last?.prompt === prompt ? last : null;

  return (
    <div className="card p-6">
      <div className="mb-3 flex justify-between text-sm text-muted">
        <span>
          Câu {index + 1}/{queue.length}
        </span>
        <button
          type="button"
          className="hover:text-brand"
          onClick={() => {
            handle.current?.abort();
            clearInterval(timer.current);
            setQueue(null);
          }}
        >
          Thoát
        </button>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-brand transition-all" style={{ width: `${(index / queue.length) * 100}%` }} />
      </div>

      {problem && (
        <p className="mb-3 rounded-lg bg-bad-soft p-3 text-sm text-bad">⚠️ {problem} Tạm thời bạn tự chấm nhé.</p>
      )}
      <p className="text-xs font-bold uppercase tracking-wide text-accent">{prompt!.source}</p>
      <p className="mt-1 text-2xl font-bold">{prompt!.vi}</p>

      {phase !== "result" && (
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full transition-[width] duration-100 ${left <= 1 ? "bg-bad" : "bg-accent"}`}
              style={{ width: `${(left / seconds) * 100}%` }}
            />
          </div>
          {supported ? (
            <p className="mt-3 flex items-center gap-2 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bad opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-bad" />
              </span>
              <span className="text-muted">{interim || `Nói ngay! Còn ${left}s để bắt đầu`}</span>
              {interim && (
                <button type="button" className="ml-auto text-xs text-brand" onClick={() => handle.current?.stop()}>
                  Xong
                </button>
              )}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">Nói to câu tiếng Anh… còn {left}s</p>
          )}
        </div>
      )}

      {phase === "result" && (
        <div className="mt-5 border-t border-line pt-4">
          {current?.result ? (
            <>
              <MarkedSentence result={current.result} />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <ScoreBadge score={current.result.score} />
                <span className="text-muted">
                  Máy nghe được: <i>&ldquo;{current.result.said || "(không nghe thấy)"}&rdquo;</i>
                </span>
              </div>
            </>
          ) : (
            <p className="text-lg font-semibold">{prompt!.en}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => speak(prompt!.en, { rate })}>
              🔊 Nghe mẫu
            </button>
            {supported || current ? (
              <button type="button" className="btn btn-primary" onClick={() => next()}>
                {index + 1 >= queue.length ? "Xem kết quả" : "Câu tiếp →"}
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-on" onClick={() => rateSelf(true)}>
                  ✓ Tôi nói đúng
                </button>
                <button type="button" className="btn bg-bad-soft text-bad" onClick={() => rateSelf(false)}>
                  ✗ Chưa đúng
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
