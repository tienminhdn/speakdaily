"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { allChunks, dialogues, lessons, milestones, patterns, pronunciation } from "@/data";
import {
  dateKey,
  exportProgress,
  isFixed,
  importProgress,
  resetProgress,
  setSetting,
  useProgress,
  type Progress,
} from "@/lib/progress";
import { useNow } from "@/lib/time";

const DAY = 86_400_000;

export function streak(p: Progress, now: number) {
  if (!now) return 0;
  let n = 0;
  // Today without activity yet doesn't break the streak.
  let t = p.activity[dateKey(now)] ? now : now - DAY;
  while (p.activity[dateKey(t)]) {
    n++;
    t -= DAY;
  }
  return n;
}

export function ProgressDashboard() {
  const p = useProgress();
  const now = useNow();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const todayXp = now ? (p.activity[dateKey(now)] ?? 0) : 0;
  const days = now
    ? Array.from({ length: 14 }, (_, i) => {
        const t = now - (13 - i) * DAY;
        return { key: dateKey(t), label: new Date(t).getDate(), xp: p.activity[dateKey(t)] ?? 0 };
      })
    : [];
  const maxXp = Math.max(p.dailyGoal, ...days.map((d) => d.xp));
  const totalXp = Object.values(p.activity).reduce((a, b) => a + b, 0);
  const lastQuiz = p.quiz.at(-1);
  const speakTotal = Object.values(p.speaking).reduce((a, b) => a + b, 0);
  const weak = Object.values(p.mistakes).filter((m) => !isFixed(m)).length;
  const fixedCount = Object.values(p.mistakes).length - weak;
  const pct = (x: number) => `${Math.round(x * 100)}%`;

  const stats = [
    { label: "Cụm từ đã thuộc", value: p.learned.length, total: allChunks.length },
    { label: "Mẫu câu", value: p.patterns.length, total: patterns.length },
    { label: "Hội thoại", value: p.dialogues.length, total: dialogues.length },
    { label: "Phát âm", value: p.pron.length, total: pronunciation.length },
    { label: "Ngày đã học", value: p.lessons.length, total: lessons.length },
  ];

  function download() {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `speakdaily-${dateKey(Date.now())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function upload(file: File) {
    try {
      importProgress(await file.text());
      setMsg("✓ Đã khôi phục tiến độ.");
    } catch {
      setMsg("✗ File không hợp lệ.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted">Hôm nay</p>
          <p className="text-3xl font-bold tabular-nums">
            {todayXp}
            <span className="text-base font-medium text-muted"> / {p.dailyGoal} XP</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.min(100, (todayXp / p.dailyGoal) * 100)}%` }}
            />
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Chuỗi ngày học</p>
          <p className="text-3xl font-bold tabular-nums">🔥 {streak(p, now)} ngày</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Tổng XP · Đề gần nhất</p>
          <p className="text-3xl font-bold tabular-nums">
            {totalXp}
            <span className="text-base font-medium text-muted">
              {" "}
              · {lastQuiz ? `${lastQuiz.score}/${lastQuiz.total}` : "chưa làm"}
            </span>
          </p>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">14 ngày gần đây</h2>
          <label className="flex items-center gap-2 text-sm text-muted">
            Mục tiêu mỗi ngày
            <select
              className="rounded-md border border-line bg-surface px-2 py-1 text-ink"
              value={p.dailyGoal}
              onChange={(e) => setSetting({ dailyGoal: Number(e.target.value) })}
            >
              <option value={10}>10 XP (nhẹ nhàng, ~10 phút)</option>
              <option value={20}>20 XP (đều đặn, ~20 phút)</option>
              <option value={40}>40 XP (tăng tốc, ~40 phút)</option>
            </select>
          </label>
        </div>
        <div className="relative flex h-40 items-end gap-1.5">
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-accent"
            style={{ bottom: `${(p.dailyGoal / maxXp) * 100}%` }}
            title="Mục tiêu"
          />
          {days.map((d) => (
            <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div
                className={`w-full rounded-t ${d.xp >= p.dailyGoal ? "bg-accent" : "bg-brand"}`}
                style={{ height: `${(d.xp / maxXp) * 100}%`, minHeight: d.xp ? 3 : 0 }}
                title={`${d.key}: ${d.xp} XP`}
              />
              <span className="text-[10px] text-muted tabular-nums">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          XP: thuộc 1 cụm từ +1 · ôn 1 thẻ +1 · nói đạt 1 câu +1 · 1 câu đúng khi luyện đề +1 · xong mẫu câu, hội thoại
          hoặc phát âm +3 · xong một ngày +5 · làm bài kiểm tra mốc +10.
        </p>
      </div>

      <div className="card overflow-x-auto p-5">
        <h2 className="mb-3 font-bold">🏁 Kiểm tra mốc</h2>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="pb-2 font-semibold">Mốc</th>
              <th className="pb-2 font-semibold">Nghe</th>
              <th className="pb-2 font-semibold">Nói</th>
              <th className="pb-2 font-semibold">Tự chấm</th>
              <th className="pb-2 font-semibold">Lần làm</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => {
              const last = p.milestones[m.id]?.at(-1);
              return (
                <tr key={m.id} className="border-t border-line">
                  <td className="py-2">
                    <Link href={`/giao-trinh/ngay-${m.day}#kiem-tra`} className="font-semibold hover:text-brand">
                      Ngày {m.day} · {m.name}
                    </Link>
                  </td>
                  <td className="tabular-nums">{last ? pct(last.listening) : "–"}</td>
                  <td className="tabular-nums">{last ? pct(last.speaking) : "–"}</td>
                  <td className="tabular-nums">{last ? pct(last.self) : "–"}</td>
                  <td className="tabular-nums text-muted">{p.milestones[m.id]?.length ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted">Lượt luyện nói</p>
          <p className="text-2xl font-bold tabular-nums">🎤 {speakTotal}</p>
        </div>
        <Link href="/on-tap/so-tay-loi" className="card p-5 hover:border-brand">
          <p className="text-sm text-muted">Câu yếu cần luyện</p>
          <p className="text-2xl font-bold tabular-nums">📒 {weak}</p>
        </Link>
        <div className="card p-5">
          <p className="text-sm text-muted">Lỗi đã sửa được</p>
          <p className="text-2xl font-bold tabular-nums text-ok">✓ {fixedCount}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="text-2xl font-bold tabular-nums">
              {s.value}
              <span className="text-base font-medium text-muted">/{s.total}</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full bg-ok" style={{ width: `${(s.value / s.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-bold">Sao lưu & đồng bộ</h2>
        <p className="mt-1 text-sm text-muted">
          Tiến độ được lưu trên trình duyệt này. Để chuyển sang máy khác, tải file sao lưu rồi khôi phục ở máy kia.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={download}>
            ⬇ Tải file sao lưu
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            ⬆ Khôi phục từ file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn ml-auto text-bad hover:bg-bad-soft"
            onClick={() => {
              if (confirm("Xoá toàn bộ tiến độ? Không thể hoàn tác.")) {
                resetProgress();
                setMsg("Đã xoá tiến độ.");
              }
            }}
          >
            Xoá tiến độ
          </button>
        </div>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </div>
    </div>
  );
}
