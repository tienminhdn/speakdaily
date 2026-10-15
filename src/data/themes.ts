import { themesA } from "./themes-a";
import { themesB } from "./themes-b";
import { themesC } from "./themes-c";
import type { Dialogue, Level, ThemeLesson, ThemeWord } from "./types";

export const themes: ThemeLesson[] = [...themesA, ...themesB, ...themesC].sort((a, b) => a.number - b.number);

export const getTheme = (slug: string) => themes.find((t) => t.slug === slug);

export type ThemeWordRef = ThemeWord & { lesson: string };

export const allThemeWords: ThemeWordRef[] = themes.flatMap((t) => t.words.map((w) => ({ ...w, lesson: t.slug })));
export const themeWordById = new Map(allThemeWords.map((w) => [w.id, w]));

/** Lessons 1–4 build the basics, 5–7 everyday situations, 8–10 longer explanations. */
export function themeLevel(t: ThemeLesson): Level {
  return t.number <= 4 ? "A1" : t.number <= 7 ? "A2" : "B1";
}

export const TIER_LABEL: Record<1 | 2 | 3, string> = { 1: "Cơ bản", 2: "Mở rộng", 3: "Nâng cao" };

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
