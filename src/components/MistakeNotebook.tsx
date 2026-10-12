"use client";

import Link from "next/link";
import { useState } from "react";
import { addMistake, isFixed, removeMistake, useProgress, FIXED_STREAK } from "@/lib/progress";
import { SpeakCheck } from "./SpeakCheck";

type Filter = "open" | "fixed";

export function MistakeNotebook() {
  const p = useProgress();
  const [filter, setFilter] = useState<Filter>("open");
  const [practice, setPractice] = useState<string | null>(null);
  const [form, setForm] = useState({ wrong: "", right: "", note: "" });

  const entries = Object.entries(p.mistakes).sort(([, a], [, b]) => b.count - a.count || b.at - a.at);
  const open = entries.filter(([, m]) => !isFixed(m));
  const fixed = entries.filter(([, m]) => isFixed(m));
  const shown = filter === "open" ? open : fixed;

  function addManual(e: React.FormEvent) {
    e.preventDefault();
    if (!form.right.trim()) return;
    addMistake({
      en: form.right.trim(),
      said: form.wrong.trim() || undefined,
      note: form.note.trim() || undefined,
      source: "Tự ghi",
    });
    setForm({ wrong: "", right: "", note: "" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`btn px-3 py-1.5 text-sm ${filter === "open" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("open")}
          >
            Cần luyện ({open.length})
          </button>
          <button
            type="button"
            className={`btn px-3 py-1.5 text-sm ${filter === "fixed" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("fixed")}
          >
            Đã sửa ({fixed.length})
          </button>
          {open.length > 0 && (
            <Link href="/luyen-noi?scope=mistakes" className="btn btn-ghost ml-auto px-3 py-1.5 text-sm">
              ⚡ Luyện liền tất cả câu yếu
            </Link>
          )}
        </div>

        {shown.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            {filter === "open" ? (
              <>
                <p className="text-4xl">📒</p>
                <p className="mt-2">
                  Chưa có câu nào cần luyện. Khi bạn nói chưa khớp (dưới 60%) hoặc làm sai trong Luyện đề, câu đó sẽ tự
                  xuất hiện ở đây.
                </p>
              </>
            ) : (
              <p>
                Chưa có câu nào được sửa. Một câu được tính là &ldquo;đã sửa&rdquo; khi bạn nói đạt {FIXED_STREAK} lần
                liên tiếp.
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {shown.map(([key, m]) => (
              <li key={key} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.en}</p>
                    {m.vi && <p className="text-sm text-muted">{m.vi}</p>}
                    {m.said && (
                      <p className="mt-1 text-sm">
                        <span className="text-bad">✗ Bạn đã nói/viết:</span> <i>&ldquo;{m.said}&rdquo;</i>
                      </p>
                    )}
                    {m.note && <p className="mt-1 text-sm text-muted">📝 {m.note}</p>}
                    <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted">
                      <span>{m.source}</span>
                      <span>Sai {m.count} lần</span>
                      <span>
                        Đạt liên tiếp {Math.min(m.streak, FIXED_STREAK)}/{FIXED_STREAK}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      className="btn btn-primary px-3 py-1.5 text-xs"
                      onClick={() => setPractice(practice === key ? null : key)}
                    >
                      🎤 Luyện
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost px-3 py-1.5 text-xs text-muted"
                      onClick={() => removeMistake(key)}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
                {practice === key && (
                  <div className="mt-3">
                    <SpeakCheck target={m.en} source={m.source} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="space-y-4">
        <form onSubmit={addManual} className="card space-y-3 p-5">
          <p className="font-bold">✍️ Tự ghi một lỗi</p>
          <p className="text-xs text-muted">Ví dụ lỗi bị người khác sửa khi nói chuyện, hoặc lỗi bạn tự phát hiện.</p>
          <label className="block text-sm">
            Câu bạn đã nói (sai)
            <input
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
              value={form.wrong}
              onChange={(e) => setForm({ ...form, wrong: e.target.value })}
              placeholder="I very like it"
            />
          </label>
          <label className="block text-sm">
            Câu đúng <span className="text-bad">*</span>
            <input
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
              value={form.right}
              onChange={(e) => setForm({ ...form, right: e.target.value })}
              placeholder="I really like it."
              required
            />
          </label>
          <label className="block text-sm">
            Ghi chú
            <input
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="very không đứng trước động từ"
            />
          </label>
          <button type="submit" className="btn btn-primary w-full">
            Thêm vào sổ tay
          </button>
        </form>
        <div className="card p-5 text-sm text-muted">
          <p className="mb-1 font-bold text-ink">Sổ tay hoạt động thế nào?</p>
          Câu tự vào sổ khi bạn nói dưới 60% hoặc chọn sai trong Luyện đề. Câu sai nhiều lần nằm trên cùng. Nói đạt từ
          80% trở lên {FIXED_STREAK} lần liên tiếp thì câu chuyển sang &ldquo;Đã sửa&rdquo;.
        </div>
      </aside>
    </div>
  );
}
