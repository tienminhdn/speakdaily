"use client";

import { useEffect, useRef, useState } from "react";
import { milestones, promptsUpTo, type MilestoneId, type Prompt } from "@/data";
import { recordMilestone, useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { Recorder } from "./Recorder";
import { SpeakCheck } from "./SpeakCheck";

const SCOPE_DAY: Record<MilestoneId, number> = { m0: 7, m1: 7, m2: 14, m3: 21, m4: 30 };
const FREE_TASK: Record<MilestoneId, { text: string; seconds: number }> = {
  m0: {
    text: "Giới thiệu bản thân: tên, quê, công việc, sở thích. Nói được bao nhiêu thì nói, không sao cả.",
    seconds: 60,
  },
  m1: { text: "Kể một ngày bình thường của bạn từ sáng đến tối. Chú ý nói rõ âm cuối.", seconds: 60 },
  m2: { text: "Kể lại hôm qua bạn đã làm gì, theo thứ tự thời gian.", seconds: 90 },
  m3: { text: "Kể kế hoạch cuối tuần của bạn và rủ người nghe tham gia cùng.", seconds: 90 },
  m4: { text: "Giới thiệu bản thân, công việc, một câu chuyện gần đây và mục tiêu của bạn.", seconds: 120 },
};
const RUBRIC = [
  { key: "fluency", label: "Trôi chảy", hint: "Ít ngập ngừng, không dừng lâu" },
  { key: "pron", label: "Phát âm", hint: "Rõ âm cuối, người nghe hiểu được" },
  { key: "range", label: "Vốn cụm từ", hint: "Dùng được cụm từ đã học" },
] as const;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Q = { prompt: Prompt; options: string[] };

export function MilestoneTest({ id }: { id: MilestoneId }) {
  const p = useProgress();
  const meta = milestones.find((m) => m.id === id)!;
  const history = p.milestones[id] ?? [];
  const baseline = id === "m4" ? p.milestones.m0?.at(-1) : undefined;

  const [step, setStep] = useState(0);
  const [qs, setQs] = useState<Q[]>([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [listenOk, setListenOk] = useState(0);
  const [speakItems, setSpeakItems] = useState<Prompt[]>([]);
  const [speakScores, setSpeakScores] = useState<Record<number, number>>({});
  const [rubric, setRubric] = useState<Record<string, number>>({});
  const [left, setLeft] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [saved, setSaved] = useState<{ listening: number; speaking: number; self: number } | null>(null);

  useEffect(() => () => clearInterval(timer.current), []);

  function start() {
    const pool = promptsUpTo(SCOPE_DAY[id]);
    const picks = shuffle(pool).slice(0, 6);
    const questions = picks.map((prompt) => ({
      prompt,
      options: shuffle([
        prompt.en,
        ...shuffle(pool.filter((x) => x.id !== prompt.id))
          .slice(0, 3)
          .map((x) => x.en),
      ]),
    }));
    setQs(questions);
    setQi(0);
    setPicked(null);
    setListenOk(0);
    setSpeakItems(shuffle(pool.filter((x) => !picks.includes(x))).slice(0, 5));
    setSpeakScores({});
    setRubric({});
    setLeft(null);
    setSaved(null);
    setStep(1);
    speak(questions[0].prompt.en, { rate: p.rate });
  }

  function pick(o: string) {
    if (picked) return;
    setPicked(o);
    if (o === qs[qi].prompt.en) setListenOk((n) => n + 1);
  }

  function nextQ() {
    if (qi + 1 >= qs.length) {
      setStep(2);
      return;
    }
    setQi(qi + 1);
    setPicked(null);
    speak(qs[qi + 1].prompt.en, { rate: p.rate });
  }

  function startTimer() {
    clearInterval(timer.current);
    const end = Date.now() + FREE_TASK[id].seconds * 1000;
    setLeft(FREE_TASK[id].seconds);
    timer.current = setInterval(() => {
      const s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) clearInterval(timer.current);
    }, 250);
  }

  function finish() {
    const listening = qs.length ? listenOk / qs.length : 0;
    const vals = speakItems.map((_, i) => speakScores[i] ?? 0);
    const speaking = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const self = RUBRIC.reduce((a, r) => a + (rubric[r.key] ?? 1), 0) / (RUBRIC.length * 5);
    const r = { listening, speaking, self };
    recordMilestone(id, r);
    setSaved(r);
    setStep(4);
  }

  const pct = (x: number) => `${Math.round(x * 100)}%`;

  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-r from-brand-soft to-accent-soft p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">🏁 Kiểm tra mốc · {meta.name}</p>
        <p className="mt-1 font-semibold">{meta.description}</p>
        <div className="mt-3 flex gap-1">
          {["Nghe", "Nói dịch nhanh", "Nói tự do"].map((label, i) => (
            <span
              key={label}
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                step === i + 1
                  ? "bg-brand text-brand-ink"
                  : step > i + 1
                    ? "bg-ok-soft text-ok"
                    : "bg-surface text-muted"
              }`}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5">
        {step === 0 && (
          <div>
            <p className="text-sm text-muted">
              Khoảng 10 phút, gồm 6 câu nghe, 5 câu nói và một bài nói tự do có ghi âm.
            </p>
            {history.length > 0 && (
              <p className="mt-2 text-sm">
                Lần gần nhất: nghe {pct(history.at(-1)!.listening)} · nói {pct(history.at(-1)!.speaking)} · tự chấm{" "}
                {pct(history.at(-1)!.self)}
              </p>
            )}
            <button type="button" className="btn btn-primary mt-4" onClick={start}>
              {history.length ? "Làm lại bài kiểm tra" : "Bắt đầu kiểm tra"}
            </button>
          </div>
        )}

        {step === 1 && qs[qi] && (
          <div>
            <div className="mb-3 flex items-center justify-between text-sm text-muted">
              <span>
                Nghe câu {qi + 1}/{qs.length} và chọn câu bạn nghe được
              </span>
              <button
                type="button"
                className="btn btn-ghost px-3 py-1.5 text-xs"
                onClick={() => speak(qs[qi].prompt.en, { rate: p.rate })}
              >
                🔊 Nghe lại
              </button>
            </div>
            <div className="grid gap-2">
              {qs[qi].options.map((o) => {
                const isAns = o === qs[qi].prompt.en;
                const st = !picked
                  ? "border-line hover:border-brand"
                  : isAns
                    ? "border-ok bg-ok-soft text-ok"
                    : o === picked
                      ? "border-bad bg-bad-soft text-bad"
                      : "border-line opacity-60";
                return (
                  <button
                    key={o}
                    type="button"
                    disabled={!!picked}
                    onClick={() => pick(o)}
                    className={`rounded-xl border-2 bg-surface px-4 py-3 text-left ${st}`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            {picked && (
              <button type="button" className="btn btn-primary mt-4" onClick={nextQ}>
                {qi + 1 >= qs.length ? "Sang phần Nói →" : "Câu tiếp →"}
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted">Nói từng câu bằng tiếng Anh. Câu bỏ qua tính 0 điểm.</p>
            {speakItems.map((s, i) => (
              <SpeakCheck
                key={s.id}
                target={s.en}
                vi={s.vi}
                source={`Kiểm tra ${meta.name}`}
                hideTarget
                onScored={(sc) => setSpeakScores((m) => ({ ...m, [i]: Math.max(m[i] ?? 0, sc) }))}
              />
            ))}
            <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
              Sang phần Nói tự do →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-2 p-4">
              <p className="text-sm font-bold">🎤 Đề bài ({FREE_TASK[id].seconds} giây)</p>
              <p className="mt-1">{FREE_TASK[id].text}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-ghost" onClick={startTimer}>
                ⏱ {left === null ? "Bấm giờ" : "Bấm lại"}
              </button>
              {left !== null && (
                <span className={`text-2xl font-bold tabular-nums ${left === 0 ? "text-ok" : ""}`}>
                  {left === 0 ? "Hết giờ!" : `${left}s`}
                </span>
              )}
            </div>
            <Recorder />
            <p className="text-xs text-muted">
              Ghi âm lại để nghe và so sánh với lần kiểm tra trước. Bản ghi chỉ nằm trên máy bạn, không được tải lên
              đâu.
            </p>
            <div>
              <p className="mb-2 text-sm font-bold">Tự chấm (1 = rất khó khăn, 5 = rất tốt)</p>
              {RUBRIC.map((r) => (
                <div key={r.key} className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="w-28 text-sm font-semibold">{r.label}</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRubric((m) => ({ ...m, [r.key]: n }))}
                      className={`grid h-8 w-8 place-items-center rounded-full border text-sm font-bold ${
                        rubric[r.key] === n ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="text-xs text-muted">{r.hint}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={finish}
              disabled={RUBRIC.some((r) => !rubric[r.key])}
            >
              Hoàn thành bài kiểm tra (+10 XP)
            </button>
          </div>
        )}

        {step === 4 && saved && (
          <div>
            <p className="text-center text-4xl">🏁</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {(
                [
                  ["Nghe", saved.listening, baseline?.listening],
                  ["Nói", saved.speaking, baseline?.speaking],
                  ["Tự chấm", saved.self, baseline?.self],
                ] as [string, number, number | undefined][]
              ).map(([label, v, base]) => (
                <div key={label} className="rounded-xl bg-surface-2 p-3">
                  <p className="text-2xl font-bold">{pct(v)}</p>
                  <p className="text-xs text-muted">{label}</p>
                  {base !== undefined && (
                    <p className={`text-xs font-semibold ${v >= base ? "text-ok" : "text-bad"}`}>
                      {v >= base ? "▲" : "▼"} {Math.abs(Math.round((v - base) * 100))} điểm so với Baseline
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-muted">
              Kết quả đã lưu ở trang Tiến độ. Câu nói chưa đạt đã vào Sổ tay lỗi.
            </p>
            <div className="mt-4 text-center">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
