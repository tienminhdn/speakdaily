import Link from "next/link";
import { notFound } from "next/navigation";
import {
  days,
  getDay,
  getDialogue,
  getPattern,
  getPron,
  getTopic,
  promptsUpTo,
  speakTarget,
  warmupFor,
  weeks,
  type Day,
} from "@/data";
import { LevelBadge, PageHeader, SectionTitle } from "@/components/ui";
import { LessonChecklist } from "@/components/LessonStatus";
import { MarkDone } from "@/components/MarkDone";
import { SpeakButton } from "@/components/SpeakButton";
import { SpeakCheck } from "@/components/SpeakCheck";
import { FreeSpeak } from "@/components/FreeSpeak";
import { Reflex } from "@/components/Reflex";
import { MilestoneTest } from "@/components/MilestoneTest";

// Static export: only the slugs listed below exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return days.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: PageProps<"/giao-trinh/[slug]">) {
  const { slug } = await props.params;
  const d = getDay(slug);
  return { title: d ? `Ngày ${d.number}: ${d.title}` : "Giáo trình" };
}

export default async function DayPage(props: PageProps<"/giao-trinh/[slug]">) {
  const { slug } = await props.params;
  const day = getDay(slug);
  if (!day) notFound();
  const topic = day.topic ? getTopic(day.topic) : undefined;
  const pattern = day.pattern ? getPattern(day.pattern) : undefined;
  const dialogue = day.dialogue ? getDialogue(day.dialogue) : undefined;
  const pron = day.pron ? getPron(day.pron) : undefined;
  const week = weeks.find((w) => w.n === day.week)!;
  const prev = days.find((d) => d.number === day.number - 1);
  const next = days.find((d) => d.number === day.number + 1);
  const warmup = warmupFor(day);
  let n = 0;

  return (
    <>
      <PageHeader
        eyebrow={`Ngày ${day.number}/30 · Tuần ${day.week}: ${week.title}`}
        title={`${topic?.icon ?? "🔁"} ${day.title}`}
        back={{ href: "/giao-trinh", label: "Lộ trình 30 ngày" }}
      >
        <div className="mb-2">
          <LevelBadge level={day.level} />
        </div>
        <b className="text-ink">Mục tiêu:</b> {day.goal}
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          {warmup.length > 0 && (
            <section>
              <SectionTitle n={++n} title="Khởi động: ôn lại">
                cụm từ của các ngày trước, nói trước rồi xem đáp án
              </SectionTitle>
              <div className="grid gap-2 md:grid-cols-2">
                {warmup.map((c) => (
                  <SpeakCheck
                    key={c.id}
                    target={speakTarget(c)}
                    vi={c.ex ? c.exVi : c.vi}
                    source="Khởi động"
                    hideTarget
                  />
                ))}
              </div>
            </section>
          )}

          {day.kind === "review" ? <ReviewBody day={day} next={() => ++n} /> : null}

          {pron && (
            <section>
              <SectionTitle n={++n} title={`Phát âm: ${pron.title}`} />
              <div className="card p-5">
                <p>{pron.summary}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {pron.words.slice(0, 4).map((w) => (
                    <li key={w.en} className="flex items-center gap-2 rounded-lg bg-surface-2 py-1 pr-3 pl-1">
                      <SpeakButton text={w.en} size="sm" />
                      <span className="font-semibold">{w.en}</span>
                      <span className="text-xs text-muted">{w.hint}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/phat-am/${pron.slug}`} className="btn btn-ghost mt-4">
                  Luyện đầy đủ: nghe & chọn, shadowing →
                </Link>
              </div>
            </section>
          )}

          {topic && (
            <section>
              <SectionTitle n={++n} title="Từ vựng" />
              <div className="card p-5">
                <ul className="space-y-2">
                  {topic.chunks.slice(0, 3).map((c) => (
                    <li key={c.en} className="flex items-center gap-3">
                      <SpeakButton text={c.en} />
                      <div>
                        <p className="font-semibold">{c.en}</p>
                        <p className="text-sm text-muted">{c.vi}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link href={`/tu-vung/${topic.slug}`} className="btn btn-ghost mt-4">
                  Học đủ {topic.chunks.length} cụm & đánh dấu thuộc →
                </Link>
              </div>
            </section>
          )}

          {pattern && (
            <section>
              <SectionTitle n={++n} title="Khung câu của ngày" />
              <div className="card p-5">
                <p className="font-mono font-semibold text-brand">{pattern.structure}</p>
                <p className="mt-2 text-sm text-muted">{pattern.explanation}</p>
                <Link href={`/mau-cau/${pattern.slug}`} className="btn btn-ghost mt-4">
                  Xem lỗi hay gặp & luyện thêm →
                </Link>
              </div>
            </section>
          )}

          {dialogue && (
            <section>
              <SectionTitle n={++n} title="Tình huống nghe" />
              <div className="card p-5">
                <p className="font-semibold">🎧 {dialogue.title}</p>
                <p className="mt-1 text-sm text-muted">{dialogue.situation}</p>
                <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm italic">&ldquo;{dialogue.lines[0].en}&rdquo;</p>
                <Link href={`/luyen-nghe/${dialogue.slug}`} className="btn btn-ghost mt-4">
                  Nghe & đóng vai →
                </Link>
              </div>
            </section>
          )}

          {pattern && (
            <section>
              <SectionTitle n={++n} title="Luyện nói: dịch ngược">
                Việt → Anh, máy chấm từng từ
              </SectionTitle>
              <div className="space-y-2">
                {pattern.examples.slice(0, 3).map((ex) => (
                  <SpeakCheck key={ex.en} target={ex.en} vi={ex.vi} source={`Ngày ${day.number}`} hideTarget />
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionTitle n={++n} title="Nhiệm vụ nói" />
            <FreeSpeak task={day.task} seconds={day.week === 1 ? 45 : day.week === 2 ? 60 : 90} />
          </section>

          <section>
            <SectionTitle n={++n} title="Dùng thật hôm nay" />
            <div className="card p-5">
              <p>🌱 {day.challenge}</p>
            </div>
          </section>

          {day.milestone && (
            <section id="kiem-tra" className="scroll-mt-24">
              <SectionTitle n={++n} title="Kiểm tra mốc" />
              <MilestoneTest id={day.milestone} />
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="mb-2 text-sm font-bold text-muted">CÁC BƯỚC TRONG NGÀY</p>
            <LessonChecklist
              lesson={day}
              labels={{ topic: topic?.title, pattern: pattern?.title, dialogue: dialogue?.title, pron: pron?.title }}
            />
          </div>
          <MarkDone kind="lessons" id={day.slug} label={`Hoàn thành Ngày ${day.number}`} />
          <div className="flex justify-between gap-2 text-sm">
            {prev ? (
              <Link href={`/giao-trinh/${prev.slug}`} className="text-muted hover:text-brand">
                ← Ngày {prev.number}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/giao-trinh/${next.slug}`} className="text-muted hover:text-brand">
                Ngày {next.number} →
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function ReviewBody({ day, next }: { day: Day; next: () => number }) {
  const weekDays = days.filter((d) => d.number <= day.number && d.topic && (day.number >= 26 || d.week === day.week));
  const seconds = day.number >= 26 ? 3 : day.week === 1 ? 8 : 5;
  return (
    <>
      <section>
        <SectionTitle n={next()} title="Ôn lại các chủ đề" />
        <div className="grid gap-2 sm:grid-cols-2">
          {weekDays.map((d) => {
            const t = getTopic(d.topic!)!;
            return (
              <Link
                key={d.slug}
                href={`/tu-vung/${t.slug}`}
                className="card flex items-center gap-3 p-3 hover:border-brand"
              >
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-xs text-muted">Ngày {d.number}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/on-tap" className="btn btn-ghost">
            🗂️ Ôn flashcard
          </Link>
          <Link href="/on-tap/so-tay-loi" className="btn btn-ghost">
            📒 Sổ tay lỗi
          </Link>
          <Link href="/luyen-de" className="btn btn-ghost">
            📝 Luyện đề
          </Link>
        </div>
      </section>
      <section>
        <SectionTitle n={next()} title="Phản xạ">
          {seconds} giây để bắt đầu nói
        </SectionTitle>
        <Reflex pool={promptsUpTo(day.number)} defaultSeconds={seconds} defaultCount={day.number >= 26 ? 20 : 10} />
      </section>
    </>
  );
}
