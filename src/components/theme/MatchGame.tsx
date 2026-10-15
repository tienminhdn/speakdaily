"use client";

import { useRef, useState } from "react";
import type { ThemeWord } from "@/data";
import { rateWords, useProgress } from "@/lib/progress";
import { sample, shuffle } from "@/lib/random";
import { speak } from "@/lib/speech";

const PAIRS = 6;

/** Wall-clock helpers, only ever called from event handlers. */
const nowMs = () => Date.now();
const secondsSince = (t: number) => Math.round((nowMs() - t) / 1000);

/** Match English words with their Vietnamese meanings as fast as possible. */
export function MatchGame({ words, onFinish }: { words: ThemeWord[]; onFinish?: () => void }) {
  const { rate } = useProgress();
  const [round, setRound] = useState<{ left: ThemeWord[]; right: ThemeWord[] } | null>(null);
  const [pickL, setPickL] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const started = useRef(0);

  function start() {
    const pick = sample(words, PAIRS);
    setRound({ left: shuffle(pick), right: shuffle(pick) });
    setPickL(null);
    setMatched(new Set());
    setMissed(new Set());
    setTime(0);
    started.current = nowMs();
  }

  function chooseRight(w: ThemeWord) {
    if (!pickL || matched.has(w.id)) return;
    if (pickL === w.id) {
      const next = new Set(matched).add(w.id);
      setMatched(next);
      setPickL(null);
      speak(w.en, { rate });
      if (round && next.size === round.left.length) {
        setTime(secondsSince(started.current));
        rateWords(round.left.map((x) => ({ id: x.id, correct: !missed.has(x.id) })));
        onFinish?.();
      }
    } else {
      setMissed((m) => new Set(m).add(pickL).add(w.id));
      setShake(w.id);
      setTimeout(() => setShake(null), 400);
    }
  }

  if (!round) {
    return (
      <div className="card p-5">
        <p className="font-semibold">🧩 Ghép cặp</p>
        <p className="mt-1 text-sm text-muted">
          Chọn một từ tiếng Anh, rồi chọn nghĩa đúng. Ghép đúng hết {PAIRS} cặp nhanh nhất có thể.
        </p>
        <button type="button" className="btn btn-primary mt-4" onClick={start} disabled={words.length < PAIRS}>
          Bắt đầu
        </button>
      </div>
    );
  }

  const done = matched.size === round.left.length;
  const tile = "w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition";
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>
          {matched.size}/{round.left.length} cặp · sai {missed.size ? Math.ceil(missed.size / 2) : 0}
        </span>
        <button type="button" className="hover:text-brand" onClick={() => setRound(null)}>
          Thoát
        </button>
      </div>
      {done ? (
        <div className="py-6 text-center">
          <p className="text-4xl">🏆</p>
          <p className="mt-2 text-lg font-bold">Xong trong {time} giây!</p>
          <p className="text-sm text-muted">Từ ghép đúng ngay lần đầu được tăng cấp nhớ.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={start}>
            Ván mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            {round.left.map((w) => (
              <button
                key={w.id}
                type="button"
                disabled={matched.has(w.id)}
                onClick={() => setPickL(w.id)}
                className={`${tile} ${
                  matched.has(w.id)
                    ? "border-transparent bg-ok-soft text-ok opacity-60"
                    : pickL === w.id
                      ? "border-brand bg-brand-soft"
                      : "border-line bg-surface hover:border-brand"
                }`}
              >
                {w.en}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {round.right.map((w) => (
              <button
                key={w.id}
                type="button"
                disabled={matched.has(w.id)}
                onClick={() => chooseRight(w)}
                className={`${tile} ${
                  matched.has(w.id)
                    ? "border-transparent bg-ok-soft text-ok opacity-60"
                    : shake === w.id
                      ? "border-bad bg-bad-soft"
                      : "border-line bg-surface hover:border-brand"
                } ${!pickL && !matched.has(w.id) ? "opacity-70" : ""}`}
              >
                {w.vi}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
