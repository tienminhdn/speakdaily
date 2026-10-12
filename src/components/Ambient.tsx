import type { CSSProperties } from "react";

// Fixed values (not random) so server and client render identically.
// `ch` puts a faint letter or punctuation mark inside some bubbles, a nod to language.
const BUBBLES = [
  { x: 3, size: 18, dur: 22, delay: -3, drift: 30 },
  { x: 9, size: 34, dur: 30, delay: -18, drift: -40, ch: "A" },
  { x: 17, size: 12, dur: 19, delay: -8, drift: 20 },
  { x: 26, size: 24, dur: 26, delay: -22, drift: 50, ch: "?" },
  { x: 35, size: 14, dur: 21, delay: -12, drift: -25 },
  { x: 44, size: 30, dur: 32, delay: -5, drift: 35, ch: "b" },
  { x: 53, size: 10, dur: 18, delay: -15, drift: -15 },
  { x: 61, size: 22, dur: 25, delay: -1, drift: 45, ch: "!" },
  { x: 69, size: 16, dur: 20, delay: -10, drift: -30 },
  { x: 77, size: 36, dur: 34, delay: -26, drift: -45, ch: "e" },
  { x: 85, size: 13, dur: 23, delay: -6, drift: 25 },
  { x: 91, size: 26, dur: 28, delay: -16, drift: -35, ch: "’" },
  { x: 97, size: 15, dur: 21, delay: -20, drift: 15 },
  { x: 48, size: 20, dur: 27, delay: -29, drift: 40, ch: "s" },
];

/** Site-wide ambient layer: soft bubbles drifting up behind nothing, blocking nothing. */
export function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="ambient-bubble"
          style={
            {
              "--x": `${b.x}%`,
              "--size": `${b.size}px`,
              "--dur": `${b.dur}s`,
              "--delay": `${b.delay}s`,
              "--drift": `${b.drift}px`,
            } as CSSProperties
          }
        >
          {b.ch && <span className="ambient-char">{b.ch}</span>}
        </span>
      ))}
    </div>
  );
}
