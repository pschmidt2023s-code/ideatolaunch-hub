import { useEffect, useCallback } from "react";

interface WebVitals {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  fcp: number | null;
  ttfb: number | null;
  fid: number | null;
}

let vitalsCache: WebVitals = { lcp: null, cls: null, inp: null, fcp: null, ttfb: null, fid: null };

function observeWebVitals() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  // LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      if (last) vitalsCache.lcp = Math.round(last.startTime);
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}

  // CLS
  try {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          const firstEntry = sessionEntries[0];
          const lastEntry = sessionEntries[sessionEntries.length - 1];
          // Session window: gap < 1s, max 5s
          if (
            sessionEntries.length &&
            entry.startTime - lastEntry.startTime < 1000 &&
            entry.startTime - firstEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }
          if (sessionValue > clsValue) {
            clsValue = sessionValue;
          }
        }
      }
      vitalsCache.cls = Math.round(clsValue * 1000) / 1000;
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {}

  // INP (Interaction to Next Paint)
  try {
    let maxINP = 0;
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (entry.duration > maxINP) {
          maxINP = entry.duration;
          vitalsCache.inp = Math.round(maxINP);
        }
      }
    });
    inpObserver.observe({ type: "event", buffered: true, durationThreshold: 16 } as any);
  } catch {}

  // FCP
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries().find((e) => e.name === "first-contentful-paint");
      if (entry) vitalsCache.fcp = Math.round(entry.startTime);
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch {}

  // TTFB
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) vitalsCache.ttfb = Math.round(nav.responseStart - nav.requestStart);
  } catch {}
}

observeWebVitals();

export function getWebVitals(): WebVitals {
  return { ...vitalsCache };
}

export function useWebVitals() {
  const getVitals = useCallback(() => getWebVitals(), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if (nav && !vitalsCache.ttfb) {
          vitalsCache.ttfb = Math.round(nav.responseStart - nav.requestStart);
        }
      } catch {}
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return getVitals;
}
