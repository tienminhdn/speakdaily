"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import { speak } from "@/lib/speech";

/** Shadowing helper: record yourself, then compare with the model voice. */
export function Recorder({ model }: { model?: string }) {
  const { rate } = useProgress();
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      rec.current?.stream.getTracks().forEach((t) => t.stop());
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType })));
      };
      rec.current = r;
      r.start();
      setRecording(true);
    } catch {
      setError("Không mở được micro. Hãy cho phép trình duyệt dùng micro.");
    }
  }

  function stop() {
    rec.current?.stop();
    setRecording(false);
  }

  async function compare() {
    if (model) await speak(model, { rate });
    audio.current?.play();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {recording ? (
        <button type="button" className="btn bg-bad px-3 py-1.5 text-xs text-white" onClick={stop}>
          ■ Dừng ghi
        </button>
      ) : (
        <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={start}>
          ⏺ {url ? "Ghi lại" : "Ghi âm giọng tôi"}
        </button>
      )}
      {url && !recording && (
        <>
          <audio ref={audio} src={url} className="hidden" />
          <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={() => audio.current?.play()}>
            ▶ Nghe tôi
          </button>
          {model && (
            <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={compare}>
              ⇄ Mẫu rồi tôi
            </button>
          )}
        </>
      )}
      {error && <span className="text-xs text-bad">{error}</span>}
    </div>
  );
}
