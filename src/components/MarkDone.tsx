"use client";

import { setDone, useProgress, XP, type DoneKind } from "@/lib/progress";

const XP_BY_KIND: Record<DoneKind, number> = {
  patterns: XP.pattern,
  dialogues: XP.dialogue,
  lessons: XP.lesson,
  pron: XP.pattern,
};

export function MarkDone({ kind, id, label = "Đánh dấu đã học xong" }: { kind: DoneKind; id: string; label?: string }) {
  const p = useProgress();
  const done = p[kind].includes(id);
  return (
    <button
      type="button"
      onClick={() => setDone(kind, id, !done)}
      className={`btn ${done ? "btn-on" : "btn-primary"}`}
      aria-pressed={done}
    >
      {done ? "✓ Đã hoàn thành" : `${label} (+${XP_BY_KIND[kind]} XP)`}
    </button>
  );
}

/** Small "done" marker for list pages. */
export function DoneTag({ kind, id }: { kind: DoneKind; id: string }) {
  const p = useProgress();
  if (!p[kind].includes(id)) return null;
  return <span className="rounded-md bg-ok-soft px-2 py-0.5 text-xs font-bold text-ok">✓ Xong</span>;
}

export function TopicCount({ ids }: { ids: string[] }) {
  const { learned } = useProgress();
  const n = ids.filter((id) => learned.includes(id)).length;
  const pct = Math.round((n / ids.length) * 100);
  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>Đã thuộc</span>
        <span className="tabular-nums">
          {n}/{ids.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
