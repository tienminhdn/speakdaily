/** Detects which target words/phrases a learner actually used, tolerating inflections. */

const IRREGULAR: Record<string, string[]> = {
  be: ["am", "is", "are", "was", "were", "been", "being"],
  have: ["has", "had", "having"],
  do: ["does", "did", "done", "doing"],
  go: ["goes", "went", "gone", "going"],
  get: ["gets", "got", "gotten", "getting"],
  take: ["takes", "took", "taken", "taking"],
  make: ["makes", "made", "making"],
  grow: ["grows", "grew", "grown", "growing"],
  buy: ["buys", "bought", "buying"],
  wear: ["wears", "wore", "worn", "wearing"],
  put: ["puts", "putting"],
  come: ["comes", "came", "coming"],
  see: ["sees", "saw", "seen", "seeing"],
  find: ["finds", "found", "finding"],
  feel: ["feels", "felt", "feeling"],
  keep: ["keeps", "kept", "keeping"],
  leave: ["leaves", "left", "leaving"],
  bring: ["brings", "brought", "bringing"],
  think: ["thinks", "thought", "thinking"],
  tell: ["tells", "told", "telling"],
  say: ["says", "said", "saying"],
  give: ["gives", "gave", "given", "giving"],
  run: ["runs", "ran", "running"],
  sell: ["sells", "sold", "selling"],
  pay: ["pays", "paid", "paying"],
  eat: ["eats", "ate", "eaten", "eating"],
  fly: ["flies", "flew", "flown", "flying"],
  lose: ["loses", "lost", "losing"],
  catch: ["catches", "caught", "catching"],
  teach: ["teaches", "taught", "teaching"],
  write: ["writes", "wrote", "written", "writing"],
  speak: ["speaks", "spoke", "spoken", "speaking"],
  sleep: ["sleeps", "slept", "sleeping"],
  oversleep: ["oversleeps", "overslept", "oversleeping"],
  wake: ["wakes", "woke", "woken", "waking"],
  meet: ["meets", "met", "meeting"],
  spend: ["spends", "spent", "spending"],
  send: ["sends", "sent", "sending"],
  build: ["builds", "built", "building"],
  fall: ["falls", "fell", "fallen", "falling"],
  hold: ["holds", "held", "holding"],
  break: ["breaks", "broke", "broken", "breaking"],
  choose: ["chooses", "chose", "chosen", "choosing"],
  feed: ["feeds", "fed", "feeding"],
  drive: ["drives", "drove", "driven", "driving"],
  ride: ["rides", "rode", "ridden", "riding"],
  shine: ["shines", "shone", "shining"],
  blow: ["blows", "blew", "blown", "blowing"],
  freeze: ["freezes", "froze", "frozen", "freezing"],
  understand: ["understands", "understood", "understanding"],
  child: ["children"],
  person: ["people"],
  man: ["men"],
  woman: ["women"],
  mouse: ["mice"],
  sheep: ["sheep"],
  fish: ["fish", "fishes"],
};

/** Placeholder tokens in dictionary-style phrases ("look after sb"). */
const PLACEHOLDER = /^(sb|sth|someone|something|somebody|one's|your|my|\.\.\.|…)$/;

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function variants(token: string): string[] {
  const t = token.toLowerCase();
  const out = new Set([t, ...(IRREGULAR[t] ?? [])]);
  out
    .add(t + "s")
    .add(t + "es")
    .add(t + "ed")
    .add(t + "d")
    .add(t + "ing")
    .add(t + "'s");
  if (t.endsWith("e")) out.add(t.slice(0, -1) + "ing").add(t.slice(0, -1) + "ed");
  if (t.endsWith("y")) out.add(t.slice(0, -1) + "ies").add(t.slice(0, -1) + "ied");
  if (/[^aeiou][aeiou][bdgmnprt]$/.test(t)) out.add(t + t.slice(-1) + "ing").add(t + t.slice(-1) + "ed");
  if (t.endsWith("f")) out.add(t.slice(0, -1) + "ves");
  if (t.endsWith("fe")) out.add(t.slice(0, -2) + "ves");
  return [...out];
}

/** Builds a forgiving regex for a phrase: each word may be inflected, up to 2 extra words may sit between words. */
export function phraseRegex(phrase: string, extraForms: string[] = []): RegExp {
  const tokens = phrase
    .toLowerCase()
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !PLACEHOLDER.test(w));
  const body = tokens
    .map(
      (t) =>
        `(?:${variants(t.replace(/[^a-z'-]/g, ""))
          .map(esc)
          .join("|")})`,
    )
    .join("(?:\\s+\\S+){0,2}?\\s+");
  const extras = extraForms.filter(Boolean).map((f) => esc(f.toLowerCase()));
  const all = [body, ...extras].filter(Boolean).join("|");
  return new RegExp(`(?<![a-z])(?:${all})(?![a-z])`, "i");
}

function clean(text: string) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' -]/g, " ")
    .replace(/\s+/g, " ");
}

/** Returns the ids of the words that appear in `text`. */
export function findUsedWords<T extends { id: string; en: string; form?: string }>(text: string, words: T[]): string[] {
  const t = ` ${clean(text)} `;
  return words.filter((w) => phraseRegex(w.en, w.form ? [w.form] : []).test(t)).map((w) => w.id);
}
