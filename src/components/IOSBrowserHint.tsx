"use client";

import { useState, useSyncExternalStore } from "react";
import { isIOSNonSafari } from "@/lib/recognition";

const KEY = "engdaily-ios-hint-dismissed";
const noop = () => () => {};

function shouldShow() {
  try {
    return isIOSNonSafari() && localStorage.getItem(KEY) !== "1";
  } catch {
    return isIOSNonSafari();
  }
}

/** One-time tip for Chrome/Firefox/in-app browsers on iPhone: speech scoring only works in Safari. */
export function IOSBrowserHint() {
  const show = useSyncExternalStore(noop, shouldShow, () => false);
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!show || hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setHidden(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      window.prompt("Sao chép link này rồi dán vào Safari:", window.location.href);
    }
  }

  return (
    <div className="border-b border-line bg-accent-soft px-4 py-3 text-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2">
        <p className="flex-1">
          🎤 <b>Muốn máy chấm giọng nói?</b> Trên iPhone, Apple chỉ cho <b>Safari</b> dùng tính năng này. Hãy mở trang
          bằng Safari. Ở các trình duyệt khác bạn vẫn học được, nhưng phải tự chấm.
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-primary px-3 py-1.5 text-xs" onClick={copy}>
            {copied ? "✓ Đã chép link, dán vào Safari" : "Chép link mở bằng Safari"}
          </button>
          <button type="button" className="btn btn-ghost px-3 py-1.5 text-xs" onClick={dismiss} aria-label="Đóng">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
