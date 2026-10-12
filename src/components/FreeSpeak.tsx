"use client";

import { useEffect, useRef, useState } from "react";
import { recordSpeaking } from "@/lib/progress";
import { Recorder } from "./Recorder";

/** Timed free-speaking task with a recorder for self-review. */
export function FreeSpeak({ task, seconds = 60 }: { task: string; seconds?: number }) {
  const [left, setLeft] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [done, setDone] = useState(false);

  useEffect(() => () => clearInterval(timer.current), []);

  function start() {
    clearInterval(timer.current);
    const end = Date.now() + seconds * 1000;
    setLeft(seconds);
    timer.current = setInterval(() => {
      const s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) clearInterval(timer.current);
    }, 250);
  }

  return (
    <div className="card border-accent/40 bg-accent-soft p-5">
      <p className="font-semibold">🎤 {task}</p>
      <p className="mt-2 text-sm text-muted">
        Vòng lặp: <b>Nói → Nghe lại → Sửa một lỗi → Nói lại</b>. Lỗi tìm được hãy ghi vào Sổ tay lỗi.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={start}>
          ⏱ {left === null ? `Bấm giờ ${seconds}s` : "Bấm lại"}
        </button>
        {left !== null && (
          <span className={`text-2xl font-bold tabular-nums ${left === 0 ? "text-ok" : ""}`}>
            {left === 0 ? "Hết giờ!" : `${left}s`}
          </span>
        )}
        <Recorder />
        <button
          type="button"
          className={`btn ml-auto ${done ? "btn-on" : "btn-ghost"}`}
          disabled={done}
          onClick={() => {
            setDone(true);
            recordSpeaking(true);
          }}
        >
          {done ? "✓ Đã nói" : "Tôi đã nói xong (+1 XP)"}
        </button>
      </div>
    </div>
  );
}
