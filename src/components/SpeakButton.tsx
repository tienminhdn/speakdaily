"use client";

import { speak } from "@/lib/speech";
import { useProgress } from "@/lib/progress";

export function SpeakButton({ text, size = "md", label }: { text: string; size?: "sm" | "md"; label?: string }) {
  const { rate } = useProgress();
  const dim = size === "sm" ? "h-7 w-7 text-sm" : "h-9 w-9 text-base";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, { rate });
      }}
      aria-label={label ?? `Nghe: ${text}`}
      title="Nghe phát âm"
      className={`${dim} grid shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition hover:bg-brand hover:text-brand-ink`}
    >
      🔊
    </button>
  );
}
