// Validates "10 Chủ đề" lesson data. Usage: npx tsx scripts/check-themes.mts src/data/themes-a.ts
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ThemeLesson } from "../src/data/types.ts";

const file = process.argv[2];
if (!file) throw new Error("usage: check-themes.mts <file>");
const mod = await import(pathToFileURL(path.resolve(file)).href);
const lessons = (Object.values(mod) as unknown[]).flat().filter((x): x is ThemeLesson => !!x && typeof x === "object" && "slug" in x && "words" in x);
let errors = 0;
const err = (m: string) => { errors++; console.log("✗", m); };

for (const l of lessons) {
  const ids = new Set<string>();
  const tiers = [0, 0, 0];
  for (const w of l.words) {
    if (ids.has(w.id)) err(`${l.slug}: duplicate id ${w.id}`);
    ids.add(w.id);
    if (!w.id.startsWith(`${l.slug}-`)) err(`${l.slug}: id ${w.id} must start with "${l.slug}-"`);
    tiers[w.tier - 1]++;
    if (!new RegExp(`\\b${w.form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(w.ex))
      err(`${w.id}: form "${w.form}" not found in ex "${w.ex}"`);
    for (const k of ["en", "vi", "hint", "chunk", "chunkVi", "ex", "exVi", "form"] as const)
      if (!w[k]?.trim()) err(`${w.id}: empty ${k}`);
    if (w.ex.split(/\s+/).length > 14) err(`${w.id}: ex longer than 14 words`);
  }
  if (l.words.length < 24) err(`${l.slug}: expected at least 24 words, got ${l.words.length}`);
  if (l.goals.length !== 3) err(`${l.slug}: goals should be 3`);
  if (l.grammar.examples.length !== 5) err(`${l.slug}: grammar.examples should be 5`);
  if (l.grammar.mistakes.length !== 3) err(`${l.slug}: grammar.mistakes should be 3`);
  if (l.drills.length !== 8) err(`${l.slug}: drills should be 8`);
  if (l.talk.length !== 5) err(`${l.slug}: talk should be 5`);
  for (const t of l.talk) for (const id of t.targets) if (!ids.has(id)) err(`${l.slug}: talk target ${id} is not a word id`);
  const n = l.dialogue.lines.length;
  if (n < 8 || n > 10) err(`${l.slug}: dialogue should have 8–10 lines, got ${n}`);
  if (![l.dialogue.speakers.A, l.dialogue.speakers.B].includes("Minh")) err(`${l.slug}: Minh must be a speaker`);
  const text = l.dialogue.lines.map((x) => x.en).join(" ").toLowerCase();
  const used = l.words.filter((w) => text.includes(w.form.toLowerCase()) || text.includes(w.en.toLowerCase())).length;
  if (used < 6) err(`${l.slug}: dialogue uses only ${used} lesson words (need ≥ 6)`);
  console.log(`${l.slug}: ${l.words.length} words (${tiers.join("/")}), dialogue uses ${used} lesson words`);
}
console.log(errors ? `\n${errors} problem(s)` : `\nOK – ${lessons.length} lesson(s) valid`);
process.exit(errors ? 1 : 0);
