import { topics as baseTopics } from "./topics";
import { patterns as basePatterns } from "./patterns";
import { dialogues as baseDialogues } from "./dialogues";
import { topics1, patterns1, dialogues1 } from "./extra-1";
import { topics2, patterns2, dialogues2 } from "./extra-2";
import { topics3, patterns3, dialogues3 } from "./extra-3";
import { pronunciation } from "./pronunciation";
import { days, lessons, levels, milestones, weeks, LEGACY_LESSON_SLUGS } from "./lessons";
import type { Chunk, Day, Level } from "./types";

export const topics = [...baseTopics, ...topics1, ...topics2, ...topics3];
export const patterns = [...basePatterns, ...patterns1, ...patterns2, ...patterns3];
export const dialogues = [...baseDialogues, ...dialogues1, ...dialogues2, ...dialogues3];

export { pronunciation, days, lessons, levels, milestones, weeks, LEGACY_LESSON_SLUGS };
export type * from "./types";

export type ChunkRef = Chunk & { id: string; topic: string; level: Level };

export const allChunks: ChunkRef[] = topics.flatMap((t) =>
  t.chunks.map((c, i) => ({ ...c, id: `${t.slug}-${i}`, topic: t.slug, level: t.level })),
);

export const chunkById = new Map(allChunks.map((c) => [c.id, c]));

export const getTopic = (slug: string) => topics.find((t) => t.slug === slug);
export const getPattern = (slug: string) => patterns.find((p) => p.slug === slug);
export const getDialogue = (slug: string) => dialogues.find((d) => d.slug === slug);
export const getPron = (slug: string) => pronunciation.find((p) => p.slug === slug);
export const getDay = (slug: string) => days.find((d) => d.slug === slug);
export const getLesson = getDay;

/** Day number that introduces a topic / pattern / dialogue, if any. */
export const dayOfTopic = (slug: string) => days.find((d) => d.topic === slug);
export const dayOfPattern = (slug: string) => days.find((d) => d.pattern === slug);
export const dayOfDialogue = (slug: string) => days.find((d) => d.dialogue === slug);
export const dayOfPron = (slug: string) => days.find((d) => d.pron === slug);

/** A speaking prompt: say `en` when shown `vi`. */
export type Prompt = { id: string; vi: string; en: string; source: string };

/** Chunks whose topic is taught on or before the given day. */
export function chunksUpTo(day: number): ChunkRef[] {
  const slugs = new Set(days.filter((d) => d.number <= day && d.topic).map((d) => d.topic!));
  return allChunks.filter((c) => slugs.has(c.topic));
}

/** Full-sentence prompts (chunk examples + pattern examples) available up to a day. */
export function promptsUpTo(day = 30): Prompt[] {
  const ds = days.filter((d) => d.number <= day);
  const topicSet = new Set(ds.map((d) => d.topic).filter(Boolean));
  const patternSet = new Set(ds.map((d) => d.pattern).filter(Boolean));
  const fromChunks = allChunks
    .filter((c) => topicSet.has(c.topic) && c.ex && c.exVi && !c.ex.includes("—"))
    .map((c) => ({ id: `ex:${c.id}`, vi: c.exVi!, en: c.ex!, source: getTopic(c.topic)!.title }));
  const fromPatterns = patterns
    .filter((p) => patternSet.has(p.slug))
    .flatMap((p) =>
      p.examples
        .filter((e) => !e.en.includes("/"))
        .map((e, i) => ({ id: `pt:${p.slug}-${i}`, vi: e.vi, en: e.en, source: p.title })),
    );
  return [...fromChunks, ...fromPatterns];
}

/** Spaced warm-up for a day: chunks from the topics of day −1, −3 and −7. */
export function warmupFor(day: Day): ChunkRef[] {
  const out: ChunkRef[] = [];
  for (const back of [1, 3, 7]) {
    const prev = [...days].reverse().find((d) => d.number <= day.number - back && d.topic);
    if (!prev) continue;
    const pool = allChunks.filter((c) => c.topic === prev.topic && !out.some((o) => o.id === c.id));
    // Pick deterministic but varying chunks so each warm-up feels different.
    for (let k = 0; k < 2 && pool.length; k++) out.push(pool.splice((day.number * 3 + k * 5) % pool.length, 1)[0]);
  }
  return out;
}

/** Text a learner should say for a chunk (examples are better for chunks with placeholders/alternatives). */
export function speakTarget(c: Chunk) {
  return /\.\.\.|\//.test(c.en) && c.ex ? c.ex.split(" — ")[0] : c.en;
}
