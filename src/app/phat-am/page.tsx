import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { dayOfPron, pronunciation } from "@/data";
import { LevelBadge, PageHeader } from "@/components/ui";
import { DoneTag } from "@/components/MarkDone";

export const metadata: Metadata = { title: "Phát âm & shadowing" };

export default function PronunciationPage() {
  return (
    <>
      <PageHeader eyebrow="Phát âm" title="Nói rõ để người ta hiểu">
        12 điểm phát âm người Việt hay sai nhất, sắp theo mức độ ảnh hưởng. Mỗi bài có trò nghe và chọn, từ luyện tập và
        câu shadowing để bạn ghi âm rồi so với giọng mẫu.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pronunciation.map((p, i) => {
          const day = dayOfPron(p.slug);
          return (
            <Link
              key={p.slug}
              href={`/phat-am/${p.slug}`}
              className="card rise group p-5 hover:border-brand"
              style={{ "--i": i } as CSSProperties}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-3xl">{p.icon}</span>
                <div className="flex items-center gap-2">
                  <DoneTag kind="pron" id={p.slug} />
                  {day && <span className="text-xs text-muted">Ngày {day.number}</span>}
                  <LevelBadge level={p.level} />
                </div>
              </div>
              <h2 className="text-lg font-bold group-hover:text-brand">{p.title}</h2>
              <p className="text-sm text-muted">{p.titleEn}</p>
              <p className="mt-2 text-sm">{p.summary}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
