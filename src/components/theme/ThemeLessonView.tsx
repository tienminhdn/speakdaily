"use client";

import Link from "next/link";
import { useState } from "react";
import { THEME_STEPS, type ThemeStepId } from "@/data/themes";
import type { Dialogue, ThemeLesson } from "@/data";
import { completeThemeStep, recordThemeTest, REMEMBERED, useProgress, wordState } from "@/lib/progress";
import { DialoguePlayer } from "../DialoguePlayer";
import { SpeakButton } from "../SpeakButton";
import { SpeakCheck } from "../SpeakCheck";
import { Dictation } from "./Dictation";
import { MatchGame } from "./MatchGame";
import { TalkAboutYou } from "./TalkAboutYou";
import { WordList } from "./WordList";
import { WordQuiz } from "./WordQuiz";
import { WordReview } from "./WordReview";

const PASS = 0.8;

export function useThemeStats(lesson: ThemeLesson) {
  const p = useProgress();
  const remembered = lesson.words.filter((w) => wordState(p, w.id).lvl >= REMEMBERED).length;
  const used = lesson.words.filter((w) => wordState(p, w.id).used > 0).length;
  const steps = p.themeSteps[lesson.slug] ?? [];
  const best = p.themeTests[lesson.slug];
  return { remembered, used, steps, best, done: steps.includes("test") };
}

function Stat({ value, label, pct }: { value: string; label: string; pct: number }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${Math.min(100, pct * 100)}%` }} />
      </div>
    </div>
  );
}

export function ThemeLessonView({
  lesson,
  dialogue,
  prev,
  next,
}: {
  lesson: ThemeLesson;
  dialogue: Dialogue;
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}) {
  const [step, setStep] = useState<ThemeStepId>("learn");
  const [memoTab, setMemoTab] = useState<"cards" | "match" | "dictation">("cards");
  const stats = useThemeStats(lesson);
  const n = lesson.words.length;
  const idx = THEME_STEPS.findIndex((s) => s.id === step);
  const complete = (id: ThemeStepId) => completeThemeStep(lesson.slug, id);
  const goto = (id: ThemeStepId) => {
    setStep(id);
    if (typeof window !== "undefined")
      document.getElementById("lesson-steps")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={`${stats.remembered}/${n}`} label="từ đã nhớ" pct={stats.remembered / n} />
        <Stat value={`${stats.used}/${n}`} label="từ đã dùng khi nói" pct={stats.used / n} />
        <Stat
          value={`${stats.steps.length}/${THEME_STEPS.length}`}
          label="bước hoàn thành"
          pct={stats.steps.length / THEME_STEPS.length}
        />
        <Stat
          value={stats.best !== undefined ? `${Math.round(stats.best * 100)}%` : "–"}
          label={stats.done ? "kiểm tra: đạt ✓" : "điểm kiểm tra"}
          pct={stats.best ?? 0}
        />
      </div>

      <nav
        id="lesson-steps"
        className="sticky top-16 z-20 -mx-4 mb-6 scroll-mt-20 overflow-x-auto bg-shell/95 px-4 py-2 backdrop-blur"
      >
        <ol className="flex min-w-max gap-1">
          {THEME_STEPS.map((s, i) => {
            const ok = stats.steps.includes(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
                    step === s.id
                      ? "bg-brand text-brand-ink"
                      : ok
                        ? "bg-ok-soft text-ok"
                        : "bg-surface text-muted hover:text-ink"
                  }`}
                >
                  <span>{ok ? "✓" : s.icon}</span>
                  {i + 1}. {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="min-h-[50vh]">
        {step === "learn" && (
          <section>
            <WordList words={lesson.words} />
            <button type="button" className="btn btn-primary" onClick={() => (complete("learn"), goto("memorize"))}>
              Đã xem hết {n} từ → Ghi nhớ
            </button>
          </section>
        )}

        {step === "memorize" && (
          <section className="space-y-4">
            <p className="text-sm text-muted">
              Ba cách ghi nhớ bổ trợ nhau: <b>nhớ lại</b> (thẻ), <b>nhận diện nhanh</b> (ghép cặp), <b>âm ↔ chữ</b>{" "}
              (nghe & gõ). Làm xong một hoạt động bất kỳ là hoàn thành bước này. Nhớ chắc một từ thì nó sẽ quay lại thưa
              dần.
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["cards", "🃏 Thẻ ghi nhớ"],
                  ["match", "🧩 Ghép cặp"],
                  ["dictation", "✍️ Nghe & gõ"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMemoTab(id)}
                  className={`btn px-3 py-1.5 text-sm ${memoTab === id ? "btn-primary" : "btn-ghost"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {memoTab === "cards" && <WordReview words={lesson.words} onFinish={() => complete("memorize")} />}
            {memoTab === "match" && <MatchGame words={lesson.words} onFinish={() => complete("memorize")} />}
            {memoTab === "dictation" && <Dictation words={lesson.words} onFinish={() => complete("memorize")} />}
          </section>
        )}

        {step === "listen" && (
          <section className="space-y-4">
            <div className="card p-4 text-sm">
              <p className="font-semibold">🎧 {lesson.dialogue.title}</p>
              <p className="text-muted">{lesson.dialogue.situation}</p>
              <p className="mt-2 text-muted">
                Nghe tìm các từ của bài, rồi bật <b>Đóng vai Minh</b> để tự nói.
              </p>
            </div>
            <DialoguePlayer dialogue={dialogue} />
            <button type="button" className="btn btn-primary" onClick={() => (complete("listen"), goto("use"))}>
              Đã luyện xong → Dùng từ
            </button>
          </section>
        )}

        {step === "use" && (
          <section className="space-y-6">
            <WordQuiz
              words={lesson.words}
              kinds={["cloze", "chunk"]}
              count={10}
              title="✍️ Điền từ & ghép cụm"
              description="Chọn đúng từ cho câu và cụm từ. Biết từ đứng ở đâu, đi với từ nào thì mới dùng đúng được."
              onFinish={() => complete("use")}
            />
            <div>
              <h3 className="mb-2 font-bold">🎤 Dịch nói Việt → Anh</h3>
              <p className="mb-3 text-sm text-muted">
                Mỗi câu dùng từ của bài. Nói trước, máy chấm rồi mới hiện đáp án.
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {lesson.drills.map((d) => (
                  <SpeakCheck key={d.en} target={d.en} vi={d.vi} source={`10 Chủ đề · ${lesson.title}`} hideTarget />
                ))}
              </div>
            </div>
          </section>
        )}

        {step === "grammar" && (
          <section className="space-y-6">
            <div className="card border-brand/30 bg-brand-soft p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">Ngữ pháp trọng tâm</p>
              <h3 className="mt-1 text-xl font-bold">{lesson.grammar.title}</h3>
              <p className="mt-2 font-mono font-semibold">{lesson.grammar.structure}</p>
              <p className="mt-3">{lesson.grammar.explain}</p>
            </div>
            <div>
              <h3 className="mb-2 font-bold">Câu mẫu: nghe rồi nói theo</h3>
              <ul className="space-y-2">
                {lesson.grammar.examples.map((e) => (
                  <li key={e.en} className="card flex items-center gap-3 p-3">
                    <SpeakButton text={e.en} />
                    <div>
                      <p className="font-semibold">{e.en}</p>
                      <p className="text-sm text-muted">{e.vi}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-bold">Lỗi người Việt hay mắc</h3>
              <ul className="space-y-2">
                {lesson.grammar.mistakes.map((m) => (
                  <li key={m.wrong} className="card p-4">
                    <p className="text-bad line-through decoration-2">✗ {m.wrong}</p>
                    <p className="font-semibold text-ok">✓ {m.right}</p>
                    <p className="mt-1 text-sm text-muted">{m.note}</p>
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => (complete("grammar"), goto("talk"))}>
              Đã nắm → Nói về bạn
            </button>
          </section>
        )}

        {step === "talk" && (
          <section className="space-y-4">
            <p className="text-sm text-muted">
              Trả lời bằng chuyện thật của bạn: nói hoặc gõ. Trang đánh dấu từ của bài bạn đã dùng, mỗi từ dùng được +2
              XP. Trả lời ít nhất 3 câu để hoàn thành bước này.
            </p>
            <TalkAboutYou lesson={lesson} onProgress={(k) => k >= 3 && complete("talk")} />
          </section>
        )}

        {step === "test" && (
          <section className="space-y-4">
            <WordQuiz
              words={lesson.words}
              kinds={["recall", "cloze", "listen", "meaning", "chunk"]}
              count={15}
              passMark={PASS}
              title={`🏁 Kiểm tra Bài ${lesson.number}`}
              description={`15 câu trộn: nhớ từ, điền câu, nghe hiểu, ghép cụm. Đạt từ ${Math.round(PASS * 100)}% trở lên là hoàn thành bài.`}
              onFinish={(score) => {
                recordThemeTest(lesson.slug, score);
                if (score >= PASS) complete("test");
              }}
            />
          </section>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-sm">
        {idx > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={() => goto(THEME_STEPS[idx - 1].id)}>
            ← {THEME_STEPS[idx - 1].label}
          </button>
        ) : prev ? (
          <Link href={`/chu-de/${prev.slug}`} className="text-muted hover:text-brand">
            ← Bài trước: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {idx < THEME_STEPS.length - 1 ? (
          <button type="button" className="btn btn-ghost" onClick={() => goto(THEME_STEPS[idx + 1].id)}>
            {THEME_STEPS[idx + 1].label} →
          </button>
        ) : next ? (
          <Link href={`/chu-de/${next.slug}`} className="btn btn-primary">
            Bài tiếp: {next.title} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
