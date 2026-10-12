"use client";

import { useState } from "react";
import { speakTarget, type ChunkRef } from "@/data";
import { setChunkLearned, setManyLearned, useProgress } from "@/lib/progress";
import { SpeakButton } from "./SpeakButton";
import { SpeakCheck } from "./SpeakCheck";

type Hide = "none" | "vi" | "en";

export function ChunkList({ chunks }: { chunks: ChunkRef[] }) {
  const { learned } = useProgress();
  const [hide, setHide] = useState<Hide>("none");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [practising, setPractising] = useState<string | null>(null);
  const learnedCount = chunks.filter((c) => learned.includes(c.id)).length;

  const changeHide = (h: Hide) => {
    setHide(h);
    setRevealed(new Set());
  };
  const reveal = (id: string) => setRevealed((r) => new Set(r).add(id));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-auto text-sm text-muted">
          Đã thuộc <b className="text-ink">{learnedCount}</b>/{chunks.length}
        </span>
        {(
          [
            ["none", "Hiện tất cả"],
            ["vi", "Che tiếng Việt"],
            ["en", "Che tiếng Anh"],
          ] as [Hide, string][]
        ).map(([h, label]) => (
          <button
            key={h}
            type="button"
            onClick={() => changeHide(h)}
            className={`btn px-3 py-1.5 text-xs ${hide === h ? "btn-primary" : "btn-ghost"}`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-ghost px-3 py-1.5 text-xs"
          onClick={() => setManyLearned(chunks.map((c) => c.id))}
          disabled={learnedCount === chunks.length}
        >
          ✓ Thuộc hết
        </button>
      </div>

      {hide !== "none" && (
        <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
          Tự kiểm tra: nhìn một vế, nói to vế còn lại, rồi bấm vào phần bị che để xem đáp án.
        </p>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {chunks.map((c) => {
          const isLearned = learned.includes(c.id);
          const show = revealed.has(c.id);
          const blurEn = hide === "en" && !show;
          const blurVi = hide === "vi" && !show;
          return (
            <li key={c.id} className={`card p-4 ${isLearned ? "border-ok/40" : ""}`}>
              <div className="flex items-start gap-3">
                <SpeakButton text={c.en} />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-lg font-semibold ${blurEn ? "blurred" : ""}`}
                    onClick={() => blurEn && reveal(c.id)}
                  >
                    {c.en}
                  </p>
                  <p className={`text-muted ${blurVi ? "blurred" : ""}`} onClick={() => blurVi && reveal(c.id)}>
                    {c.vi}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPractising(practising === c.id ? null : c.id)}
                  className={`btn shrink-0 px-2.5 py-1 text-xs ${practising === c.id ? "btn-primary" : "btn-ghost"}`}
                  title="Luyện nói câu này"
                  aria-label="Luyện nói"
                >
                  🎤
                </button>
                <button
                  type="button"
                  onClick={() => setChunkLearned(c.id, !isLearned)}
                  className={`btn shrink-0 px-2.5 py-1 text-xs ${isLearned ? "btn-on" : "btn-ghost"}`}
                  aria-pressed={isLearned}
                >
                  {isLearned ? "✓ Đã thuộc" : "Thuộc"}
                </button>
              </div>
              {c.ex && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-2 p-3 text-sm">
                  <SpeakButton text={c.ex} size="sm" />
                  <div>
                    <p className={`font-medium ${blurEn ? "blurred" : ""}`} onClick={() => blurEn && reveal(c.id)}>
                      {c.ex}
                    </p>
                    <p className={`text-muted ${blurVi ? "blurred" : ""}`} onClick={() => blurVi && reveal(c.id)}>
                      {c.exVi}
                    </p>
                  </div>
                </div>
              )}
              {practising === c.id && (
                <div className="mt-3">
                  <SpeakCheck target={speakTarget(c)} vi={c.ex ? c.exVi : c.vi} source="Từ vựng" />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
