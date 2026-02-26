import { useEffect, useCallback } from "react";

interface WebVitals {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  fcp: number | null;
  ttfb: number | null;
}

let vitalsCache: WebVitals = { lcp: null, cls: null, inp: null, fcp: null, ttfb: null };

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
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) clsValue += entry.value;
      }
      vitalsCache.cls = Math.round(clsValue * 1000) / 1000;
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {}

  // FCP
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries().find(e => e.name === "first-contentful-paint");
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

// Initialize on first import
observeWebVitals();

export function getWebVitals(): WebVitals {
  return { ...vitalsCache };
}

export function useWebVitals() {
  const getVitals = useCallback(() => getWebVitals(), []);
  
  useEffect(() => {
    // Re-check after page settles
    const timer = setTimeout(() => {
      // TTFB might be available now
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
