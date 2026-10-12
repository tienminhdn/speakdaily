"use client";

import Link from "next/link";
import { useState } from "react";
import { chunkById, speakTarget, type ChunkRef } from "@/data";
import { BOX_DAYS, mistakeKey, reviewCard, useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { useNow } from "@/lib/time";
import { SpeakButton } from "./SpeakButton";
import { SpeakCheck } from "./SpeakCheck";

type Direction = "vi-en" | "en-vi";

export function Flashcards() {
  const p = useProgress();
  const now = useNow();
  const [queue, setQueue] = useState<string[] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [dir, setDir] = useState<Direction>("vi-en");
  const [reviewed, setReviewed] = useState(0);
  const [spoken, setSpoken] = useState<number | null>(null);

  const ids = Object.keys(p.srs).filter((id) => chunkById.has(id));
  const due = now ? ids.filter((id) => p.srs[id].due <= now) : [];
  const boxes = [1, 2, 3, 4, 5].map((b) => ids.filter((id) => p.srs[id].box === b).length);

  function begin(list: string[]) {
    // Weak first: lowest Leitner box, then cards that are also in the mistakes notebook.
    const weight = (id: string) => {
      const c = chunkById.get(id)!;
      const inNotebook = p.mistakes[mistakeKey(speakTarget(c))] ? 0 : 1;
      return p.srs[id].box * 2 + inNotebook + Math.random();
    };
    setQueue([...list].sort((a, b) => weight(a) - weight(b)));
    setFlipped(false);
    setSpoken(null);
    setReviewed(0);
  }

  function flip(card: ChunkRef) {
    setFlipped(true);
    speak(card.en, { rate: p.rate });
  }

  function grade(g: 0 | 1 | 2) {
    if (!queue) return;
    const [id, ...rest] = queue;
    reviewCard(id, g);
    setReviewed((n) => n + 1);
    // Forgotten cards come back at the end of this session.
    setQueue(g === 0 ? [...rest, id] : rest);
    setFlipped(false);
    setSpoken(null);
  }

  if (ids.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-5xl">🗂️</p>
        <h2 className="mt-3 text-xl font-bold">Chưa có thẻ nào để ôn</h2>
        <p className="mt-1 text-muted">
          Vào mục Từ vựng và bấm <b>Thuộc</b> ở các cụm từ bạn đã học. Chúng sẽ xuất hiện ở đây theo lịch ôn ngắt quãng.
        </p>
        <Link href="/tu-vung" className="btn btn-primary mt-5">
          Đi học từ vựng
        </Link>
      </div>
    );
  }

  if (queue && queue.length > 0) {
    const card = chunkById.get(queue[0])!;
    const front = dir === "vi-en" ? card.vi : card.en;
    return (
      <div className="mx-auto max-w-xl">
        <div className="mb-3 flex justify-between text-sm text-muted">
          <span>
            Còn {queue.length} thẻ · đã ôn {reviewed}
          </span>
          <button type="button" className="hover:text-brand" onClick={() => setQueue(null)}>
            Dừng
          </button>
        </div>
        <div className="card flex min-h-72 flex-col items-center justify-center p-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            {dir === "vi-en" ? "Nói bằng tiếng Anh" : "Nghĩa là gì?"}
          </p>
          <p className="text-2xl font-bold">{front}</p>
          {dir === "en-vi" && (
            <div className="mt-3">
              <SpeakButton text={card.en} />
            </div>
          )}
          {flipped && (
            <div className="mt-6 w-full border-t border-line pt-6">
              <div className="flex items-center justify-center gap-2">
                <p className="text-xl font-semibold text-brand">{dir === "vi-en" ? card.en : card.vi}</p>
                {dir === "vi-en" && <SpeakButton text={card.en} size="sm" />}
              </div>
              {card.ex && (
                <p className="mt-3 text-sm text-muted">
                  {card.ex}
                  <br />
                  <span className="italic">{card.exVi}</span>
                </p>
              )}
            </div>
          )}
        </div>
        {!flipped && dir === "vi-en" && (
          <div className="mt-4">
            <SpeakCheck
              key={card.id}
              target={speakTarget(card)}
              vi={card.vi}
              source="Flashcard"
              hideTarget
              compact
              onScored={(sc) => {
                setSpoken(sc);
                setFlipped(true);
              }}
            />
          </div>
        )}
        {spoken !== null && flipped && (
          <p className="mt-3 text-center text-sm text-muted">
            Máy chấm {Math.round(spoken * 100)}%: gợi ý chọn{" "}
            <b>{spoken >= 0.95 ? "Dễ" : spoken >= 0.8 ? "Nhớ" : "Quên"}</b>
          </p>
        )}
        {!flipped ? (
          <button type="button" className="btn btn-primary mt-4 w-full py-3" onClick={() => flip(card)}>
            Lật thẻ
          </button>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" className="btn flex-col gap-0 bg-bad-soft py-3 text-bad" onClick={() => grade(0)}>
              Quên
              <span className="text-xs font-normal opacity-80">gặp lại ngay</span>
            </button>
            <button type="button" className="btn bg-brand-soft py-3 text-brand" onClick={() => grade(1)}>
              Nhớ
            </button>
            <button type="button" className="btn bg-ok-soft py-3 text-ok" onClick={() => grade(2)}>
              Dễ
            </button>
          </div>
        )}
      </div>
    );
  }

  const nextDue = ids
    .map((id) => p.srs[id].due)
    .filter((d) => d > now)
    .sort((a, b) => a - b)[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card p-6">
        {queue && (
          <p className="mb-4 rounded-lg bg-ok-soft p-3 text-sm text-ok">🎉 Xong phiên ôn! Bạn đã ôn {reviewed} thẻ.</p>
        )}
        <h2 className="text-xl font-bold">
          {now === 0 ? "…" : due.length > 0 ? `${due.length} thẻ đến hạn ôn hôm nay` : "Bạn đã ôn hết thẻ đến hạn 👏"}
        </h2>
        {due.length === 0 && nextDue && (
          <p className="mt-1 text-sm text-muted">Lần ôn tiếp theo: {new Date(nextDue).toLocaleString("vi-VN")}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Chiều thẻ:</span>
          {(
            [
              ["vi-en", "Việt → Anh (nói)"],
              ["en-vi", "Anh → Việt (hiểu)"],
            ] as [Direction, string][]
          ).map(([d, label]) => (
            <button
              key={d}
              type="button"
              onClick={() => setDir(d)}
              className={`btn px-3 py-1.5 text-xs ${dir === d ? "btn-primary" : "btn-ghost"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" disabled={due.length === 0} onClick={() => begin(due)}>
            Ôn thẻ đến hạn
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => begin(ids)}>
            Ôn tất cả ({ids.length})
          </button>
        </div>
      </div>
      <div className="card p-5">
        <p className="mb-3 text-sm font-bold text-muted">HỘP GHI NHỚ</p>
        <ul className="space-y-2">
          {boxes.map((n, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0 font-semibold">Hộp {i + 1}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-brand" style={{ width: `${ids.length ? (n / ids.length) * 100 : 0}%` }} />
              </div>
              <span className="w-6 text-right tabular-nums">{n}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Nhớ đúng thì thẻ lên hộp cao hơn và gặp lại thưa dần ({BOX_DAYS.slice(1).join(", ")} ngày). Quên thì thẻ về
          hộp 1.
        </p>
      </div>
    </div>
  );
}
