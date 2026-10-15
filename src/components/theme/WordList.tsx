"use client";

import { useState } from "react";
import { COURSE_TIER_LABEL, TIER_LABEL } from "@/data/themes";
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
export function WordList({ words: all }: { words: ThemeWord[] }) {
  const [hideVi, setHideVi] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const course = all.filter((w) => w.fromCourse);
  const chunks = all.filter((w) => !w.fromCourse);
  const [group, setGroup] = useState<"course" | "chunks">(course.length ? "course" : "chunks");
  const words = group === "course" ? course : chunks;
  const labels = group === "course" ? COURSE_TIER_LABEL : TIER_LABEL;

  return (
    <div>
      {course.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1 sm:inline-flex">
          {(
            [
              ["course", `📚 Từ vựng giáo trình (${course.length})`],
              ["chunks", `💬 Cụm từ giao tiếp (${chunks.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setGroup(id)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                group === id ? "bg-brand text-brand-ink" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {course.length === 0 && (
        <p className="mb-4 rounded-lg bg-surface-2 p-3 text-sm text-muted">
          Bài này của giáo trình không có bảng từ vựng riêng (từ chỉ có trong video), nên chỉ có phần cụm từ giao tiếp.
        </p>
      )}
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
      {([1, 2, 3] as const)
        .filter((tier) => words.some((w) => w.tier === tier))
        .map((tier) => (
          <section key={tier} className="mb-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">
              {labels[tier]} · {words.filter((w) => w.tier === tier).length} từ
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
