"use client";

import { useState } from "react";
import type { ThemeWord } from "@/data";
import { rateWords, useProgress } from "@/lib/progress";
import { sample } from "@/lib/random";
import { speak } from "@/lib/speech";

const ROUND = 8;
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Listen and type: trains the link between sound and spelling. */
export function Dictation({ words, onFinish }: { words: ThemeWord[]; onFinish?: () => void }) {
  const { rate } = useProgress();
  const [list, setList] = useState<ThemeWord[] | null>(null);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);

  const say = (w: ThemeWord) => speak(w.en, { rate: Math.min(rate, 0.8) });

  function start() {
    const l = sample(words, ROUND);
    setList(l);
    setI(0);
    setScore(0);
    reset();
    say(l[0]);
  }

  function reset() {
    setValue("");
    setChecked(null);
    setHint(false);
  }

  function check() {
    if (!list || checked !== null) return;
    const w = list[i];
    const ok = norm(value) === norm(w.en) || norm(value) === norm(w.form);
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
    rateWords([{ id: w.id, correct: ok && !hint }]);
  }

  function next() {
    if (!list) return;
    if (i + 1 >= list.length) {
      setI(list.length);
      onFinish?.();
      return;
    }
    setI(i + 1);
    reset();
    say(list[i + 1]);
  }

  if (!list) {
    return (
      <div className="card p-5">
        <p className="font-semibold">✍️ Nghe & gõ</p>
        <p className="mt-1 text-sm text-muted">
          Máy đọc từ, bạn gõ lại đúng chính tả. Nghe được mà viết được thì nhớ rất lâu.
        </p>
        <button type="button" className="btn btn-primary mt-4" onClick={start} disabled={!words.length}>
          Bắt đầu ({Math.min(ROUND, words.length)} từ)
        </button>
      </div>
    );
  }

  if (i >= list.length) {
    return (
      <div className="card p-5 text-center">
        <p className="text-4xl">{score / list.length >= 0.8 ? "🎯" : "📝"}</p>
        <p className="mt-2 text-lg font-bold">
          {score}/{list.length} từ đúng chính tả
        </p>
        <button type="button" className="btn btn-primary mt-4" onClick={start}>
          Lượt mới
        </button>
      </div>
    );
  }

  const w = list[i];
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>
          Từ {i + 1}/{list.length}
        </span>
        <button type="button" className="hover:text-brand" onClick={() => setList(null)}>
          Thoát
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={() => say(w)}>
          🔊 Nghe lại
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => speak(w.ex, { rate })}>
          Nghe trong câu
        </button>
        {!hint && checked === null && (
          <button type="button" className="btn btn-ghost" onClick={() => setHint(true)}>
            Gợi ý
          </button>
        )}
      </div>
      {hint && (
        <p className="mt-3 text-sm text-muted">
          Nghĩa: <b className="text-ink">{w.vi}</b> · bắt đầu bằng &ldquo;{w.en[0]}&rdquo; · {w.en.length} ký tự
        </p>
      )}
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (checked === null) check();
          else next();
        }}
      >
        <input
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={checked !== null}
          placeholder="Gõ từ bạn nghe được…"
          className="min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-4 py-3 text-lg"
        />
        <button type="submit" className="btn btn-primary">
          {checked === null ? "Kiểm tra" : "Tiếp →"}
        </button>
      </form>
      {checked !== null && (
        <p className={`mt-3 font-semibold ${checked ? "text-ok" : "text-bad"}`}>
          {checked ? "✓ Chính xác!" : "✗ Đáp án:"} <span className="text-ink">{w.en}</span>{" "}
          <span className="font-normal text-muted">({w.vi})</span>
        </p>
      )}
    </div>
  );
}
