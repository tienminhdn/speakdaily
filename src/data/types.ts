export type Level = "A1" | "A2" | "B1";

export type Chunk = {
  en: string;
  vi: string;
  ex?: string;
  exVi?: string;
};

export type VocabTopic = {
  slug: string;
  icon: string;
  title: string;
  titleEn: string;
  level: Level;
  description: string;
  chunks: Chunk[];
};

export type Pattern = {
  slug: string;
  title: string;
  structure: string;
  level: Level;
  explanation: string;
  examples: { en: string; vi: string }[];
  mistakes: { wrong: string; right: string; note: string }[];
  tip: string;
};

export type DialogueLine = { s: "A" | "B"; en: string; vi: string };

export type Dialogue = {
  slug: string;
  title: string;
  level: Level;
  situation: string;
  speakers: { A: string; B: string };
  lines: DialogueLine[];
};

export type PronPoint = {
  slug: string;
  icon: string;
  title: string;
  titleEn: string;
  level: Level;
  /** One-sentence summary shown on cards. */
  summary: string;
  /** Why Vietnamese learners get this wrong. */
  why: string;
  /** Step-by-step how to produce / practise the sound. */
  how: string[];
  /** Contrast pairs for the "listen and choose" game (may be empty). */
  pairs: { a: string; b: string; aVi?: string; bVi?: string }[];
  /** Practice words with a simple Vietnamese-friendly pronunciation hint. */
  words: { en: string; hint: string }[];
  /** Shadowing sentences. */
  sentences: { en: string; vi: string }[];
  mistake: { wrong: string; right: string };
};

export type MilestoneId = "m0" | "m1" | "m2" | "m3" | "m4";

export type Day = {
  slug: string;
  number: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  level: Level;
  goal: string;
  kind: "learn" | "review";
  topic?: string;
  pattern?: string;
  dialogue?: string;
  pron?: string;
  /** Speaking task at the end of the day. */
  task: string;
  /** "Use it for real today" challenge. */
  challenge: string;
  milestone?: MilestoneId;
};

/** @deprecated kept as alias while pages migrate to the 30-day roadmap */
export type Lesson = Day;

/* ---------- "10 Chủ đề" programme ---------- */

export type ThemeWord = {
  /** Unique id, e.g. "family-cousin". */
  id: string;
  en: string;
  vi: string;
  pos: "n" | "v" | "adj" | "adv" | "phr";
  /** 1 = cơ bản, 2 = mở rộng, 3 = nâng cao (still useful in conversation). */
  tier: 1 | 2 | 3;
  /** Short Vietnamese-friendly pronunciation hint, e.g. "KAZ-ừn". */
  hint: string;
  /** A natural collocation / chunk using the word. */
  chunk: string;
  chunkVi: string;
  ex: string;
  exVi: string;
  /** The exact form of the word as it appears in `ex` (for fill-in-the-blank). */
  form: string;
};

export type ThemeLesson = {
  slug: string;
  number: number;
  icon: string;
  title: string;
  titleEn: string;
  /** 1–2 sentences: what you can talk about after this lesson. */
  intro: string;
  /** 3 can-do goals. */
  goals: string[];
  words: ThemeWord[];
  grammar: {
    title: string;
    structure: string;
    explain: string;
    examples: { en: string; vi: string }[];
    mistakes: { wrong: string; right: string; note: string }[];
  };
  /** Vietnamese → English speaking drills mixing the lesson's words and grammar. */
  drills: { vi: string; en: string }[];
  /** Personal questions; `targets` are word ids the learner should try to use. */
  talk: { q: string; qVi: string; sample: string; targets: string[] }[];
  dialogue: {
    title: string;
    situation: string;
    speakers: { A: string; B: string };
    lines: DialogueLine[];
  };
};
