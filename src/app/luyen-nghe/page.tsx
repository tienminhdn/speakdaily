import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { dialogues } from "@/data";
import { LevelBadge, PageHeader } from "@/components/ui";
import { DoneTag } from "@/components/MarkDone";

export const metadata: Metadata = { title: "Luyện nghe hội thoại" };

export default function ListeningPage() {
  return (
    <>
      <PageHeader eyebrow="Luyện nghe" title="Hội thoại đời thực">
        Nghe cả đoạn bằng 2 giọng đọc, chỉnh tốc độ, ẩn transcript để luyện tai, rồi bật <b>Đóng vai</b> để tự nói phần
        của một nhân vật.
      </PageHeader>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dialogues.map((d, i) => (
          <li key={d.slug} className="rise" style={{ "--i": i } as CSSProperties}>
            <Link href={`/luyen-nghe/${d.slug}`} className="card group block h-full p-5 transition hover:border-brand">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">🎧</span>
                <LevelBadge level={d.level} />
                <DoneTag kind="dialogues" id={d.slug} />
              </div>
              <h2 className="font-bold group-hover:text-brand">{d.title}</h2>
              <p className="mt-1 text-sm text-muted">{d.situation}</p>
              <p className="mt-3 text-xs text-muted">
                {d.speakers.A} &amp; {d.speakers.B} · {d.lines.length} câu
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
