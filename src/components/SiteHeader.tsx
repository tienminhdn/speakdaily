"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dateKey, useProgress } from "@/lib/progress";
import { useNow } from "@/lib/time";

export const NAV = [
  { href: "/giao-trinh", label: "Giáo trình" },
  { href: "/tu-vung", label: "Từ vựng" },
  { href: "/mau-cau", label: "Mẫu câu" },
  { href: "/phat-am", label: "Phát âm" },
  { href: "/luyen-nghe", label: "Luyện nghe" },
  { href: "/luyen-noi", label: "Luyện nói" },
  { href: "/luyen-de", label: "Luyện đề" },
  { href: "/on-tap", label: "Ôn tập" },
  { href: "/tien-do", label: "Tiến độ" },
];

function TodayXp() {
  const p = useProgress();
  const now = useNow();
  const xp = now ? (p.activity[dateKey(now)] ?? 0) : 0;
  const pct = Math.min(100, Math.round((xp / p.dailyGoal) * 100));
  return (
    <Link
      href="/tien-do"
      title="Mục tiêu hôm nay"
      className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold"
    >
      <span>{pct >= 100 ? "🔥" : "🎯"}</span>
      <span className="tabular-nums">
        {xp}/{p.dailyGoal} XP
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-shell/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold" onClick={() => setOpen(false)}>
          <span className="text-3xl leading-none" aria-hidden="true">
            🍁
          </span>
          <span className="text-lg">
            Speak<span className="text-accent">Daily</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition ${
                isActive(n.href) ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <TodayXp />
          <button
            type="button"
            className="btn btn-ghost px-3 xl:hidden"
            aria-label="Mở menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid grid-cols-2 gap-1 border-t border-line px-4 py-3 sm:grid-cols-3 xl:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive(n.href) ? "bg-brand-soft text-brand" : "text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
