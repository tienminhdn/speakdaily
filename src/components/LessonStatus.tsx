"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { days, getTopic, type Day } from "@/data";
import { useProgress, type Progress } from "@/lib/progress";

const TOPIC_PASS = 0.75; // a topic counts as done once 75% of its chunks are learned

type Step = { key: string; ok: boolean; href: string; label: string; detail: string };

export function daySteps(
  day: Day,
  p: Progress,
  labels?: { topic?: string; pattern?: string; dialogue?: string; pron?: string },
): Step[] {
  const steps: Step[] = [];
  if (day.pron)
    steps.push({
      key: "pron",
      ok: p.pron.includes(day.pron),
      href: `/phat-am/${day.pron}`,
      label: "Phát âm",
      detail: labels?.pron ?? "",
    });
  if (day.topic) {
    const size = getTopic(day.topic)?.chunks.length ?? 8;
    const learned = p.learned.filter((id) => id.startsWith(`${day.topic}-`)).length;
    steps.push({
      key: "vocab",
      ok: learned >= Math.ceil(size * TOPIC_PASS),
      href: `/tu-vung/${day.topic}`,
      label: "Từ vựng",
      detail: `${labels?.topic ?? ""} · ${learned}/${size} cụm`,
    });
  }
  if (day.pattern)
    steps.push({
      key: "pattern",
      ok: p.patterns.includes(day.pattern),
      href: `/mau-cau/${day.pattern}`,
      label: "Mẫu câu",
      detail: labels?.pattern ?? "",
    });
  if (day.dialogue)
    steps.push({
      key: "dialogue",
      ok: p.dialogues.includes(day.dialogue),
      href: `/luyen-nghe/${day.dialogue}`,
      label: "Luyện nghe",
      detail: labels?.dialogue ?? "",
    });
  if (day.milestone)
    steps.push({
      key: "milestone",
      ok: (p.milestones[day.milestone]?.length ?? 0) > 0,
      href: "#kiem-tra",
      label: "Kiểm tra mốc",
      detail: "Làm bài kiểm tra ở cuối trang",
    });
  return steps;
}

export function LessonChecklist({
  lesson,
  labels,
}: {
  lesson: Day;
  labels: { topic?: string; pattern?: string; dialogue?: string; pron?: string };
}) {
  const p = useProgress();
  const items = daySteps(lesson, p, labels);
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.key}>
          <Link href={it.href} className="card flex items-center gap-3 p-3 hover:border-brand">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${
                it.ok ? "bg-ok text-white" : "border-2 border-line text-muted"
              }`}
            >
              {it.ok ? "✓" : ""}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{it.label}</p>
              <p className="truncate text-sm text-muted">{it.detail}</p>
            </div>
            <span className="ml-auto text-muted">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function LessonBadge({ lesson }: { lesson: Day }) {
  const p = useProgress();
  if (p.lessons.includes(lesson.slug))
    return <span className="rounded-md bg-ok-soft px-2 py-0.5 text-xs font-bold text-ok">✓ Xong</span>;
  const steps = daySteps(lesson, p);
  const n = steps.filter((s) => s.ok).length;
  if (n === 0) return null;
  return (
    <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">
      {n}/{steps.length}
    </span>
  );
}

/** 30 small tiles showing the whole roadmap at a glance. */
export function RoadmapGrid() {
  const p = useProgress();
  const next = days.find((d) => !p.lessons.includes(d.slug));
  return (
    <ol className="grid grid-cols-6 gap-2 sm:grid-cols-10 lg:grid-cols-15">
      {days.map((d, i) => {
        const done = p.lessons.includes(d.slug);
        const isNext = next?.slug === d.slug;
        return (
          <li key={d.slug} className="rise" style={{ "--i": i * 0.4 } as CSSProperties}>
            <Link
              href={`/giao-trinh/${d.slug}`}
              title={`Ngày ${d.number}: ${d.title}`}
              className={`relative grid aspect-square place-items-center rounded-xl border text-sm font-bold transition hover:-translate-y-0.5 hover:border-brand ${
                done
                  ? "border-transparent bg-ok text-white"
                  : isNext
                    ? "border-brand bg-brand-soft text-brand ring-2 ring-brand/40"
                    : d.kind === "review"
                      ? "border-line bg-accent-soft text-accent"
                      : "border-line bg-surface"
              }`}
            >
              {d.number}
              {d.milestone && <span className="absolute -top-1.5 -right-1.5 text-xs">🏁</span>}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
