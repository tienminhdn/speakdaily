import Link from "next/link";
import { notFound } from "next/navigation";
import { allChunks, getTopic, lessons, topics } from "@/data";
import { LevelBadge, PageHeader } from "@/components/ui";
import { ChunkList } from "@/components/ChunkList";

// Static export: only the slugs listed below exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(props: PageProps<"/tu-vung/[slug]">) {
  const { slug } = await props.params;
  return { title: getTopic(slug)?.title ?? "Từ vựng" };
}

export default async function TopicPage(props: PageProps<"/tu-vung/[slug]">) {
  const { slug } = await props.params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  const chunks = allChunks.filter((c) => c.topic === slug);
  const lesson = lessons.find((l) => l.topic === slug);

  return (
    <>
      <PageHeader
        eyebrow={`${topic.icon} ${topic.titleEn}`}
        title={topic.title}
        back={{ href: "/tu-vung", label: "Tất cả chủ đề" }}
      >
        <div className="mb-2">
          <LevelBadge level={topic.level} />
        </div>
        {topic.description}
      </PageHeader>
      <ChunkList chunks={chunks} />
      {lesson && (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-3 p-5">
          <p>
            Chủ đề này được học ở{" "}
            <b>
              Ngày {lesson.number}: {lesson.title}
            </b>{" "}
            trong giáo trình.
          </p>
          <Link href={`/giao-trinh/${lesson.slug}`} className="btn btn-primary">
            Học Ngày {lesson.number} →
          </Link>
        </div>
      )}
    </>
  );
}
