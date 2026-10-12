"use client";

import { useState } from "react";
import type { PronPoint } from "@/data";
import { recordSpeaking, useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";

type Round = { pair: PronPoint["pairs"][number]; answer: "a" | "b" };

function makeRounds(pairs: PronPoint["pairs"]): Round[] {
  return [...pairs, ...pairs]
    .map((pair) => ({ pair, answer: (Math.random() < 0.5 ? "a" : "b") as "a" | "b" }))
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);
}

/** Minimal-pair ear training: the voice says one of two similar words, learner picks which. */
export function ListenChoose({ pairs }: { pairs: PronPoint["pairs"] }) {
  const { rate } = useProgress();
  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [correct, setCorrect] = useState(0);

  const say = (r: Round) => speak(r.pair[r.answer], { rate: Math.min(rate, 0.85) });

  function start() {
    const rs = makeRounds(pairs);
    setRounds(rs);
    setI(0);
    setPicked(null);
    setCorrect(0);
    say(rs[0]);
  }

  function pick(side: "a" | "b") {
    if (!rounds || picked) return;
    setPicked(side);
    if (side === rounds[i].answer) setCorrect((c) => c + 1);
  }

  function next() {
    if (!rounds) return;
    if (i + 1 >= rounds.length) {
      recordSpeaking(correct / rounds.length >= 0.8);
      setI(rounds.length);
      return;
    }
    setI(i + 1);
    setPicked(null);
    say(rounds[i + 1]);
  }

  if (!rounds) {
    return (
      <div className="card p-5">
        <p className="font-semibold">🎧 Nghe & chọn</p>
        <p className="mt-1 text-sm text-muted">
          Máy đọc một trong hai từ giống nhau. Bạn chọn từ vừa nghe. Tai phân biệt được thì miệng mới nói đúng.
        </p>
        <button type="button" className="btn btn-primary mt-4" onClick={start}>
          Bắt đầu ({Math.min(8, pairs.length * 2)} lượt)
        </button>
      </div>
    );
  }

  if (i >= rounds.length) {
    return (
      <div className="card p-5 text-center">
        <p className="text-4xl">{correct / rounds.length >= 0.8 ? "👂✨" : "👂"}</p>
        <p className="mt-2 text-xl font-bold">
          {correct}/{rounds.length} lượt đúng
        </p>
        <button type="button" className="btn btn-primary mt-4" onClick={start}>
          Chơi lại
        </button>
      </div>
    );
  }

  const r = rounds[i];
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>
          Lượt {i + 1}/{rounds.length}
        </span>
        <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={() => say(r)}>
          🔊 Nghe lại
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(["a", "b"] as const).map((side) => {
          const word = r.pair[side];
          const gloss = side === "a" ? r.pair.aVi : r.pair.bVi;
          const style = !picked
            ? "border-line hover:border-brand hover:bg-brand-soft"
            : side === r.answer
              ? "border-ok bg-ok-soft text-ok"
              : side === picked
                ? "border-bad bg-bad-soft text-bad"
                : "border-line opacity-60";
          return (
            <button
              key={side}
              type="button"
              disabled={!!picked}
              onClick={() => pick(side)}
              className={`rounded-xl border-2 bg-surface p-4 text-center transition ${style}`}
            >
              <span className="block text-xl font-bold">{word}</span>
              {gloss && <span className="text-xs text-muted">{gloss}</span>}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost px-3 py-1.5 text-xs"
              onClick={() => speak(r.pair.a, { rate: 0.8 })}
            >
              🔊 {r.pair.a}
            </button>
            <button
              type="button"
              className="btn btn-ghost px-3 py-1.5 text-xs"
              onClick={() => speak(r.pair.b, { rate: 0.8 })}
            >
              🔊 {r.pair.b}
            </button>
          </div>
          <button type="button" className="btn btn-primary" onClick={next}>
            {i + 1 >= rounds.length ? "Xem kết quả" : "Tiếp →"}
          </button>
        </div>
      )}
    </div>
  );
}
