"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { allChunks, getTopic, lessons } from "@/data";
import { dateKey, useProgress } from "@/lib/progress";
import { useNow } from "@/lib/time";
import { SpeakButton } from "./SpeakButton";
import { streak } from "./ProgressDashboard";

export function DailyChunk() {
  const now = useNow();
  if (!now) return <div className="card h-48 animate-pulse" />;
  const dayIndex = Math.floor((now - new Date(now).getTimezoneOffset() * 60_000) / 86_400_000);
  const c = allChunks[dayIndex % allChunks.length];
  const topic = getTopic(c.topic)!;
  return (
    <div className="card h-full p-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-accent">🍂 Cụm từ mỗi ngày</p>
      <div className="flex items-center gap-3">
        <SpeakButton text={c.en} />
        <p className="text-2xl font-bold">{c.en}</p>
      </div>
      <p className="mt-1 text-muted">{c.vi}</p>
      {c.ex && (
        <div className="mt-4 rounded-lg bg-surface-2 p-3 text-sm">
          <p className="font-medium">{c.ex}</p>
          <p className="text-muted">{c.exVi}</p>
        </div>
      )}
      <Link href={`/tu-vung/${c.topic}`} className="mt-4 inline-block text-sm text-brand hover:underline">
        {topic.icon} Xem cả chủ đề {topic.title} →
      </Link>
    </div>
  );
}

export function ContinueCard() {
  const p = useProgress();
  const now = useNow();
  const next = lessons.find((l) => !p.lessons.includes(l.slug));
  const xp = now ? (p.activity[dateKey(now)] ?? 0) : 0;
  const pct = Math.min(100, Math.round((xp / p.dailyGoal) * 100));
  const due = now ? Object.values(p.srs).filter((c) => c.due <= now).length : 0;

  return (
    <div className="card flex h-full flex-col overflow-hidden p-6">
      <div className="-m-6 mb-0 flex items-center gap-5 rounded-t-2xl bg-gradient-to-r from-brand-soft to-accent-soft p-6">
        <div className="xp-ring grid h-24 w-24 shrink-0 place-items-center p-2" style={{ "--p": pct } as CSSProperties}>
          <div className="grid h-full w-full place-items-center rounded-full bg-surface text-center">
            <div>
              <p className="text-xl font-bold tabular-nums">{pct}%</p>
              <p className="text-[10px] text-muted">mục tiêu</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Hôm nay</p>
          <p className="mt-1 font-semibold">
            {pct >= 100
              ? "Tuyệt vời! Bạn đã đạt mục tiêu hôm nay 🎉"
              : pct > 0
                ? "Đang tốt lắm, cố thêm chút nữa nhé!"
                : "Một chút mỗi ngày là đủ. Bắt đầu thôi!"}
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Stat value={`${xp}/${p.dailyGoal}`} label="XP" />
        <Stat value={`🔥 ${streak(p, now)}`} label="ngày liên tiếp" />
        <Stat value={String(due)} label="thẻ cần ôn" />
      </div>
      <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
        {next ? (
          <Link href={`/giao-trinh/${next.slug}`} className="btn btn-primary w-full">
            {p.lessons.length === 0 ? "Bắt đầu" : "Học tiếp"} Ngày {next.number}: {next.title} →
          </Link>
        ) : (
          <Link href="/luyen-de" className="btn btn-primary w-full">
            🎉 Đã xong giáo trình. Luyện đề tổng hợp →
          </Link>
        )}
        {due > 0 && (
          <Link href="/on-tap" className="btn btn-ghost w-full">
            Ôn {due} thẻ đến hạn
          </Link>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
