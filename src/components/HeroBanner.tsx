import Link from "next/link";
import type { CSSProperties } from "react";
import { WordBubbles } from "./WordBubbles";

const STARS = [
  [640, 40, 0],
  [730, 110, 1.2],
  [780, 30, 0.6],
  [860, 85, 2],
  [930, 45, 0.3],
  [1010, 25, 1.6],
  [520, 75, 2.4],
  [1120, 60, 0.9],
];

function d(delay: number) {
  return { "--delay": `${delay}s` } as CSSProperties;
}

/** Hand-drawn SVG scene: an autumn city at dusk, with a clock tower, a big wheel and floating speech bubbles. */
function HeroArt() {
  return (
    <svg
      viewBox="0 0 1200 300"
      preserveAspectRatio="xMaxYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2a44" />
          <stop offset="0.55" stopColor="#7a3b2e" />
          <stop offset="1" stopColor="#e09a52" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" />
          <stop offset="0.45" stopColor="#ffb867" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb867" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3326" />
          <stop offset="1" stopColor="#24202f" />
        </linearGradient>
      </defs>

      <rect width="1200" height="300" fill="url(#sky)" />
      {STARS.map(([x, y, delay]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#fff4dc" className="twinkle" style={d(delay)} />
      ))}
      <circle cx="980" cy="210" r="110" fill="url(#sun)" />

      {/* far skyline */}
      <g fill="#5b2f2a" opacity="0.75">
        <rect x="640" y="190" width="40" height="70" />
        <rect x="685" y="170" width="28" height="90" />
        <rect x="760" y="180" width="50" height="80" />
        <rect x="960" y="175" width="36" height="85" />
        <rect x="1000" y="195" width="55" height="65" />
        <rect x="1140" y="185" width="60" height="75" />
      </g>

      {/* big wheel */}
      <g transform="translate(1080 165)">
        <g className="spin-slow">
          <circle r="62" fill="none" stroke="#3a2230" strokeWidth="3" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <g key={i}>
                <line x1="0" y1="0" x2={62 * Math.cos(a)} y2={62 * Math.sin(a)} stroke="#3a2230" strokeWidth="1.2" />
                <circle cx={62 * Math.cos(a)} cy={62 * Math.sin(a)} r="4.5" fill="#3a2230" />
              </g>
            );
          })}
        </g>
        <path d="M-30 95 0 0 30 95" fill="none" stroke="#3a2230" strokeWidth="4" />
      </g>

      {/* clock tower */}
      <g fill="#3a2230" transform="translate(150 0)">
        <rect x="735" y="95" width="34" height="170" />
        <rect x="729" y="120" width="46" height="46" />
        <path d="M733 95 752 45 771 95Z" />
        <rect x="750" y="30" width="4" height="18" />
        <rect x="690" y="200" width="45" height="60" />
        <rect x="769" y="190" width="70" height="70" />
      </g>
      <circle cx="902" cy="143" r="15" fill="#ffd9a0" />
      <path d="M902 143V133M902 143l7 4" stroke="#3a2230" strokeWidth="2.2" strokeLinecap="round" />

      {/* river */}
      <rect y="258" width="1200" height="42" fill="url(#water)" />
      <g stroke="#ffcf8a" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round">
        <path d="M790 270h70M760 280h40M820 286h60M1050 272h50M560 276h40" />
      </g>

      {/* maple branch, top right */}
      <g className="sway">
        <path
          d="M1200 0C1150 30 1110 40 1060 38M1150 26c-10 20-30 32-55 36"
          stroke="#3a2230"
          strokeWidth="5"
          fill="none"
        />
        {[
          [1060, 34, "#d9822b"],
          [1085, 22, "#c0442c"],
          [1110, 40, "#e3a33b"],
          [1095, 62, "#d9822b"],
          [1135, 20, "#b8532a"],
          [1165, 34, "#e3a33b"],
          [1180, 10, "#c0442c"],
          [1125, 55, "#c0442c"],
        ].map(([x, y, c]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="13" fill={c as string} opacity="0.92" />
        ))}
      </g>
    </svg>
  );
}

export function HeroBanner() {
  return (
    <section className="rise relative overflow-hidden rounded-3xl bg-[#1f2a44] text-white shadow-xl">
      <HeroArt />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1c2236f2] via-[#2a2238c2] via-45% to-transparent" />
      <WordBubbles />
      <div className="relative z-[2] max-w-xl px-6 pt-10 pb-48 sm:px-10 sm:pt-14 lg:pb-14">
        <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
          🍁 Tiếng Anh giao tiếp cho người mất gốc
        </p>
        <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          Nghe được. <span className="text-[#ffc98a]">Nói được.</span>
          <br />
          30 ngày, mỗi ngày 20 phút.
        </h1>
        <p className="mt-4 max-w-md text-[#f1d8bb]">
          Học theo tình huống thật: chào hỏi, gọi món, hỏi đường, đi làm, gọi điện. Có phát âm, đóng vai, luyện đề và ôn
          tập tự động.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/giao-trinh/ngay-1" className="btn bg-[#fff4df] px-5 py-3 text-base text-[#9a572e] shadow-lg">
            ▶ Bắt đầu Ngày 1
          </Link>
          <Link
            href="/trinh-do"
            className="btn border border-white/30 px-5 py-3 text-base text-white hover:bg-white/10"
          >
            Xem lộ trình
          </Link>
        </div>
      </div>
      <p className="pointer-events-none absolute top-5 right-6 z-[2] hidden text-right text-sm text-[#ffe6bd] drop-shadow lg:block">
        &ldquo;Practice makes progress.&rdquo;
        <small className="block text-xs opacity-80">Luyện tập tạo nên tiến bộ.</small>
      </p>
    </section>
  );
}
