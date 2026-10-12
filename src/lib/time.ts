"use client";

import { useSyncExternalStore } from "react";

let cached = 0;

function getNow() {
  const n = Math.floor(Date.now() / 60_000) * 60_000;
  if (n !== cached) cached = n;
  return cached;
}

function subscribe(cb: () => void) {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
}

/** Current time rounded to the minute; 0 during server render and hydration. */
export function useNow() {
  return useSyncExternalStore(subscribe, getNow, () => 0);
}
