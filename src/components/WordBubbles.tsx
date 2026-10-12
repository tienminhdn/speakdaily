"use client";

import { useRef, useState, type CSSProperties } from "react";
import { allChunks, speakTarget, type ChunkRef } from "@/data";
import { useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { track } from "@/lib/analytics";

// Short, self-contained phrases read best inside a bubble.
const SHORT = allChunks.filter((c) => c.en.length <= 24 && !/\.\.\.|\//.test(c.en));

// Fixed lanes (not random) so the server render matches the client. Same speed for every lane, and
// bubbles sharing a column are half a cycle apart, so they never stack on top of each other.
const LANES = [
  { x: 30, dur: 16, delay: 0 },
  { x: 70, dur: 16, delay: -8 },
  { x: 50, dur: 16, delay: -4 },
  { x: 32, dur: 16, delay: -11 },
  { x: 68, dur: 16, delay: -2 },
  { x: 50, dur: 16, delay: -13 },
];

type Bubble = { key: number; chunk: ChunkRef; delay: number };

/** Random pick, only ever called from event handlers (respawn / pop). */
function randomItem<T>(items: T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}
type Pop = { id: number; x: number; y: number; vi: string };

export function WordBubbles() {
  const { learned } = useProgress();
  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    LANES.map((l, i) => ({ key: i, chunk: SHORT[(i * 11) % SHORT.length], delay: l.delay })),
  );
  const [pops, setPops] = useState<Pop[]>([]);
  const layer = useRef<HTMLDivElement>(null);
  const nextKey = useRef(LANES.length);

  function pickChunk(exclude: Bubble[]): ChunkRef {
    const mine = SHORT.filter((c) => learned.includes(c.id));
    const pool = (mine.length >= 6 ? mine : SHORT).filter((c) => !exclude.some((b) => b.chunk.id === c.id));
    return randomItem(pool) ?? SHORT[0];
  }

  function respawn(i: number, delay: number) {
    // Pick outside the state updater so the updater stays pure.
    const chunk = pickChunk(bubbles);
    const key = nextKey.current++;
    setBubbles((bs) => bs.map((b, j) => (j === i ? { key, chunk, delay } : b)));
  }

  function pop(i: number, el: HTMLElement) {
    const b = bubbles[i];
    speak(speakTarget(b.chunk));
    track("bubble_pop", { topic: b.chunk.topic });
    const box = layer.current!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const id = nextKey.current++;
    setPops((ps) => [
      ...ps,
      { id, x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, vi: b.chunk.vi },
    ]);
    setTimeout(() => setPops((ps) => ps.filter((p) => p.id !== id)), 2600);
    respawn(i, 0.6);
  }

  return (
    <div ref={layer} className="bubble-layer" aria-label="Bấm vào bong bóng để nghe cụm từ">
      {bubbles.map((b, i) => (
        <button
          key={b.key}
          type="button"
          className="word-bubble"
          style={
            {
              "--x": `${LANES[i].x}%`,
              "--dur": `${LANES[i].dur}s`,
              "--delay": `${b.delay}s`,
            } as CSSProperties
          }
          onAnimationIteration={(e) => {
            if (e.animationName === "bubble-rise") respawn(i, 0);
          }}
          onClick={(e) => pop(i, e.currentTarget)}
          aria-label={`Nghe: ${b.chunk.en}`}
          title="Bấm để nghe"
        >
          <span className="word-bubble-inner">
            {b.chunk.en}
            <span className="word-bubble-icon" aria-hidden="true">
              🔊
            </span>
          </span>
        </button>
      ))}

      {pops.map((p) => (
        <div key={p.id} className="bubble-pop" style={{ left: p.x, top: p.y }} aria-live="polite">
          {Array.from({ length: 10 }, (_, k) => (
            <span key={k} className="bubble-particle" style={{ "--a": `${k * 36}deg` } as CSSProperties} />
          ))}
          <span className="bubble-meaning">{p.vi}</span>
        </div>
      ))}
    </div>
  );
}
