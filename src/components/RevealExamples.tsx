"use client";

import { useState } from "react";
import { SpeakCheck } from "./SpeakCheck";

/** Reverse-translation speaking drill: Vietnamese shown, learner says it in English and gets scored. */
export function RevealExamples({ examples, source }: { examples: { en: string; vi: string }[]; source: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Đọc câu tiếng Việt, bấm 🎤 và nói bằng tiếng Anh. Máy sẽ chấm và hiện đáp án.
        </p>
        <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={() => setOpen((o) => !o)}>
          {open ? "Che đáp án" : "Hiện đáp án"}
        </button>
      </div>
      <ol className="space-y-2">
        {examples.map((ex) => (
          <li key={ex.en}>
            <SpeakCheck key={String(open)} target={ex.en} vi={ex.vi} source={source} hideTarget={!open} />
          </li>
        ))}
      </ol>
    </div>
  );
}
