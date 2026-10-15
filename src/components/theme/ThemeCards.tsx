"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { THEME_STEPS, themeLevel } from "@/data/themes";
import type { ThemeLesson } from "@/data";
import { useProgress, wordState } from "@/lib/progress";
import { useNow } from "@/lib/time";
import { LevelBadge } from "../ui";
import { useThemeStats } from "./ThemeLessonView";
import { WordReview } from "./WordReview";

function Card({ t, i }: { t: ThemeLesson; i: number }) {
  const s = useThemeStats(t);
  const n = t.words.length;
  return (
    <li className="rise" style={{ "--i": i } as CSSProperties}>
      <Link href={`/chu-de/${t.slug}`} className="card group flex h-full flex-col p-5 hover:border-brand">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-accent">BÀI {t.number}</span>
          <div className="flex items-center gap-1.5">
            {s.done && (
              <span className="rounded-md bg-ok-soft px-2 py-0.5 text-xs font-bold text-ok">✓ Hoàn thành</span>
            )}
            <LevelBadge level={themeLevel(t)} />
          </div>
        </div>
        <h2 className="flex items-center gap-2 text-lg font-bold group-hover:text-brand">
          <span className="text-2xl">{t.icon}</span> {t.title}
        </h2>
        <p className="text-sm text-muted">{t.titleEn}</p>
        <p className="mt-2 text-sm">
          <span className="font-semibold">Ngữ pháp:</span> {t.grammar.title}
        </p>
        <div className="mt-auto space-y-1.5 pt-4 text-xs text-muted">
          <Bar label="Đã nhớ" value={s.remembered} total={n} />
          <Bar label="Đã dùng" value={s.used} total={n} />
          <Bar label="Bước" value={s.steps.length} total={THEME_STEPS.length} />
        </div>
      </Link>
    </li>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${(value / total) * 100}%` }} />
      </div>
      <span className="w-10 text-right tabular-nums">
        {value}/{total}
      </span>
    </div>
  );
}

export function ThemeCards({ themes }: { themes: ThemeLesson[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {themes.map((t, i) => (
        <Card key={t.slug} t={t} i={i} />
      ))}
    </ol>
  );
}

/** Summary across all 10 lessons + due-review call to action. */
export function ThemeOverview({ themes }: { themes: ThemeLesson[] }) {
  const p = useProgress();
  const now = useNow();
  const words = themes.flatMap((t) => t.words);
  const remembered = words.filter((w) => wordState(p, w.id).lvl >= 3).length;
  const used = words.filter((w) => wordState(p, w.id).used > 0).length;
  const done = themes.filter((t) => (p.themeSteps[t.slug] ?? []).includes("test")).length;
  const due = now ? words.filter((w) => p.words[w.id] && p.words[w.id].due <= now).length : 0;
  return (
    <div className="card rise mb-8 flex flex-wrap items-center gap-x-8 gap-y-4 p-5">
      <div>
        <p className="text-2xl font-bold tabular-nums">
          {done}
          <span className="text-base text-muted">/10</span>
        </p>
        <p className="text-xs text-muted">bài hoàn thành</p>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">
          {remembered}
          <span className="text-base text-muted">/{words.length}</span>
        </p>
        <p className="text-xs text-muted">từ đã nhớ</p>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{used}</p>
        <p className="text-xs text-muted">từ đã dùng khi nói</p>
      </div>
      <Link href="/chu-de/on-tu" className="btn btn-primary ml-auto">
        🃏 Ôn từ đến hạn{due ? ` (${due})` : ""}
      </Link>
    </div>
  );
}

/** Review of every due word across the 10 lessons. */
export function ThemeDueReview({ themes }: { themes: ThemeLesson[] }) {
  const p = useProgress();
  const seen = themes.flatMap((t) => t.words).filter((w) => p.words[w.id]);
  return (
    <WordReview words={seen} limit={20} emptyHint="Chưa có từ nào để ôn. Hãy học từ ở một bài trong 10 chủ đề trước." />
  );
}
