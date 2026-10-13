"use client";

import { useEffect, useRef, useState } from "react";
import type { Dialogue } from "@/data";
import { addMistake, markGoodAttempt, recordSpeaking, setSetting, useProgress } from "@/lib/progress";
import { isHardError, listen, recognitionSupported } from "@/lib/recognition";
import { bestAttempt, MISS, PASS, type ScoreResult } from "@/lib/score";
import { speak, stopSpeech } from "@/lib/speech";
import { MarkedSentence, ScoreBadge, useRecognitionProblem } from "./SpeakCheck";

type Role = "none" | "A" | "B";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DialoguePlayer({ dialogue }: { dialogue: Dialogue }) {
  const { rate } = useProgress();
  const problem = useRecognitionProblem();
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showEn, setShowEn] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const [role, setRole] = useState<Role>("none");
  const [peek, setPeek] = useState<Set<number>>(new Set());
  const runRef = useRef(0);
  const [scores, setScores] = useState<Record<number, ScoreResult>>({});
  const [interim, setInterim] = useState("");
  const listening = useRef<ReturnType<typeof listen> | null>(null);

  useEffect(
    () => () => {
      runRef.current++;
      stopSpeech();
      listening.current?.abort();
    },
    [],
  );

  async function playFrom(start: number) {
    const run = ++runRef.current;
    setPlaying(true);
    for (let i = start; i < dialogue.lines.length; i++) {
      if (runRef.current !== run) return;
      setCurrent(i);
      const line = dialogue.lines[i];
      if (line.s === role && recognitionSupported()) {
        // Learner's turn: listen and score what they say.
        setInterim("");
        listening.current = listen({ maxMs: line.en.split(" ").length * 800 + 4000, onInterim: setInterim });
        const { alternatives, error } = await listening.current.promise;
        listening.current = null;
        if (runRef.current !== run) return;
        if (isHardError(error)) {
          // Scoring unavailable on this browser: just give time to say the line.
          await wait(line.en.split(" ").length * 500 + 1800);
          continue;
        }
        const r = bestAttempt(line.en, alternatives);
        setScores((sc) => ({ ...sc, [i]: r }));
        recordSpeaking(r.score >= PASS, r.score);
        if (r.score >= PASS) markGoodAttempt(line.en);
        else if (r.score < MISS)
          addMistake({ en: line.en, vi: line.vi, said: r.said, source: `Hội thoại · ${dialogue.title}` });
      } else if (line.s === role) {
        // No recognition: leave time to say the line out loud.
        await wait(line.en.split(" ").length * 500 + 1800);
      } else {
        await speak(line.en, { rate, voice: line.s === "A" ? 0 : 1 });
      }
      if (runRef.current !== run) return;
      await wait(400);
    }
    setPlaying(false);
    setCurrent(null);
  }

  function stop() {
    runRef.current++;
    stopSpeech();
    listening.current?.abort();
    setPlaying(false);
    setCurrent(null);
  }

  function chooseRole(r: Role) {
    stop();
    setRole(r);
    setPeek(new Set());
    setScores({});
  }

  return (
    <div>
      <div className="card mb-4 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {playing ? (
            <button type="button" className="btn btn-primary" onClick={stop}>
              ■ Dừng
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => playFrom(0)}>
              ▶ Nghe cả đoạn
            </button>
          )}
          <button
            type="button"
            className={`btn ${showEn ? "btn-ghost" : "btn-on"}`}
            onClick={() => setShowEn((v) => !v)}
          >
            {showEn ? "Ẩn transcript" : "Hiện transcript"}
          </button>
          <button
            type="button"
            className={`btn ${showVi ? "btn-ghost" : "btn-on"}`}
            onClick={() => setShowVi((v) => !v)}
          >
            {showVi ? "Ẩn tiếng Việt" : "Hiện tiếng Việt"}
          </button>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted">
            Tốc độ
            <select
              className="rounded-md border border-line bg-surface px-2 py-1 text-ink"
              value={rate}
              onChange={(e) => setSetting({ rate: Number(e.target.value) })}
            >
              <option value={0.6}>0.6× (rất chậm)</option>
              <option value={0.75}>0.75×</option>
              <option value={0.9}>0.9×</option>
              <option value={1}>1× (tự nhiên)</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">🎭 Đóng vai:</span>
          {(["none", "A", "B"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => chooseRole(r)}
              className={`btn px-3 py-1.5 text-xs ${role === r ? "btn-primary" : "btn-ghost"}`}
            >
              {r === "none" ? "Tắt" : `Tôi là ${dialogue.speakers[r]}`}
            </button>
          ))}
        </div>
        {role !== "none" && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            Câu của bạn sẽ bị che. Khi đến lượt, hãy <b>nói to</b> câu đó bằng tiếng Anh. Máy nghe và chấm (trên
            Chrome/Edge), rồi đọc tiếp phần của {dialogue.speakers[role === "A" ? "B" : "A"]}.
          </p>
        )}
        {role !== "none" && problem && (
          <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
            ⚠️ {problem} Máy sẽ chờ bạn nói rồi đọc tiếp, nhưng không chấm điểm.
          </p>
        )}
      </div>

      <ol className="space-y-2">
        {dialogue.lines.map((line, i) => {
          const mine = role === line.s;
          const hiddenEn = (mine && !peek.has(i)) || !showEn;
          const active = current === i;
          return (
            <li
              key={i}
              className={`flex gap-3 rounded-xl border p-3 transition ${
                active ? "border-brand bg-brand-soft" : "border-line bg-surface"
              } ${line.s === "B" ? "sm:ml-12" : "sm:mr-12"}`}
            >
              <span
                className={`mt-0.5 h-fit shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                  line.s === "A" ? "bg-accent-soft text-accent" : "bg-violet-soft text-violet"
                }`}
              >
                {dialogue.speakers[line.s]}
              </span>
              <div className="min-w-0 flex-1">
                {mine && active && (
                  <p className="mb-1 text-xs font-bold text-accent">
                    🎤 Lượt của bạn, nói to nào!{" "}
                    {interim && <span className="font-normal text-muted">“{interim}”</span>}
                  </p>
                )}
                {mine && scores[i] ? (
                  <div className="space-y-1">
                    <MarkedSentence result={scores[i]} />
                    <ScoreBadge score={scores[i].score} />
                  </div>
                ) : (
                  <p
                    className={`font-medium ${hiddenEn ? "blurred" : ""}`}
                    onClick={() => hiddenEn && setPeek((s) => new Set(s).add(i))}
                    title={hiddenEn ? "Bấm để xem" : undefined}
                  >
                    {line.en}
                  </p>
                )}
                {(showVi || mine) && <p className="text-sm text-muted">{line.vi}</p>}
              </div>
              <button
                type="button"
                className="h-fit shrink-0 text-sm text-muted hover:text-brand"
                onClick={() => {
                  stop();
                  speak(line.en, { rate, voice: line.s === "A" ? 0 : 1 });
                }}
                aria-label="Nghe câu này"
                title="Nghe câu này"
              >
                🔊
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
