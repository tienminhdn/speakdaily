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
