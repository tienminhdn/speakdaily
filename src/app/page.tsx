import Link from "next/link";
import type { CSSProperties } from "react";
import { allChunks, dialogues, patterns, pronunciation, topics } from "@/data";
import { ContinueCard, DailyChunk } from "@/components/HomeWidgets";
import { HeroBanner } from "@/components/HeroBanner";
import { RoadmapGrid } from "@/components/LessonStatus";

const SECTIONS = [
  { href: "/giao-trinh", icon: "📘", title: "Giáo trình", desc: "Lộ trình 30 ngày, 4 tuần, 5 bài kiểm tra mốc" },
  { href: "/chu-de", icon: "🗃️", title: "10 Chủ đề", desc: "240 từ theo chủ đề: nhớ từ và dùng từ" },
  {
    href: "/tu-vung",
    icon: "🧩",
    title: "Từ vựng",
    desc: `${allChunks.length} cụm từ theo ${topics.length} tình huống`,
  },
  { href: "/mau-cau", icon: "🔧", title: "Mẫu câu", desc: `${patterns.length} khung câu và lỗi hay gặp` },
  { href: "/phat-am", icon: "👄", title: "Phát âm", desc: `${pronunciation.length} điểm khó, nghe & chọn, shadowing` },
  {
    href: "/luyen-nghe",
    icon: "🎧",
    title: "Luyện nghe",
    desc: `${dialogues.length} hội thoại, đóng vai có chấm điểm`,
  },
  { href: "/luyen-noi", icon: "🎤", title: "Luyện nói", desc: "Phản xạ Việt → Anh, máy chấm từng từ" },
  { href: "/on-tap", icon: "🗂️", title: "Ôn tập", desc: "Flashcard + Sổ tay lỗi" },
];

const METHOD = [
  { t: "Học cụm, không học từ", d: '"have a meeting" thay vì "meeting = cuộc họp". Nhớ cả cụm thì nói ra được ngay.' },
  { t: "80/20", d: "Chỉ học phần dùng nhiều nhất trong giao tiếp hằng ngày, bỏ ngữ pháp học thuật." },
  {
    t: "Nói → Sai → Sửa → Nói lại",
    d: "Máy nghe và tô đỏ từ bạn nói chưa khớp. Câu sai tự vào Sổ tay lỗi để luyện lại.",
  },
  { t: "Ôn đúng lúc", d: "Flashcard và Sổ tay lỗi đưa câu yếu quay lại đúng lúc bạn sắp quên." },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <HeroBanner />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rise" style={i(1)}>
          <ContinueCard />
        </div>
        <div className="rise" style={i(2)}>
          <DailyChunk />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Học & luyện</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SECTIONS.map((s, n) => (
            <SectionCard key={s.href} {...s} n={n} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">Lộ trình 30 ngày</h2>
          <Link href="/giao-trinh" className="text-sm text-brand hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="card p-5">
          <RoadmapGrid />
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="mb-6 text-2xl font-bold">Phương pháp</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD.map((m, i) => (
            <div key={m.t}>
              <p className="mb-2 text-sm font-bold text-accent">0{i + 1}</p>
              <h3 className="font-bold">{m.t}</h3>
              <p className="mt-1 text-sm text-muted">{m.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function i(n: number) {
  return { "--i": n } as CSSProperties;
}

function SectionCard({
  href,
  icon,
  title,
  desc,
  n,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  n: number;
}) {
  return (
    <Link href={href} className="card rise group p-4 hover:border-brand" style={i(n)}>
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 font-bold group-hover:text-brand">{title}</p>
      <p className="text-xs text-muted">{desc}</p>
    </Link>
  );
}
