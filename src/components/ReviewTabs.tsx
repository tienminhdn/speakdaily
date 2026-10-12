"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isFixed, useProgress } from "@/lib/progress";
import { useNow } from "@/lib/time";

export function ReviewTabs() {
  const pathname = usePathname();
  const p = useProgress();
  const now = useNow();
  const due = now ? Object.values(p.srs).filter((c) => c.due <= now).length : 0;
  const weak = Object.values(p.mistakes).filter((m) => !isFixed(m)).length;
  const tabs = [
    { href: "/on-tap", label: "🗂️ Flashcard", badge: due },
    { href: "/on-tap/so-tay-loi", label: "📒 Sổ tay lỗi", badge: weak },
  ];
  return (
    <div className="mb-6 flex gap-1 rounded-xl border border-line bg-surface p-1 sm:inline-flex">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
            pathname === t.href ? "bg-brand text-brand-ink" : "text-muted hover:text-ink"
          }`}
        >
          {t.label}
          {t.badge > 0 && (
            <span
              className={`rounded-full px-1.5 text-xs ${pathname === t.href ? "bg-white/25" : "bg-accent-soft text-accent"}`}
            >
              {t.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
