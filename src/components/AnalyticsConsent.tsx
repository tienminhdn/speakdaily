"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { analyticsConfigured, initAnalytics, readConsent, setAnalyticsConsent, type Consent } from "@/lib/analytics";

const noop = () => () => {};

/** Starts analytics and shows a one-time cookie notice until the visitor chooses. */
export function AnalyticsConsent() {
  // null on the server / during hydration, the stored choice afterwards.
  const stored = useSyncExternalStore<Consent | "unknown">(noop, readConsent, () => "unknown");
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    initAnalytics();
  }, []);

  if (!analyticsConfigured() || stored !== null || answered) return null;

  function choose(v: "granted" | "denied") {
    setAnalyticsConsent(v);
    setAnswered(true);
  }

  return (
    <div
      role="dialog"
      aria-label="Thông báo cookie"
      className="rise fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-line bg-surface p-4 text-sm shadow-xl sm:flex-row sm:items-center"
    >
      <p className="flex-1 text-muted">
        🍪 SpeakDaily dùng cookie của Google Analytics để đếm lượt truy cập và cải thiện bài học. Tiến độ học, giọng nói
        và sổ tay lỗi của bạn <b className="text-ink">không</b> được gửi đi.
      </p>
      <div className="flex shrink-0 gap-2">
        <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={() => choose("denied")}>
          Từ chối
        </button>
        <button type="button" className="btn btn-primary px-3 py-1.5 text-xs" onClick={() => choose("granted")}>
          Đồng ý
        </button>
      </div>
    </div>
  );
}
