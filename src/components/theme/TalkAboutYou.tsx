"use client";

import { useEffect, useRef, useState } from "react";
import type { ThemeLesson } from "@/data";
import { markWordsUsed, useProgress, wordState } from "@/lib/progress";
import { listen } from "@/lib/recognition";
import { findUsedWords } from "@/lib/wordmatch";
import { SpeakButton } from "../SpeakButton";
import { useRecognitionSupported } from "../SpeakCheck";

type Answer = { text: string; used: string[] };

/**
 * Personal questions: the learner answers by voice or typing, and we show which lesson
 * words they actually used — the "use the word" half of vocabulary learning.
 */
export function TalkAboutYou({ lesson, onProgress }: { lesson: ThemeLesson; onProgress?: (answered: number) => void }) {
  const p = useProgress();
  const supported = useRecognitionSupported();
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [showVi, setShowVi] = useState(false);
  const handle = useRef<ReturnType<typeof listen> | null>(null);
  const base = useRef("");

  useEffect(() => () => handle.current?.abort(), []);

  const q = lesson.talk[i];
  const answer = answers[i];
  const byId = new Map(lesson.words.map((w) => [w.id, w]));

  async function record() {
    if (listening) {
      handle.current?.stop();
      return;
    }
    base.current = text ? `${text.trim()} ` : "";
    setListening(true);
    handle.current = listen({
      maxMs: 60_000,
      silenceMs: 3500,
      onInterim: (t) => setText(base.current + t),
    });
    const { alternatives } = await handle.current.promise;
    handle.current = null;
    setListening(false);
    if (alternatives[0]) setText(base.current + alternatives[0]);
  }

  function submit() {
    if (!text.trim()) return;
    const used = findUsedWords(text, lesson.words);
    markWordsUsed(used);
    const next = { ...answers, [i]: { text: text.trim(), used } };
    setAnswers(next);
    onProgress?.(Object.keys(next).length);
  }

  function go(n: number) {
    handle.current?.abort();
    setI(n);
    setText(answers[n]?.text ?? "");
    setShowVi(false);
  }

  const usedEver = lesson.words.filter((w) => wordState(p, w.id).used > 0).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex gap-1">
          {lesson.talk.map((_, k) => (
            <button
              key={k}
              type="button"
              onClick={() => go(k)}
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                k === i ? "bg-brand text-brand-ink" : answers[k] ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted"
              }`}
            >
              {answers[k] ? "✓" : k + 1}
            </button>
          ))}
        </div>
        <span className="text-muted">
          Bạn đã dùng <b className="text-ink">{usedEver}</b>/{lesson.words.length} từ của bài
        </span>
      </div>

      <div className="card p-5">
        <div className="flex items-start gap-3">
          <SpeakButton text={q.q} />
          <div>
            <p className="text-xl font-bold">{q.q}</p>
            <button type="button" className="text-sm text-muted hover:text-brand" onClick={() => setShowVi((v) => !v)}>
              {showVi ? q.qVi : "Xem nghĩa tiếng Việt"}
            </button>
          </div>
        </div>

        <p className="mt-4 mb-2 text-xs font-bold uppercase tracking-wide text-muted">Thử dùng những từ này</p>
        <div className="flex flex-wrap gap-2">
          {q.targets.map((id) => {
            const w = byId.get(id);
            if (!w) return null;
            const hit = answer?.used.includes(id);
            return (
              <span
                key={id}
                title={w.vi}
                className={`rounded-full border px-3 py-1 text-sm ${hit ? "border-ok bg-ok-soft font-semibold text-ok" : "border-line bg-surface"}`}
              >
                {hit ? "✓ " : ""}
                {w.en}
              </span>
            );
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={
            supported ? "Bấm 🎤 để nói, hoặc gõ câu trả lời bằng tiếng Anh…" : "Gõ câu trả lời bằng tiếng Anh…"
          }
          className="mt-4 w-full rounded-xl border-2 border-line bg-surface px-4 py-3"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {supported && (
            <button type="button" className={`btn ${listening ? "bg-bad text-white" : "btn-ghost"}`} onClick={record}>
              {listening ? "■ Dừng" : "🎤 Nói"}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={submit} disabled={!text.trim() || listening}>
            Kiểm tra từ đã dùng
          </button>
          {i + 1 < lesson.talk.length && (
            <button type="button" className="btn btn-ghost ml-auto" onClick={() => go(i + 1)}>
              Câu tiếp →
            </button>
          )}
        </div>

        {answer && (
          <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
            <p>
              {answer.used.length > 0 ? (
                <>
                  🎉 Bạn đã dùng <b>{answer.used.length}</b> từ của bài:{" "}
                  {answer.used.map((id) => (
                    <span key={id} className="mr-1 inline-block rounded bg-ok-soft px-1.5 font-semibold text-ok">
                      {byId.get(id)?.en}
                    </span>
                  ))}
                </>
              ) : (
                "Chưa thấy từ nào của bài. Thử nói lại và dùng 1–2 từ gợi ý ở trên nhé."
              )}
            </p>
            <div className="rounded-lg bg-surface-2 p-3">
              <div className="mb-1 flex items-center gap-2">
                <SpeakButton text={q.sample} size="sm" />
                <span className="text-xs font-bold uppercase tracking-wide text-muted">Câu trả lời mẫu</span>
              </div>
              <p>{q.sample}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
