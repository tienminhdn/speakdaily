import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { days, getTopic, milestones, weeks } from "@/data";
import { LevelBadge, PageHeader } from "@/components/ui";
import { LessonBadge, RoadmapGrid } from "@/components/LessonStatus";

export const metadata: Metadata = { title: "Lộ trình 30 ngày" };

export default function CoursePage() {
  return (
    <>
      <PageHeader eyebrow="Giáo trình" title="Lộ trình 30 ngày: nghe được, nói được">
        4 tuần, mỗi ngày khoảng 20 phút: <b>Ôn lại → Phát âm → Từ vựng → Mẫu câu → Luyện nghe → Luyện nói</b>. Ngày 7,
        14, 21 là ngày ôn tập. Có 5 bài kiểm tra mốc 🏁 để thấy mình tiến bộ.
      </PageHeader>

      <section className="card rise mb-10 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold">Toàn cảnh</p>
          <p className="flex flex-wrap gap-3 text-xs text-muted">
            <span>
              <span className="mr-1 inline-block h-3 w-3 rounded bg-ok align-middle" /> Đã xong
            </span>
            <span>
              <span className="mr-1 inline-block h-3 w-3 rounded border-2 border-brand align-middle" /> Hôm nay
            </span>
            <span>
              <span className="mr-1 inline-block h-3 w-3 rounded bg-accent-soft align-middle" /> Ôn tập
            </span>
            <span>🏁 Kiểm tra mốc</span>
          </p>
        </div>
        <RoadmapGrid />
      </section>

      <div className="space-y-12">
        {weeks.map((w) => (
          <section key={w.n}>
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wide text-accent">
                Tuần {w.n} · {w.focus}
              </p>
              <h2 className="text-2xl font-bold">{w.title}</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted">{w.description}</p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {days
                .filter((d) => d.week === w.n)
                .map((d, i) => {
                  const topic = d.topic ? getTopic(d.topic) : undefined;
                  const ms = milestones.find((m) => m.id === d.milestone);
                  return (
                    <li key={d.slug} className="rise" style={{ "--i": i } as CSSProperties}>
                      <Link
                        href={`/giao-trinh/${d.slug}`}
                        className={`card group flex h-full flex-col p-4 hover:border-brand ${d.kind === "review" ? "bg-accent-soft/60" : ""}`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-accent">NGÀY {d.number}</span>
                          <div className="flex items-center gap-1.5">
                            {ms && (
                              <span className="rounded-md bg-surface px-1.5 py-0.5 text-xs font-semibold">
                                🏁 {ms.name}
                              </span>
                            )}
                            <LessonBadge lesson={d} />
                            <LevelBadge level={d.level} />
                          </div>
                        </div>
                        <h3 className="flex items-center gap-2 font-bold group-hover:text-brand">
                          <span>{topic?.icon ?? "🔁"}</span> {d.title}
                        </h3>
                        <p className="mt-1 flex-1 text-sm text-muted">{d.goal}</p>
                      </Link>
                    </li>
                  );
                })}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
