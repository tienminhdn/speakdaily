import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { allChunks, topics } from "@/data";
import { LevelBadge, PageHeader } from "@/components/ui";
import { TopicCount } from "@/components/MarkDone";

export const metadata: Metadata = { title: "Từ vựng theo tình huống" };

export default function VocabPage() {
  return (
    <>
      <PageHeader eyebrow="Từ vựng" title="Học cụm từ, không học từ đơn lẻ">
        {allChunks.length} cụm từ giao tiếp thông dụng nhất, chia theo {topics.length} tình huống. Mỗi cụm có phát âm,
        ví dụ và nút đánh dấu &quot;đã thuộc&quot;. Cụm đã thuộc sẽ được đưa vào phần Ôn tập.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t, i) => (
          <Link
            key={t.slug}
            href={`/tu-vung/${t.slug}`}
            className="card rise group p-5 hover:border-brand"
            style={{ "--i": i } as CSSProperties}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-3xl">{t.icon}</span>
              <LevelBadge level={t.level} />
            </div>
            <h2 className="text-lg font-bold group-hover:text-brand">{t.title}</h2>
            <p className="text-sm text-muted">{t.titleEn}</p>
            <p className="mt-2 text-sm">{t.description}</p>
            <TopicCount ids={t.chunks.map((_, i) => `${t.slug}-${i}`)} />
          </Link>
        ))}
      </div>
    </>
  );
}
