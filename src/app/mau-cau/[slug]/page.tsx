import Link from "next/link";
import { notFound } from "next/navigation";
import { getPattern, lessons, patterns } from "@/data";
import { LevelBadge, PageHeader, SectionTitle } from "@/components/ui";
import { RevealExamples } from "@/components/RevealExamples";
import { MarkDone } from "@/components/MarkDone";

// Static export: only the slugs listed below exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return patterns.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/mau-cau/[slug]">) {
  const { slug } = await props.params;
  return { title: getPattern(slug)?.title ?? "Mẫu câu" };
}

export default async function PatternPage(props: PageProps<"/mau-cau/[slug]">) {
  const { slug } = await props.params;
  const p = getPattern(slug);
  if (!p) notFound();
  const lesson = lessons.find((l) => l.pattern === slug);

  return (
    <>
      <PageHeader eyebrow="Mẫu câu" title={p.title} back={{ href: "/mau-cau", label: "Tất cả mẫu câu" }}>
        <LevelBadge level={p.level} />
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="card border-brand/30 bg-brand-soft p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand">Công thức</p>
            <p className="font-mono text-lg font-semibold">{p.structure}</p>
            <p className="mt-3">{p.explanation}</p>
          </section>

          <section>
            <SectionTitle title="Luyện dịch ngược">Việt → Anh</SectionTitle>
            <RevealExamples examples={p.examples} source={`Mẫu câu · ${p.title}`} />
          </section>

          <section>
            <SectionTitle title="Lỗi người Việt hay mắc" />
            <ul className="space-y-3">
              {p.mistakes.map((m, i) => (
                <li key={i} className="card p-4">
                  <p className="text-bad line-through decoration-2">✗ {m.wrong}</p>
                  <p className="font-semibold text-ok">✓ {m.right}</p>
                  <p className="mt-1 text-sm text-muted">{m.note}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card bg-accent-soft p-5">
            <p className="mb-1 text-sm font-bold text-accent">💡 Mẹo</p>
            <p className="text-sm">{p.tip}</p>
          </div>
          <MarkDone kind="patterns" id={p.slug} label="Đã nắm mẫu câu" />
          {lesson && (
            <Link href={`/giao-trinh/${lesson.slug}`} className="block text-sm text-muted hover:text-brand">
              Học ở Ngày {lesson.number}: {lesson.title} →
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
