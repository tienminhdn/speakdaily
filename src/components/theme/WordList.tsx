"use client";

import { useState } from "react";
import { TIER_LABEL } from "@/data/themes";
import type { ThemeWord } from "@/data";
import { REMEMBERED, useProgress, wordState } from "@/lib/progress";
import { SpeakButton } from "../SpeakButton";

const POS: Record<ThemeWord["pos"], string> = {
  n: "danh từ",
  v: "động từ",
  adj: "tính từ",
  adv: "trạng từ",
  phr: "cụm từ",
};

export function WordBadge({ id }: { id: string }) {
  const p = useProgress();
  const s = wordState(p, id);
  if (s.used > 0)
    return <span className="rounded-md bg-ok-soft px-1.5 py-0.5 text-[11px] font-bold text-ok">🎤 đã dùng</span>;
  if (s.lvl >= REMEMBERED)
    return <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[11px] font-bold text-brand">✓ đã nhớ</span>;
  if (s.lvl > 0)
    return <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold text-muted">{s.lvl}/5</span>;
  return null;
}

/** Step 1: browse the lesson's words by tier, each with pronunciation hint, chunk and example. */
export function WordList({ words }: { words: ThemeWord[] }) {
  const [hideVi, setHideVi] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Bấm 🔊 nghe từ, đọc to 2 lần, rồi đọc cả <b>cụm từ</b>. Nhớ cụm thì mới dùng được từ.
        </p>
        <button
          type="button"
          className={`btn px-3 py-1.5 text-xs ${hideVi ? "btn-primary" : "btn-ghost"}`}
          onClick={() => {
            setHideVi((v) => !v);
            setOpen(new Set());
          }}
        >
          {hideVi ? "Hiện nghĩa" : "Che nghĩa để tự kiểm tra"}
        </button>
      </div>
      {([1, 2, 3] as const).map((tier) => (
        <section key={tier} className="mb-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">
            {TIER_LABEL[tier]} · {words.filter((w) => w.tier === tier).length} từ
          </h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {words
              .filter((w) => w.tier === tier)
              .map((w) => {
                const blur = hideVi && !open.has(w.id);
                return (
                  <li key={w.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <SpeakButton text={w.en} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <p className="text-lg font-bold">{w.en}</p>
                          <span className="text-xs text-muted">
                            /{w.hint}/ · {POS[w.pos]}
                          </span>
                        </div>
                        <p
                          className={`text-muted ${blur ? "blurred" : ""}`}
                          onClick={() => blur && setOpen((o) => new Set(o).add(w.id))}
                        >
                          {w.vi}
                        </p>
                      </div>
                      <WordBadge id={w.id} />
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-start gap-2 rounded-lg bg-brand-soft/60 p-2">
                        <SpeakButton text={w.chunk} size="sm" />
                        <p>
                          <b>{w.chunk}</b>
                          <span className={`block text-muted ${blur ? "blurred" : ""}`}>{w.chunkVi}</span>
                        </p>
                      </div>
                      <div className="flex items-start gap-2 rounded-lg bg-surface-2 p-2">
                        <SpeakButton text={w.ex} size="sm" />
                        <p>
                          {w.ex}
                          <span className={`block text-muted ${blur ? "blurred" : ""}`}>{w.exVi}</span>
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
