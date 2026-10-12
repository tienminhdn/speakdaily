"use client";

import type { Analytics } from "firebase/analytics";

// Must be referenced literally so Next.js inlines them at build time.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const CONSENT_KEY = "engdaily-analytics-consent";
export type Consent = "granted" | "denied" | null;

let analytics: Analytics | null = null;
let starting: Promise<void> | null = null;
const queue: [string, Record<string, unknown> | undefined][] = [];

export function analyticsConfigured() {
  return Boolean(config.apiKey && config.appId && config.measurementId);
}

/** Local development never reports, so it can't pollute the production numbers. */
function isLocalhost() {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname);
}

export function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Starts Firebase Analytics once. Safe to call repeatedly. */
export function initAnalytics() {
  if (starting || typeof window === "undefined" || !analyticsConfigured() || isLocalhost()) return;
  if (readConsent() === "denied") return;
  starting = (async () => {
    const [{ initializeApp, getApps }, an] = await Promise.all([import("firebase/app"), import("firebase/analytics")]);
    if (!(await an.isSupported())) return;
    // Until the visitor accepts, GA runs without cookies (consent mode).
    an.setConsent({ analytics_storage: readConsent() === "granted" ? "granted" : "denied", ad_storage: "denied" });
    const app = getApps()[0] ?? initializeApp(config);
    // Page views are sent automatically: once on load, then on each client-side navigation
    // via GA4 "enhanced measurement" (page changes based on browser history events).
    analytics = an.initializeAnalytics(app);
    for (const [name, params] of queue.splice(0)) an.logEvent(analytics, name, params);
  })().catch(() => {
    // Blocked by an ad blocker or network: analytics is optional, ignore.
  });
}

export function setAnalyticsConsent(value: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // ignore
  }
  if (value === "granted") {
    initAnalytics();
    import("firebase/analytics").then((an) => an.setConsent({ analytics_storage: "granted" }));
  } else if (analytics) {
    const a = analytics;
    import("firebase/analytics").then((an) => an.setAnalyticsCollectionEnabled(a, false));
  }
}

/**
 * Logs a custom event. Never pass personal data (names, transcripts, notes).
 * Events before init are queued and flushed once Analytics is ready.
 */
export function track(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || !analyticsConfigured() || isLocalhost() || readConsent() === "denied") return;
  if (!analytics) {
    if (queue.length < 50) queue.push([name, params]);
    initAnalytics();
    return;
  }
  const a = analytics;
  import("firebase/analytics").then((an) => an.logEvent(a, name, params));
}
