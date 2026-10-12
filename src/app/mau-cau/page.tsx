import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { patterns } from "@/data";
import { LevelBadge, PageHeader } from "@/components/ui";
import { DoneTag } from "@/components/MarkDone";

export const metadata: Metadata = { title: "Mẫu câu giao tiếp" };

export default function PatternsPage() {
  return (
    <>
      <PageHeader eyebrow="Mẫu câu" title="Ngữ pháp vừa đủ để nói">
        Không học thuộc quy tắc. Mỗi mẫu câu là một khung để bạn thay từ vào và nói được ngay. Có kèm các lỗi người Việt
        hay mắc.
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {patterns.map((p, i) => (
          <Link
            key={p.slug}
            href={`/mau-cau/${p.slug}`}
            className="card rise group flex gap-4 p-5 hover:border-brand"
            style={{ "--i": i } as CSSProperties}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 font-bold text-muted">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="font-bold group-hover:text-brand">{p.title}</h2>
                <LevelBadge level={p.level} />
                <DoneTag kind="patterns" id={p.slug} />
              </div>
              <p className="font-mono text-sm text-brand">{p.structure}</p>
              <p className="mt-1 text-sm text-muted">&ldquo;{p.examples[0].en}&rdquo;</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
