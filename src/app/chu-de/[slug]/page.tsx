import { notFound } from "next/navigation";
import { getTheme, themeDialogue, themeLevel, themes } from "@/data/themes";
import { LevelBadge, PageHeader } from "@/components/ui";
import { ThemeLessonView } from "@/components/theme/ThemeLessonView";

// Static export: only the slugs listed below exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return themes.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(props: PageProps<"/chu-de/[slug]">) {
  const { slug } = await props.params;
  const t = getTheme(slug);
  return { title: t ? `Bài ${t.number}: ${t.title}` : "10 Chủ đề" };
}

export default async function ThemeLessonPage(props: PageProps<"/chu-de/[slug]">) {
  const { slug } = await props.params;
  const t = getTheme(slug);
  if (!t) notFound();
  const prev = themes.find((x) => x.number === t.number - 1);
  const next = themes.find((x) => x.number === t.number + 1);

  return (
    <>
      <PageHeader
        eyebrow={`Bài ${t.number}/10 · ${t.titleEn}`}
        title={`${t.icon} ${t.title}`}
        back={{ href: "/chu-de", label: "10 Chủ đề" }}
      >
        <div className="mb-2">
          <LevelBadge level={themeLevel(t)} />
        </div>
        <p>{t.intro}</p>
        <ul className="mt-2 space-y-0.5 text-sm">
          {t.goals.map((g) => (
            <li key={g}>✓ {g}</li>
          ))}
        </ul>
      </PageHeader>
      <ThemeLessonView
        lesson={t}
        dialogue={themeDialogue(t)}
        prev={prev && { slug: prev.slug, title: prev.title }}
        next={next && { slug: next.slug, title: next.title }}
      />
    </>
  );
}
