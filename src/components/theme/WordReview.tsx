"use client";

import { useState } from "react";
import type { ThemeWord } from "@/data";
import { rateWords, REMEMBERED, useProgress, wordState } from "@/lib/progress";
import { shuffle } from "@/lib/random";
import { speak } from "@/lib/speech";
import { useNow } from "@/lib/time";
import { SpeakButton } from "../SpeakButton";
import { SpeakCheck } from "../SpeakCheck";

type Dir = "vi-en" | "en-vi";

/**
 * Spaced flashcards for theme words: due and weak words first, then new ones.
 * "Nhớ" levels a word up (seen again later), "Chưa nhớ" levels it down (seen again this session).
 */
export function WordReview({
  words,
  limit = 12,
  onFinish,
  emptyHint,
}: {
  words: ThemeWord[];
  limit?: number;
  onFinish?: () => void;
  emptyHint?: string;
}) {
  const p = useProgress();
  const now = useNow();
  const [queue, setQueue] = useState<ThemeWord[] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [dir, setDir] = useState<Dir>("vi-en");
  const [stats, setStats] = useState({ ok: 0, again: 0 });

  const due = now ? words.filter((w) => p.words[w.id] && wordState(p, w.id).due <= now) : [];
  const fresh = words.filter((w) => !p.words[w.id]);
  const remembered = words.filter((w) => wordState(p, w.id).lvl >= REMEMBERED).length;

  function start() {
    const weakFirst = [...due].sort((a, b) => wordState(p, a.id).lvl - wordState(p, b.id).lvl);
    const pick = [...weakFirst, ...shuffle(fresh)].slice(0, limit);
    // Never leave the learner with nothing: fall back to the least-known words.
    const list = pick.length
      ? pick
      : [...words].sort((a, b) => wordState(p, a.id).lvl - wordState(p, b.id).lvl).slice(0, limit);
    setQueue(list);
    setFlipped(false);
    setStats({ ok: 0, again: 0 });
  }

  function flip(w: ThemeWord) {
    setFlipped(true);
    speak(w.en, { rate: p.rate });
  }

  function grade(ok: boolean) {
    if (!queue) return;
    const [w, ...rest] = queue;
    rateWords([{ id: w.id, correct: ok }]);
    setStats((s) => ({ ok: s.ok + (ok ? 1 : 0), again: s.again + (ok ? 0 : 1) }));
    const next = ok ? rest : [...rest, w];
    setQueue(next);
    setFlipped(false);
    if (next.length === 0) onFinish?.();
  }

  if (!queue || queue.length === 0) {
    return (
      <div className="card p-5">
        {queue && (
          <p className="mb-3 rounded-lg bg-ok-soft p-3 text-sm text-ok">
            🎉 Xong lượt ôn: {stats.ok} lần nhớ, {stats.again} lần cần ôn lại.
          </p>
        )}
        <p className="font-semibold">🃏 Thẻ ghi nhớ</p>
        <p className="mt-1 text-sm text-muted">
          {now === 0
            ? "…"
            : `${due.length} từ đến hạn ôn · ${fresh.length} từ chưa học · đã nhớ ${remembered}/${words.length}`}
        </p>
        {emptyHint && words.length === 0 && <p className="mt-2 text-sm text-muted">{emptyHint}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(
            [
              ["vi-en", "Nhìn nghĩa → nói từ"],
              ["en-vi", "Nhìn từ → nhớ nghĩa"],
            ] as [Dir, string][]
          ).map(([d, label]) => (
            <button
              key={d}
              type="button"
              onClick={() => setDir(d)}
              className={`btn px-3 py-1.5 text-xs ${dir === d ? "btn-primary" : "btn-ghost"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary mt-4" onClick={start} disabled={words.length === 0}>
          {queue ? "Ôn lượt mới" : `Bắt đầu (${Math.min(limit, Math.max(due.length + fresh.length, 1))} thẻ)`}
        </button>
      </div>
    );
  }

  const w = queue[0];
  const s = wordState(p, w.id);
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-2 flex justify-between text-sm text-muted">
        <span>
          Còn {queue.length} thẻ · cấp nhớ {s.lvl}/5
        </span>
        <button type="button" className="hover:text-brand" onClick={() => setQueue(null)}>
          Dừng
        </button>
      </div>
      <div className="card flex min-h-64 flex-col items-center justify-center p-6 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
          {dir === "vi-en" ? "Nói từ tiếng Anh" : "Nghĩa là gì?"}
        </p>
        <p className="text-2xl font-bold">{dir === "vi-en" ? w.vi : w.en}</p>
        {dir === "en-vi" && (
          <div className="mt-2">
            <SpeakButton text={w.en} />
          </div>
        )}
        {flipped && (
          <div className="mt-5 w-full space-y-2 border-t border-line pt-5">
            <div className="flex items-center justify-center gap-2">
              <p className="text-xl font-bold text-brand">{dir === "vi-en" ? w.en : w.vi}</p>
              {dir === "vi-en" && <SpeakButton text={w.en} size="sm" />}
            </div>
            <p className="text-xs text-muted">/{w.hint}/</p>
            <p className="text-sm">
              <b>{w.chunk}</b> · <span className="text-muted">{w.chunkVi}</span>
            </p>
            <p className="text-sm text-muted">{w.ex}</p>
          </div>
        )}
      </div>
      {!flipped && dir === "vi-en" && (
        <div className="mt-3">
          <SpeakCheck
            key={w.id}
            target={w.en}
            vi={w.vi}
            source="Từ vựng 10 chủ đề"
            hideTarget
            compact
            onScored={() => setFlipped(true)}
          />
        </div>
      )}
      {!flipped ? (
        <button type="button" className="btn btn-primary mt-3 w-full py-3" onClick={() => flip(w)}>
          Lật thẻ
        </button>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="btn bg-bad-soft py-3 text-bad" onClick={() => grade(false)}>
            Chưa nhớ
          </button>
          <button type="button" className="btn bg-ok-soft py-3 text-ok" onClick={() => grade(true)}>
            Nhớ rồi
          </button>
        </div>
      )}
    </div>
  );
}
