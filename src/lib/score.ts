const CONTRACTIONS: [RegExp, string][] = [
  [/\bcan't\b/g, "can not"],
  [/\bcannot\b/g, "can not"],
  [/\bwon't\b/g, "will not"],
  [/\bain't\b/g, "is not"],
  [/n't\b/g, " not"],
  [/'m\b/g, " am"],
  [/'re\b/g, " are"],
  [/'ve\b/g, " have"],
  [/'ll\b/g, " will"],
  [/'d\b/g, " would"],
  [/\b(it|that|what|where|there|here|he|she|who|how|let)'s\b/g, "$1 is"],
  [/\bgonna\b/g, "going to"],
  [/\bwanna\b/g, "want to"],
  [/\bok\b/g, "okay"],
];

const NUMBERS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven",
  "8": "eight", "9": "nine", "10": "ten", "11": "eleven", "12": "twelve", "13": "thirteen", "14": "fourteen",
  "15": "fifteen", "16": "sixteen", "17": "seventeen", "18": "eighteen", "19": "nineteen", "20": "twenty",
  "30": "thirty", "40": "forty", "50": "fifty", "60": "sixty", "70": "seventy", "80": "eighty", "90": "ninety",
  "100": "one hundred",
};

/** Lower-case words with contractions expanded and digits spelled out, so "I'd like 2" ≈ "I would like two". */
export function normalizeWords(text: string): string[] {
  let s = text.toLowerCase().replace(/[’‘]/g, "'");
  s = s.replace(/(\d+):(\d\d)/g, (_, h, m) => `${h} ${m === "00" ? "" : m}`);
  s = s.replace(/%/g, " percent").replace(/\$(\d+)/g, "$1 dollars").replace(/-/g, " ");
  for (const [re, rep] of CONTRACTIONS) s = s.replace(re, rep);
  s = s.replace(/'s\b/g, "s").replace(/[^a-z0-9' ]/g, " ");
  return s
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((w) => {
      if (NUMBERS[w]) return NUMBERS[w].split(" ");
      const n = Number(w);
      if (Number.isInteger(n) && n > 20 && n < 100) return [NUMBERS[String(n - (n % 10))], NUMBERS[String(n % 10)]];
      return [w];
    });
}

export type WordMark = { word: string; ok: boolean };
export type ScoreResult = { score: number; marks: WordMark[]; said: string; extra: string[] };

/** Word-level LCS alignment of what was said against the target sentence. */
export function scoreAttempt(target: string, said: string): ScoreResult {
  const display = target.split(/\s+/).filter(Boolean);
  // Map each display word to its normalized pieces so marks line up with what the learner sees.
  const pieces = display.map((w) => normalizeWords(w));
  const t = pieces.flat();
  const owner = pieces.flatMap((p, i) => p.map(() => i));
  const s = normalizeWords(said);

  const dp = Array.from({ length: t.length + 1 }, () => new Array<number>(s.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--)
    for (let j = s.length - 1; j >= 0; j--)
      dp[i][j] = t[i] === s[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const hit = new Array<boolean>(t.length).fill(false);
  const usedSaid = new Array<boolean>(s.length).fill(false);
  for (let i = 0, j = 0; i < t.length && j < s.length; ) {
    if (t[i] === s[j]) {
      hit[i] = usedSaid[j] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }

  const marks = display.map((word, i) => {
    const idx = owner.map((o, k) => (o === i ? k : -1)).filter((k) => k >= 0);
    return { word, ok: idx.length === 0 || idx.every((k) => hit[k]) };
  });
  const score = t.length ? hit.filter(Boolean).length / t.length : 0;
  return { score, marks, said, extra: s.filter((_, j) => !usedSaid[j]) };
}

/** Picks the recognition alternative that best matches the target. */
export function bestAttempt(target: string, alternatives: string[]): ScoreResult {
  if (!alternatives.length) return scoreAttempt(target, "");
  return alternatives.map((a) => scoreAttempt(target, a)).sort((a, b) => b.score - a.score)[0];
}

export const PASS = 0.8;
export const MISS = 0.6;

export function verdict(score: number) {
  if (score >= 0.95) return { label: "Xuất sắc!", tone: "ok" as const, emoji: "🌟" };
  if (score >= PASS) return { label: "Tốt lắm!", tone: "ok" as const, emoji: "👍" };
  if (score >= MISS) return { label: "Gần đúng rồi, thử lại nhé", tone: "warn" as const, emoji: "💪" };
  return { label: "Chưa khớp, nghe mẫu rồi nói lại", tone: "bad" as const, emoji: "🔁" };
}
