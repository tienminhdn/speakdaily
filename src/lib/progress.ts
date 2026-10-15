"use client";

import { useSyncExternalStore } from "react";
import { LEGACY_LESSON_SLUGS } from "@/data/lessons";
import { track } from "./analytics";

export type SrsCard = { box: number; due: number };

export type Mistake = {
  /** The correct English sentence. */
  en: string;
  vi?: string;
  /** What the learner actually said (speech recognition) or wrote. */
  said?: string;
  note?: string;
  source: string;
  /** Times it went wrong. */
  count: number;
  /** Consecutive good attempts since the last miss; 2+ counts as fixed. */
  streak: number;
  at: number;
};

export type MilestoneResult = { at: number; listening: number; speaking: number; self: number };

export type Progress = {
  learned: string[];
  patterns: string[];
  pron: string[];
  dialogues: string[];
  lessons: string[];
  srs: Record<string, SrsCard>;
  quiz: { at: number; score: number; total: number }[];
  /** XP earned per local date (yyyy-mm-dd). */
  activity: Record<string, number>;
  dailyGoal: number;
  rate: number;
  mistakes: Record<string, Mistake>;
  milestones: Record<string, MilestoneResult[]>;
  /** Number of speaking attempts per local date, for stats. */
  speaking: Record<string, number>;
  /** "10 Chủ đề": per-word memory state, keyed by ThemeWord.id. */
  words: Record<string, WordState>;
  /** "10 Chủ đề": completed step ids per lesson slug. */
  themeSteps: Record<string, string[]>;
  /** "10 Chủ đề": best end-of-lesson test score (0–1) per lesson slug. */
  themeTests: Record<string, number>;
};

/** lvl 0–5 (≥ 3 counts as "remembered"); `used` = times the learner used the word in their own speech. */
export type WordState = { lvl: number; due: number; used: number };

const KEY = "engdaily-progress-v1";

export const EMPTY: Progress = {
  learned: [],
  patterns: [],
  pron: [],
  dialogues: [],
  lessons: [],
  srs: {},
  quiz: [],
  activity: {},
  dailyGoal: 20,
  rate: 0.9,
  mistakes: {},
  milestones: {},
  speaking: {},
  words: {},
  themeSteps: {},
  themeTests: {},
};

export const XP = {
  chunk: 1,
  pattern: 3,
  dialogue: 3,
  lesson: 5,
  quizCorrect: 1,
  review: 1,
  speak: 1,
  milestone: 10,
  wordUsed: 2,
  themeStep: 3,
  themeTest: 10,
};

/** Days until the next review for each word level (0–5). */
export const WORD_DAYS = [0, 1, 2, 4, 8, 16];
export const REMEMBERED = 3;

export const FIXED_STREAK = 2;

/** Leitner box intervals in days, indexed by box (1–5). */
export const BOX_DAYS = [0, 1, 2, 4, 7, 15];
const DAY = 86_400_000;

let state: Progress | null = null;
const listeners = new Set<() => void>();

function load(): Progress {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? migrate({ ...EMPTY, ...JSON.parse(raw) }) : EMPTY;
  } catch {
    state = EMPTY;
  }
  return state!;
}

/** Upgrades progress saved by the original 9-lesson course. */
function migrate(p: Progress): Progress {
  if (!p.lessons.some((s) => s.startsWith("bai-"))) return p;
  return { ...p, lessons: [...new Set(p.lessons.map((s) => LEGACY_LESSON_SLUGS[s] ?? s))] };
}

function save(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode); progress stays in memory for this session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export function dateKey(t: number) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function withXp(p: Progress, xp: number): Progress {
  if (xp === 0) return p;
  const k = dateKey(Date.now());
  return { ...p, activity: { ...p.activity, [k]: (p.activity[k] ?? 0) + xp } };
}

function toggle(list: string[], id: string, on: boolean) {
  return on ? (list.includes(id) ? list : [...list, id]) : list.filter((x) => x !== id);
}

export function setChunkLearned(id: string, on: boolean) {
  const p = load();
  if (p.learned.includes(id) === on) return;
  const srs = { ...p.srs };
  if (on && !srs[id]) srs[id] = { box: 1, due: Date.now() + DAY };
  if (!on) delete srs[id];
  if (on) track("chunk_learned", { topic: id.replace(/-\d+$/, "") });
  save(withXp({ ...p, learned: toggle(p.learned, id, on), srs }, on ? XP.chunk : 0));
}

export function setManyLearned(ids: string[]) {
  ids.forEach((id) => setChunkLearned(id, true));
}

export type DoneKind = "patterns" | "dialogues" | "lessons" | "pron";

export function setDone(kind: DoneKind, id: string, on: boolean) {
  const p = load();
  if (p[kind].includes(id) === on) return;
  const xp = kind === "lessons" ? XP.lesson : XP.pattern;
  if (on) {
    if (kind === "lessons") track("day_complete", { day: Number(id.replace("ngay-", "")) || 0 });
    else track("content_complete", { kind, id });
  }
  save(withXp({ ...p, [kind]: toggle(p[kind], id, on) }, on ? xp : 0));
}

/** grade: 0 = forgot, 1 = remembered, 2 = easy */
export function reviewCard(id: string, grade: 0 | 1 | 2) {
  const p = load();
  const cur = p.srs[id] ?? { box: 1, due: 0 };
  const box = grade === 0 ? 1 : Math.min(5, cur.box + grade);
  const due = grade === 0 ? Date.now() : Date.now() + BOX_DAYS[box] * DAY;
  track("flashcard_review", { grade, box });
  save(withXp({ ...p, srs: { ...p.srs, [id]: { box, due } } }, XP.review));
}

export function addToReview(ids: string[]) {
  const p = load();
  const srs = { ...p.srs };
  ids.forEach((id) => (srs[id] = { box: 1, due: Date.now() }));
  save({ ...p, srs });
}

export function recordQuiz(score: number, total: number) {
  const p = load();
  const quiz = [...p.quiz, { at: Date.now(), score, total }].slice(-50);
  track("quiz_finish", { score, total });
  save(withXp({ ...p, quiz }, score * XP.quizCorrect));
}

export function setSetting(patch: Partial<Pick<Progress, "dailyGoal" | "rate">>) {
  save({ ...load(), ...patch });
}

export function exportProgress() {
  return JSON.stringify(load(), null, 2);
}

export function importProgress(json: string) {
  const data = JSON.parse(json);
  if (typeof data !== "object" || !Array.isArray(data.learned)) throw new Error("File không hợp lệ");
  save(migrate({ ...EMPTY, ...data }));
}

export function resetProgress() {
  save(EMPTY);
}

export const mistakeKey = (en: string) =>
  en
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, "")
    .trim();

/** Records a miss (speaking score too low, wrong quiz answer, or a manual note). */
export function addMistake(m: { en: string; vi?: string; said?: string; note?: string; source: string }) {
  const p = load();
  const key = mistakeKey(m.en);
  const prev = p.mistakes[key];
  track("mistake_logged", { source: m.source.split(" · ")[0] });
  const next: Mistake = {
    ...prev,
    ...m,
    said: m.said ?? prev?.said,
    vi: m.vi ?? prev?.vi,
    count: (prev?.count ?? 0) + 1,
    streak: 0,
    at: Date.now(),
  };
  save({ ...p, mistakes: { ...p.mistakes, [key]: next } });
}

/** A good attempt on a sentence that is in the notebook moves it towards "fixed". */
export function markGoodAttempt(en: string) {
  const p = load();
  const key = mistakeKey(en);
  const prev = p.mistakes[key];
  if (!prev) return;
  save({ ...p, mistakes: { ...p.mistakes, [key]: { ...prev, streak: prev.streak + 1 } } });
}

export function removeMistake(key: string) {
  const p = load();
  const mistakes = { ...p.mistakes };
  delete mistakes[key];
  save({ ...p, mistakes });
}

export function isFixed(m: Mistake) {
  return m.streak >= FIXED_STREAK;
}

/** Counts a speaking attempt; good attempts earn XP. */
export function recordSpeaking(good: boolean, score?: number) {
  const p = load();
  track("speak_attempt", { pass: good, ...(score !== undefined && { score: Math.round(score * 100) }) });
  const k = dateKey(Date.now());
  save(withXp({ ...p, speaking: { ...p.speaking, [k]: (p.speaking[k] ?? 0) + 1 } }, good ? XP.speak : 0));
}

export function recordMilestone(id: string, r: Omit<MilestoneResult, "at">) {
  const p = load();
  const list = [...(p.milestones[id] ?? []), { ...r, at: Date.now() }].slice(-10);
  const pct = (x: number) => Math.round(x * 100);
  track("milestone_done", { id, listening: pct(r.listening), speaking: pct(r.speaking), self: pct(r.self) });
  save(withXp({ ...p, milestones: { ...p.milestones, [id]: list } }, XP.milestone));
}

/* ---------- "10 Chủ đề" ---------- */

export function wordState(p: Progress, id: string): WordState {
  return p.words[id] ?? { lvl: 0, due: 0, used: 0 };
}

/** Records a recall attempt for one or more words: correct → level up, wrong → level down. */
export function rateWords(results: { id: string; correct: boolean }[]) {
  if (!results.length) return;
  const p = load();
  const words = { ...p.words };
  let xp = 0;
  for (const { id, correct } of results) {
    const cur = words[id] ?? { lvl: 0, due: 0, used: 0 };
    const lvl = correct ? Math.min(5, cur.lvl + 1) : Math.max(0, cur.lvl - 1);
    // Wrong answers come back within the hour; right ones wait longer each level.
    const due = Date.now() + (correct ? WORD_DAYS[lvl] * DAY : 60 * 60 * 1000);
    words[id] = { ...cur, lvl, due };
    if (correct) xp += XP.review;
  }
  save(withXp({ ...p, words }, xp));
}

/** The learner used these words in their own answer: counts usage and nudges memory up. */
export function markWordsUsed(ids: string[]) {
  if (!ids.length) return;
  const p = load();
  const words = { ...p.words };
  for (const id of ids) {
    const cur = words[id] ?? { lvl: 0, due: 0, used: 0 };
    const lvl = Math.min(5, Math.max(cur.lvl, REMEMBERED - 1) + 1);
    words[id] = { lvl, used: cur.used + 1, due: Date.now() + WORD_DAYS[lvl] * DAY };
  }
  track("words_used", { count: ids.length });
  save(withXp({ ...p, words }, ids.length * XP.wordUsed));
}

export function completeThemeStep(slug: string, step: string) {
  const p = load();
  const done = p.themeSteps[slug] ?? [];
  if (done.includes(step)) return;
  track("theme_step", { lesson: slug, step });
  save(withXp({ ...p, themeSteps: { ...p.themeSteps, [slug]: [...done, step] } }, XP.themeStep));
}

export function recordThemeTest(slug: string, score: number) {
  const p = load();
  const best = Math.max(p.themeTests[slug] ?? 0, score);
  track("theme_test", { lesson: slug, score: Math.round(score * 100) });
  save(withXp({ ...p, themeTests: { ...p.themeTests, [slug]: best } }, XP.themeTest));
}
