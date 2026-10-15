"use client";

import { useState } from "react";
import type { ThemeWord } from "@/data";
import { addMistake, rateWords, useProgress } from "@/lib/progress";
import { sample, shuffle } from "@/lib/random";
import { speak } from "@/lib/speech";

export type QuizKind = "cloze" | "chunk" | "recall" | "meaning" | "listen";

type Q = { kind: QuizKind; word: ThemeWord; prompt: string; promptVi?: string; options: string[]; answer: string };

const PROMPT: Record<QuizKind, string> = {
  cloze: "Chọn từ đúng để điền vào câu",
  chunk: "Hoàn thành cụm từ",
  recall: "Từ tiếng Anh nào có nghĩa là",
  meaning: "Từ này nghĩa là gì?",
  listen: "Nghe và chọn nghĩa đúng",
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const blank = (text: string, part: string) => text.replace(new RegExp(`\\b${esc(part)}\\b`, "i"), "_____");

/** Distractors of the same part of speech when possible, so the right answer isn't guessable by grammar. */
function distractors(w: ThemeWord, pool: ThemeWord[], field: (x: ThemeWord) => string) {
  const others = pool.filter((x) => x.id !== w.id && field(x).toLowerCase() !== field(w).toLowerCase());
  const same = others.filter((x) => x.pos === w.pos);
  const picked = sample(same.length >= 3 ? same : others, 3).map(field);
  return shuffle([field(w), ...picked]);
}

function build(kind: QuizKind, w: ThemeWord, pool: ThemeWord[]): Q {
  switch (kind) {
    case "cloze":
      return {
        kind,
        word: w,
        prompt: blank(w.ex, w.form),
        promptVi: w.exVi,
        options: distractors(w, pool, (x) => x.form),
        answer: w.form,
      };
    case "chunk": {
      // Blank the word inside its collocation; if the chunk splits the word up, ask about the example instead.
      const part = [w.en, w.form].find((x) => new RegExp(`\\b${esc(x)}\\b`, "i").test(w.chunk));
      if (!part) return build("cloze", w, pool);
      const options = distractors(w, pool, (x) => (x.id === w.id ? part : x.en));
      return { kind, word: w, prompt: blank(w.chunk, part), promptVi: w.chunkVi, options, answer: part };
    }
    case "recall":
      return { kind, word: w, prompt: w.vi, options: distractors(w, pool, (x) => x.en), answer: w.en };
    case "meaning":
      return { kind, word: w, prompt: w.en, options: distractors(w, pool, (x) => x.vi), answer: w.vi };
    case "listen":
      return { kind, word: w, prompt: "", options: distractors(w, pool, (x) => x.vi), answer: w.vi };
  }
}

/** Multiple-choice practice / test over a lesson's words. */
export function WordQuiz({
  words,
  kinds,
  count = 10,
  title,
  description,
  passMark,
  onFinish,
}: {
  words: ThemeWord[];
  kinds: QuizKind[];
  count?: number;
  title: string;
  description: string;
  passMark?: number;
  onFinish?: (score: number) => void;
}) {
  const { rate } = useProgress();
  const [qs, setQs] = useState<Q[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<ThemeWord[]>([]);
  const [done, setDone] = useState(false);

  function present(q?: Q) {
    if (q?.kind === "listen") speak(q.word.en, { rate });
  }

  function start() {
    const list = sample(words, Math.min(count, words.length)).map((w, k) => build(kinds[k % kinds.length], w, words));
    setQs(list);
    setI(0);
    setPicked(null);
    setWrong([]);
    setDone(false);
    present(list[0]);
  }

  function pick(o: string) {
    if (!qs || picked) return;
    const q = qs[i];
    setPicked(o);
    const ok = o === q.answer;
    rateWords([{ id: q.word.id, correct: ok }]);
    if (!ok) {
      setWrong((w) => [...w, q.word]);
      addMistake({
        en: q.word.chunk,
        vi: q.word.chunkVi,
        source: "10 Chủ đề",
        note: `Từ "${q.word.en}" = ${q.word.vi}`,
      });
    }
    if (q.kind === "cloze") speak(q.word.ex, { rate });
    else if (q.kind === "chunk") speak(q.word.chunk, { rate });
    else if (q.kind !== "listen") speak(q.word.en, { rate });
  }

  function next() {
    if (!qs) return;
    if (i + 1 >= qs.length) {
      setDone(true);
      onFinish?.((qs.length - wrong.length) / qs.length);
      return;
    }
    setI(i + 1);
    setPicked(null);
    present(qs[i + 1]);
  }

  if (!qs) {
    return (
      <div className="card p-5">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
        <button type="button" className="btn btn-primary mt-4" onClick={start} disabled={words.length < 4}>
          Bắt đầu ({Math.min(count, words.length)} câu)
        </button>
      </div>
    );
  }

  if (done) {
    const score = (qs.length - wrong.length) / qs.length;
    const passed = passMark === undefined || score >= passMark;
    return (
      <div className="card p-5 text-center">
        <p className="text-4xl">{passed ? "🎉" : "💪"}</p>
        <p className="mt-2 text-2xl font-bold">
          {qs.length - wrong.length}/{qs.length} câu đúng
        </p>
        {passMark !== undefined && (
          <p className={`text-sm font-semibold ${passed ? "text-ok" : "text-bad"}`}>
            {passed
              ? "Đạt! Bài học đã hoàn thành."
              : `Cần đạt ${Math.round(passMark * 100)}% để hoàn thành bài. Ôn thêm rồi thử lại nhé.`}
          </p>
        )}
        {wrong.length > 0 && (
          <ul className="mt-4 space-y-1 text-left text-sm">
            {wrong.map((w) => (
              <li key={w.id} className="rounded-lg bg-surface-2 px-3 py-2">
                <b>{w.en}</b> = {w.vi} · <span className="text-muted">{w.chunk}</span>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn-primary mt-4" onClick={start}>
          Làm lại
        </button>
      </div>
    );
  }

  const q = qs[i];
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>
          Câu {i + 1}/{qs.length}
        </span>
        <button type="button" className="hover:text-brand" onClick={() => setQs(null)}>
          Thoát
        </button>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-brand transition-all" style={{ width: `${(i / qs.length) * 100}%` }} />
      </div>
      <p className="mb-2 text-sm font-semibold text-accent">{PROMPT[q.kind]}</p>
      {q.kind === "listen" ? (
        <button type="button" className="btn btn-primary mb-4" onClick={() => speak(q.word.en, { rate })}>
          🔊 Nghe lại
        </button>
      ) : (
        <p className="mb-1 text-xl font-bold">{q.prompt}</p>
      )}
      {q.promptVi && <p className="mb-4 text-sm text-muted">{q.promptVi}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          const style = !picked
            ? "border-line hover:border-brand hover:bg-brand-soft"
            : o === q.answer
              ? "border-ok bg-ok-soft text-ok"
              : o === picked
                ? "border-bad bg-bad-soft text-bad"
                : "border-line opacity-60";
          return (
            <button
              key={o}
              type="button"
              disabled={!!picked}
              onClick={() => pick(o)}
              className={`rounded-xl border-2 bg-surface px-4 py-3 text-left font-medium transition ${style}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm">
          <p>
            <b>{q.word.en}</b> = {q.word.vi} · <span className="text-muted">{q.word.chunk}</span>
          </p>
          <button type="button" className="btn btn-primary" onClick={next}>
            {i + 1 >= qs.length ? "Xem kết quả" : "Câu tiếp →"}
          </button>
        </div>
      )}
    </div>
  );
}
