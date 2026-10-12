"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { days, promptsUpTo, type Prompt } from "@/data";
import { isFixed, useProgress, type Progress } from "@/lib/progress";
import { Reflex } from "./Reflex";

type Scope = "current" | "w1" | "w2" | "w3" | "w4" | "all" | "mistakes";

const WEEK_END: Record<string, number> = { w1: 7, w2: 14, w3: 21, w4: 30 };

export function currentDay(p: Progress) {
  return days.find((d) => !p.lessons.includes(d.slug))?.number ?? 30;
}

export function mistakePrompts(p: Progress): Prompt[] {
  return Object.entries(p.mistakes)
    .filter(([, m]) => !isFixed(m))
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([key, m]) => ({ id: key, en: m.en, vi: m.vi ?? `Đọc to: ${m.en}`, source: m.source }));
}

function poolFor(scope: Scope, p: Progress): Prompt[] {
  if (scope === "mistakes") return mistakePrompts(p);
  if (scope === "current") return promptsUpTo(Math.max(1, currentDay(p)));
  if (scope === "all") return promptsUpTo(30);
  const end = WEEK_END[scope];
  const start = end - (scope === "w4" ? 9 : 7);
  const prev = new Set(promptsUpTo(start).map((x) => x.id));
  return promptsUpTo(end).filter((x) => !prev.has(x.id));
}

export function SpeakingHub() {
  const params = useSearchParams();
  const p = useProgress();
  const initial = (params.get("scope") as Scope | null) ?? "current";
  const [scope, setScope] = useState<Scope>(initial);
  const pool = poolFor(scope, p);
  const weak = mistakePrompts(p).length;

  const SCOPES: { id: Scope; label: string }[] = [
    { id: "current", label: `Đến ngày ${currentDay(p)}` },
    { id: "w1", label: "Tuần 1" },
    { id: "w2", label: "Tuần 2" },
    { id: "w3", label: "Tuần 3" },
    { id: "w4", label: "Tuần 4" },
    { id: "all", label: "Toàn khoá" },
    { id: "mistakes", label: `Câu yếu (${weak})` },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScope(s.id)}
              className={`btn px-3 py-1.5 text-sm ${scope === s.id ? "btn-primary" : "btn-ghost"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Reflex
          key={scope}
          pool={pool}
          title={scope === "mistakes" ? "Luyện lại câu yếu" : "Phản xạ Việt → Anh"}
          defaultSeconds={scope === "mistakes" ? 8 : 5}
        />
      </div>
      <aside className="space-y-4">
        <div className="card p-5 text-sm">
          <p className="mb-2 font-bold">Cách máy chấm</p>
          <ul className="space-y-1 text-muted">
            <li>
              <span className="font-semibold text-ok">≥ 80%</span>: đạt, câu yếu được tính là đã luyện tốt thêm một lần.
            </li>
            <li>
              <span className="font-semibold text-accent">60–79%</span>: gần đúng, nên nói lại.
            </li>
            <li>
              <span className="font-semibold text-bad">&lt; 60%</span>: lưu vào Sổ tay lỗi.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted">
            Máy nhận diện theo từ nên chấm cả ngữ pháp lẫn phát âm. Nói rõ từng âm cuối sẽ được điểm cao hơn.
          </p>
        </div>
        <Link href="/on-tap/so-tay-loi" className="card block p-5 hover:border-brand">
          <p className="font-bold">📒 Sổ tay lỗi</p>
          <p className="text-sm text-muted">{weak} câu đang cần luyện lại</p>
        </Link>
        <Link href="/phat-am" className="card block p-5 hover:border-brand">
          <p className="font-bold">👄 Phát âm & shadowing</p>
          <p className="text-sm text-muted">Sửa từng âm khó, ghi âm so giọng</p>
        </Link>
      </aside>
    </div>
  );
}
