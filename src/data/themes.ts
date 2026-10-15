import { themesA } from "./themes-a";
import { themesB } from "./themes-b";
import { themesC } from "./themes-c";
import family from "./course-words/family";
import school from "./course-words/school";
import shopping from "./course-words/shopping";
import travel from "./course-words/travel";
import weather from "./course-words/weather";
import clothing from "./course-words/clothing";
import animals from "./course-words/animals";
import emotions from "./course-words/emotions";
import headwords from "./course-words/headwords";
import type { Dialogue, Level, ThemeLesson, ThemeWord } from "./types";

/** Course vocabulary per lesson (Bài 3 and 4 have no vocabulary table in the course). */
const courseWords: Record<string, ThemeWord[]> = {
  family,
  school,
  shopping,
  travel,
  weather,
  clothing,
  animals,
  emotions,
};

const TIER_ORDER = (w: ThemeWord) => (w.fromCourse ? 0 : 10) + w.tier;

export const themes: ThemeLesson[] = [...themesA, ...themesB, ...themesC]
  .map((t) => ({
    ...t,
    words: [...t.words, ...(courseWords[t.slug] ?? []), ...(headwords[t.slug] ?? [])].sort(
      (a, b) => TIER_ORDER(a) - TIER_ORDER(b),
    ),
  }))
  .sort((a, b) => a.number - b.number);

export const getTheme = (slug: string) => themes.find((t) => t.slug === slug);

export type ThemeWordRef = ThemeWord & { lesson: string };

export const allThemeWords: ThemeWordRef[] = themes.flatMap((t) => t.words.map((w) => ({ ...w, lesson: t.slug })));
export const themeWordById = new Map(allThemeWords.map((w) => [w.id, w]));

/** Lessons 1–4 build the basics, 5–7 everyday situations, 8–10 longer explanations. */
export function themeLevel(t: ThemeLesson): Level {
  return t.number <= 4 ? "A1" : t.number <= 7 ? "A2" : "B1";
}

export const TIER_LABEL: Record<1 | 2 | 3, string> = { 1: "Cơ bản", 2: "Mở rộng", 3: "Nâng cao" };
/** The course's own level names for its vocabulary table. */
export const COURSE_TIER_LABEL: Record<1 | 2 | 3, string> = { 1: "Cơ bản", 2: "Trung cấp", 3: "Nâng cao" };

export type WordSet = "course" | "chunks" | "all";
export const WORD_SETS: { id: WordSet; label: string }[] = [
  { id: "course", label: "📚 Từ vựng giáo trình" },
  { id: "chunks", label: "💬 Cụm từ giao tiếp" },
  { id: "all", label: "Tất cả" },
];

export function wordsOf(t: ThemeLesson, set: WordSet): ThemeWord[] {
  if (set === "course") return t.words.filter((w) => w.fromCourse);
  if (set === "chunks") return t.words.filter((w) => !w.fromCourse);
  return t.words;
}

export const totalThemeWords = () => themes.reduce((n, t) => n + t.words.length, 0);

/** Adapts a lesson's dialogue to the shared DialoguePlayer shape. */
export function themeDialogue(t: ThemeLesson): Dialogue {
  return {
    slug: `chu-de-${t.slug}`,
    title: t.dialogue.title,
    level: themeLevel(t),
    situation: t.dialogue.situation,
    speakers: t.dialogue.speakers,
    lines: t.dialogue.lines,
  };
}

/** Steps of every lesson, in order. */
export const THEME_STEPS = [
  { id: "learn", label: "Học từ", icon: "📖" },
  { id: "memorize", label: "Ghi nhớ", icon: "🧠" },
  { id: "listen", label: "Nghe", icon: "🎧" },
  { id: "use", label: "Dùng từ", icon: "✍️" },
  { id: "grammar", label: "Ngữ pháp", icon: "🔧" },
  { id: "talk", label: "Nói về bạn", icon: "🎤" },
  { id: "test", label: "Kiểm tra", icon: "🏁" },
] as const;

export type ThemeStepId = (typeof THEME_STEPS)[number]["id"];
