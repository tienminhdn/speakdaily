import Link from "next/link";
import { notFound } from "next/navigation";
import { dayOfPron, getPron, pronunciation } from "@/data";
import { LevelBadge, PageHeader, SectionTitle } from "@/components/ui";
import { ListenChoose } from "@/components/ListenChoose";
import { Recorder } from "@/components/Recorder";
import { SpeakButton } from "@/components/SpeakButton";
import { SpeakCheck } from "@/components/SpeakCheck";
import { MarkDone } from "@/components/MarkDone";

// Static export: only the slugs listed below exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return pronunciation.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/phat-am/[slug]">) {
  const { slug } = await props.params;
  return { title: getPron(slug)?.title ?? "Phát âm" };
}

export default async function PronPage(props: PageProps<"/phat-am/[slug]">) {
  const { slug } = await props.params;
  const p = getPron(slug);
  if (!p) notFound();
  const day = dayOfPron(slug);
  const idx = pronunciation.indexOf(p);
  const next = pronunciation[idx + 1];

  return (
    <>
      <PageHeader
        eyebrow={`${p.icon} ${p.titleEn}`}
        title={p.title}
        back={{ href: "/phat-am", label: "Tất cả bài phát âm" }}
      >
        <div className="mb-2 flex items-center gap-2">
          <LevelBadge level={p.level} />
          {day && (
            <Link href={`/giao-trinh/${day.slug}`} className="text-sm hover:text-brand">
              · Ngày {day.number}: {day.title}
            </Link>
          )}
        </div>
        {p.summary}
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <section className="card rise border-brand/30 bg-brand-soft p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand">Vì sao người Việt hay sai?</p>
            <p>{p.why}</p>
            <p className="mt-4 mb-1 text-xs font-bold uppercase tracking-wide text-brand">Cách luyện</p>
            <ol className="list-decimal space-y-1 pl-5">
              {p.how.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ol>
          </section>

          {p.pairs.length >= 2 && (
            <section>
              <SectionTitle n={1} title="Luyện tai" />
              <ListenChoose pairs={p.pairs} />
            </section>
          )}

          <section>
            <SectionTitle n={p.pairs.length >= 2 ? 2 : 1} title="Từ luyện tập">
              bấm 🔊, nghe, nhại theo
            </SectionTitle>
            <ul className="grid gap-2 sm:grid-cols-2">
              {p.words.map((w) => (
                <li key={w.en} className="card flex items-center gap-3 p-3">
                  <SpeakButton text={w.en} />
                  <div className="min-w-0">
                    <p className="font-semibold">{w.en}</p>
                    <p className="text-sm text-muted">{w.hint}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle n={p.pairs.length >= 2 ? 3 : 2} title="Shadowing">
              nghe mẫu → nói theo → máy chấm → ghi âm so sánh
            </SectionTitle>
            <ul className="space-y-3">
              {p.sentences.map((s) => (
                <li key={s.en} className="space-y-2">
                  <SpeakCheck target={s.en} vi={s.vi} source={`Phát âm · ${p.title}`} />
                  <div className="pl-1">
                    <Recorder model={s.en} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="mb-2 text-sm font-bold text-muted">LỖI ĐIỂN HÌNH</p>
            <p className="text-bad line-through decoration-2">✗ {p.mistake.wrong}</p>
            <p className="mt-1 font-semibold text-ok">✓ {p.mistake.right}</p>
          </div>
          <div className="card bg-accent-soft p-5 text-sm">
            <p className="mb-1 font-bold text-accent">💡 Shadowing hiệu quả</p>
            <ol className="list-decimal space-y-0.5 pl-4">
              <li>Nghe mẫu 2 lần ở tốc độ chậm.</li>
              <li>Nói theo cùng lúc với máy (nhại).</li>
              <li>Tự nói, để máy chấm từng từ.</li>
              <li>Ghi âm, bấm &ldquo;Mẫu rồi tôi&rdquo; để so.</li>
            </ol>
          </div>
          <MarkDone kind="pron" id={p.slug} label="Đã luyện xong" />
          {next && (
            <Link href={`/phat-am/${next.slug}`} className="btn btn-ghost w-full">
              Bài tiếp: {next.title} →
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
