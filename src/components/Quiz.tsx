"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { allChunks, type ChunkRef, type Level } from "@/data";
import { addMistake, addToReview, recordQuiz, useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { SpeakButton } from "./SpeakButton";

type Scope = "all" | Level | "learned";
type Kind = "vi-en" | "en-vi" | "listen";
type Question = { kind: Kind; chunk: ChunkRef; options: string[]; answer: string };

const ROUND = 10;
const SCOPES: { id: Scope; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "A1", label: "A1" },
  { id: "A2", label: "A2" },
  { id: "B1", label: "B1" },
  { id: "learned", label: "Cụm đã thuộc" },
];
const PROMPT: Record<Kind, string> = {
  "vi-en": "Chọn câu tiếng Anh đúng nghĩa",
  "en-vi": "Câu này nghĩa là gì?",
  listen: "Nghe và chọn câu bạn vừa nghe",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(pool: ChunkRef[]): Question[] {
  const kinds: Kind[] = ["vi-en", "en-vi", "listen"];
  return shuffle(pool)
    .slice(0, ROUND)
    .map((chunk, i) => {
      const kind = kinds[i % kinds.length];
      const field = kind === "en-vi" ? "vi" : "en";
      const sameLevel = allChunks.filter((c) => c.id !== chunk.id && c.level === chunk.level);
      const distractors = shuffle(sameLevel.length >= 3 ? sameLevel : allChunks.filter((c) => c.id !== chunk.id))
        .map((c) => c[field])
        .filter((t, idx, arr) => t !== chunk[field] && arr.indexOf(t) === idx)
        .slice(0, 3);
      return { kind, chunk, answer: chunk[field], options: shuffle([chunk[field], ...distractors]) };
    });
}

export function Quiz() {
  const params = useSearchParams();
  const initial = (SCOPES.find((s) => s.id === params.get("level"))?.id ?? "all") as Scope;
  const p = useProgress();
  const [scope, setScope] = useState<Scope>(initial);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<ChunkRef[]>([]);
  const [finished, setFinished] = useState(false);
  const [added, setAdded] = useState(false);

  const pool =
    scope === "all"
      ? allChunks
      : scope === "learned"
        ? allChunks.filter((c) => p.learned.includes(c.id))
        : allChunks.filter((c) => c.level === scope);

  function present(q: Question | undefined) {
    if (q?.kind === "listen") speak(q.chunk.en, { rate: p.rate });
  }

  function start() {
    const qs = buildRound(pool);
    setQuestions(qs);
    setIndex(0);
    setPicked(null);
    setWrong([]);
    setFinished(false);
    setAdded(false);
    present(qs[0]);
  }

  function pick(option: string) {
    if (!questions || picked) return;
    const q = questions[index];
    setPicked(option);
    if (option !== q.answer) {
      setWrong((w) => [...w, q.chunk]);
      addMistake({
        en: q.chunk.en,
        vi: q.chunk.vi,
        said: q.kind === "en-vi" ? undefined : option,
        source: "Luyện đề",
        note: q.kind === "en-vi" ? `Chọn nhầm nghĩa: "${option}"` : undefined,
      });
    }
    if (q.kind !== "listen") speak(q.chunk.en, { rate: p.rate });
  }

  function next() {
    if (!questions) return;
    if (index + 1 >= questions.length) {
      recordQuiz(questions.length - wrong.length, questions.length);
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
    present(questions[index + 1]);
  }

  if (!questions) {
    const history = p.quiz.slice(-5).reverse();
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="card p-6">
          <h2 className="mb-1 text-xl font-bold">Đề nhanh {ROUND} câu</h2>
          <p className="mb-5 text-sm text-muted">Trộn 3 dạng: Việt → Anh, Anh → Việt và nghe chọn câu đúng.</p>
          <p className="mb-2 text-sm font-semibold">Phạm vi</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id)}
                className={`btn px-3 py-1.5 text-sm ${scope === s.id ? "btn-primary" : "btn-ghost"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {pool.length < 4 ? (
            <p className="text-sm text-bad">Cần ít nhất 4 cụm từ đã thuộc. Hãy học thêm ở mục Từ vựng.</p>
          ) : (
            <button type="button" className="btn btn-primary" onClick={start}>
              Bắt đầu ({Math.min(ROUND, pool.length)} câu)
            </button>
          )}
        </div>
        <div className="card p-5">
          <p className="mb-3 text-sm font-bold text-muted">LẦN LÀM GẦN ĐÂY</p>
          {history.length === 0 ? (
            <p className="text-sm text-muted">Chưa có lần làm nào.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {history.map((h) => (
                <li key={h.at} className="flex justify-between">
                  <span className="text-muted">{new Date(h.at).toLocaleDateString("vi-VN")}</span>
                  <b className={h.score / h.total >= 0.8 ? "text-ok" : ""}>
                    {h.score}/{h.total}
                  </b>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (finished) {
    const score = questions.length - wrong.length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="card mx-auto max-w-xl p-6 text-center">
        <p className="text-5xl">{pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚"}</p>
        <h2 className="mt-2 text-2xl font-bold">
          {score}/{questions.length} câu đúng
        </h2>
        <p className="text-muted">
          {pct >= 80
            ? "Xuất sắc! Thử lên phạm vi khó hơn nhé."
            : pct >= 50
              ? "Khá lắm! Ôn lại các câu sai bên dưới."
              : "Đừng nản. Sai là một phần của việc học."}
        </p>
        {wrong.length > 0 && (
          <div className="mt-6 text-left">
            <p className="mb-2 text-sm font-bold">Câu cần ôn lại</p>
            <ul className="space-y-2">
              {wrong.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
                  <SpeakButton text={c.en} size="sm" />
                  <div>
                    <p className="font-semibold">{c.en}</p>
                    <p className="text-sm text-muted">{c.vi}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`btn mt-3 w-full ${added ? "btn-on" : "btn-ghost"}`}
              disabled={added}
              onClick={() => {
                addToReview(wrong.map((c) => c.id));
                setAdded(true);
              }}
            >
              {added ? "✓ Đã thêm vào Ôn tập" : "Thêm các câu sai vào Ôn tập"}
            </button>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button type="button" className="btn btn-primary" onClick={start}>
            Làm đề mới
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setQuestions(null)}>
            Đổi phạm vi
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>
          Câu {index + 1}/{questions.length}
        </span>
        <button type="button" className="hover:text-brand" onClick={() => setQuestions(null)}>
          Thoát
        </button>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-brand transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <div className="card p-6">
        <p className="mb-3 text-sm font-semibold text-accent">{PROMPT[q.kind]}</p>
        {q.kind === "listen" ? (
          <button type="button" className="btn btn-primary mb-6" onClick={() => speak(q.chunk.en, { rate: p.rate })}>
            🔊 Nghe lại
          </button>
        ) : (
          <p className="mb-6 text-2xl font-bold">{q.kind === "vi-en" ? q.chunk.vi : q.chunk.en}</p>
        )}
        <div className="grid gap-2">
          {q.options.map((o) => {
            const isAnswer = o === q.answer;
            const style = !picked
              ? "border-line hover:border-brand hover:bg-brand-soft"
              : isAnswer
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
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="text-sm">
              <p className="font-semibold">{picked === q.answer ? "✓ Chính xác!" : "✗ Chưa đúng"}</p>
              <p className="text-muted">
                {q.chunk.en} = {q.chunk.vi}
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={next}>
              {index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
