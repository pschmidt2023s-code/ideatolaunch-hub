import { trackEvent } from "./events";
import { logError } from "./errors";

// ── Performance tracking ────────────────────────────────────
export async function withPerfTracking<T>(
  label: string,
  fn: () => Promise<T>,
  thresholdMs = 800
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = Math.round(performance.now() - start);

  if (duration > thresholdMs) {
    trackEvent("performance_warning", { label, duration_ms: duration });
    logError(`Slow operation: ${label} (${duration}ms)`, {
      errorType: "performance",
      metadata: { label, duration_ms: duration, threshold_ms: thresholdMs },
    });
  }

  return result;
}

// ── Drop-off tracking ───────────────────────────────────────
let _abandonTimer: ReturnType<typeof setTimeout> | null = null;

export function startStepTimer(step: number) {
  clearStepTimer();
  _abandonTimer = setTimeout(() => {
    trackEvent("step_abandoned", { step, after_minutes: 15 });
  }, 15 * 60 * 1000);
}

export function clearStepTimer() {
  if (_abandonTimer) {
    clearTimeout(_abandonTimer);
    _abandonTimer = null;
  }
}

// ── Page load tracking (Navigation Timing L2) ───────────────
export function trackPageLoad() {
  if (typeof window === "undefined") return;
  window.addEventListener(
    "load",
    () => {
      // Use requestIdleCallback for non-blocking metric collection
      const collect = () => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if (nav) {
          const loadTime = Math.round(nav.loadEventEnd - nav.startTime);
          const dnsTime = Math.round(nav.domainLookupEnd - nav.domainLookupStart);
          const tlsTime = Math.round(nav.connectEnd - nav.secureConnectionStart);
          const ttfb = Math.round(nav.responseStart - nav.requestStart);

          if (loadTime > 1500) {
            trackEvent("page_load_time", {
              duration_ms: loadTime,
              dns_ms: dnsTime,
              tls_ms: tlsTime,
              ttfb_ms: ttfb,
              url: window.location.pathname,
              connection: (navigator as any).connection?.effectiveType || "unknown",
            });
          }
        }
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(collect, { timeout: 5000 });
      } else {
        setTimeout(collect, 100);
      }
    },
    { once: true }
  );
}

// ── Long Task Observer ──────────────────────────────────────
export function observeLongTasks() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          trackEvent("long_task", {
            duration_ms: Math.round(entry.duration),
            url: window.location.pathname,
          });
        }
      }
    });
    observer.observe({ type: "longtask", buffered: true });
  } catch {
    // longtask not supported
  }
}

// ── Resource timing (slow resources) ────────────────────────
export function observeSlowResources() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        if (entry.duration > 3000) {
          trackEvent("slow_resource", {
            name: entry.name.split("?")[0].slice(-80),
            duration_ms: Math.round(entry.duration),
            type: entry.initiatorType,
            size: entry.transferSize,
          });
        }
      }
    });
    observer.observe({ type: "resource", buffered: false });
  } catch {
    // resource timing not supported
  }
}

// ── Global error handler ────────────────────────────────────
export function installGlobalErrorHandler() {
  window.addEventListener("error", (event) => {
    logError(event.message, {
      stack: event.error?.stack,
      route: window.location.pathname,
      errorType: "frontend",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
    const stack = event.reason instanceof Error ? event.reason.stack : undefined;
    logError(message, { stack, route: window.location.pathname, errorType: "frontend" });
  });
}
