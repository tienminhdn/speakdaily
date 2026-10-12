import Link from "next/link";
import { notFound } from "next/navigation";
import { dialogues, getDialogue, lessons } from "@/data";
import { LevelBadge, PageHeader } from "@/components/ui";
import { DialoguePlayer } from "@/components/DialoguePlayer";
import { MarkDone } from "@/components/MarkDone";

export function generateStaticParams() {
  return dialogues.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: PageProps<"/luyen-nghe/[slug]">) {
  const { slug } = await props.params;
  return { title: getDialogue(slug)?.title ?? "Luyện nghe" };
}

export default async function DialoguePage(props: PageProps<"/luyen-nghe/[slug]">) {
  const { slug } = await props.params;
  const d = getDialogue(slug);
  if (!d) notFound();
  const lesson = lessons.find((l) => l.dialogue === slug);

  return (
    <>
      <PageHeader eyebrow="Luyện nghe" title={d.title} back={{ href: "/luyen-nghe", label: "Tất cả hội thoại" }}>
        <div className="mb-2">
          <LevelBadge level={d.level} />
        </div>
        {d.situation}
      </PageHeader>

      <div className="card mb-6 p-4 text-sm">
        <p className="mb-1 font-bold">Cách luyện gợi ý (5–10 phút)</p>
        <ol className="list-decimal space-y-0.5 pl-5 text-muted">
          <li>Ẩn transcript, nghe cả đoạn một lần và đoán nội dung.</li>
          <li>Hiện transcript, nghe lại và bấm 🔊 từng câu khó.</li>
          <li>Nghe từng câu rồi đọc nhại theo (shadowing).</li>
          <li>Bật Đóng vai, tự nói phần của Minh.</li>
        </ol>
      </div>

      <DialoguePlayer dialogue={d} />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <MarkDone kind="dialogues" id={d.slug} label="Đã luyện xong" />
        {lesson && (
          <Link href={`/giao-trinh/${lesson.slug}`} className="btn btn-ghost">
            Về Ngày {lesson.number}: {lesson.title}
          </Link>
        )}
      </div>
    </>
  );
}
