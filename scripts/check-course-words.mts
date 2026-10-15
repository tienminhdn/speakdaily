// Validates a course-word file. Usage: npx tsx scripts/check-course-words.mts <slug> word1,word2,...
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ThemeWord } from "../src/data/types.ts";
import { themesA } from "../src/data/themes-a.ts";
import { themesB } from "../src/data/themes-b.ts";
import { themesC } from "../src/data/themes-c.ts";

const [slug, list] = process.argv.slice(2);
const expected = (list ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const mod = await import(pathToFileURL(path.resolve(`src/data/course-words/${slug}.ts`)).href);
const words: ThemeWord[] = mod.default ?? Object.values(mod)[0];
const lesson = [...themesA, ...themesB, ...themesC].find((l) => l.slug === slug)!;
const existing = new Set(lesson.words.map((w) => w.id));
let errors = 0;
const err = (m: string) => { errors++; console.log("✗", m); };
const ids = new Set<string>();
for (const w of words) {
  if (ids.has(w.id) || existing.has(w.id)) err(`duplicate id ${w.id}`);
  ids.add(w.id);
  if (!w.id.startsWith(`${slug}-`)) err(`${w.id}: must start with ${slug}-`);
  if (!w.fromCourse) err(`${w.id}: fromCourse must be true`);
  for (const k of ["en", "vi", "hint", "chunk", "chunkVi", "ex", "exVi", "form"] as const) if (!w[k]?.trim()) err(`${w.id}: empty ${k}`);
  if (!new RegExp(`\\b${w.form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(w.ex)) err(`${w.id}: form "${w.form}" not in ex`);
  if (w.ex.split(/\s+/).length > 14) err(`${w.id}: ex too long`);
}
const got = words.map((w) => w.en.toLowerCase());
for (const e of expected) if (!got.includes(e)) err(`missing word "${e}"`);
for (const g of got) if (!expected.includes(g)) err(`unexpected word "${g}"`);
console.log(errors ? `${errors} problem(s)` : `OK – ${words.length} course words for ${slug}`);
process.exit(errors ? 1 : 0);
