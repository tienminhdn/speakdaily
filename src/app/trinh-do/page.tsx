import Link from "next/link";
import type { Metadata } from "next";
import { days, dialogues, levels, patterns, pronunciation, topics } from "@/data";
import { LevelBadge, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Trình độ A1 · A2 · B1" };

const CAN_DO: Record<string, string[]> = {
  A1: [
    "Tự giới thiệu bản thân",
    "Kể thói quen hằng ngày",
    "Gọi món, hỏi giá, thanh toán",
    "Xin nhắc lại khi không hiểu",
  ],
  A2: [
    "Hỏi đường và hiểu chỉ dẫn",
    "Mua sắm, hỏi size, trả giá",
    "Kể chuyện đã xảy ra",
    "Mô tả triệu chứng khi ốm",
    "Xoay xở ở sân bay, khách sạn",
  ],
  B1: [
    "Gọi điện, đặt lịch hẹn",
    "Rủ rê, nhận lời, từ chối khéo",
    "Nêu ý kiến, phàn nàn, họp nhóm",
    "Phỏng vấn, kể chuyện, cho lời khuyên",
  ],
};

export default function LevelsPage() {
  return (
    <>
      <PageHeader eyebrow="Trình độ" title="Bạn đang ở đâu?">
        Nội dung chia theo khung CEFR. Người mất gốc nên bắt đầu từ A1. Nếu đã nói được các câu ở cột &quot;Làm
        được&quot; thì chuyển lên cấp tiếp theo.
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        {levels.map((lv) => (
          <section key={lv.id} className="card flex flex-col p-6">
            <div className="mb-2 flex items-center gap-2">
              <LevelBadge level={lv.id} />
              <h2 className="text-xl font-bold">{lv.label}</h2>
            </div>
            <p className="text-sm text-muted">{lv.description}</p>

            <p className="mt-5 mb-2 text-xs font-bold uppercase tracking-wide text-muted">Sau cấp này bạn làm được</p>
            <ul className="space-y-1 text-sm">
              {CAN_DO[lv.id].map((c) => (
                <li key={c}>✓ {c}</li>
              ))}
            </ul>

            <Group
              title="Ngày học"
              items={days
                .filter((l) => l.level === lv.id)
                .map((l) => ({ href: `/giao-trinh/${l.slug}`, label: `Ngày ${l.number}. ${l.title}` }))}
            />
            <Group
              title="Từ vựng"
              items={topics
                .filter((t) => t.level === lv.id)
                .map((t) => ({ href: `/tu-vung/${t.slug}`, label: `${t.icon} ${t.title}` }))}
            />
            <Group
              title="Mẫu câu"
              items={patterns
                .filter((p) => p.level === lv.id)
                .map((p) => ({ href: `/mau-cau/${p.slug}`, label: p.title }))}
            />
            <Group
              title="Luyện nghe"
              items={dialogues
                .filter((d) => d.level === lv.id)
                .map((d) => ({ href: `/luyen-nghe/${d.slug}`, label: d.title }))}
            />

            <Group
              title="Phát âm"
              items={pronunciation
                .filter((p) => p.level === lv.id)
                .map((p) => ({ href: `/phat-am/${p.slug}`, label: `${p.icon} ${p.title}` }))}
            />

            <Link href={`/luyen-de?level=${lv.id}`} className="btn btn-ghost mt-6">
              Kiểm tra trình độ {lv.id} →
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}

function Group({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div className="mt-5">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">{title}</p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="text-sm hover:text-brand hover:underline">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
