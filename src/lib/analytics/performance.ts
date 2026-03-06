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

// ── Page load tracking ──────────────────────────────────────
export function trackPageLoad() {
  if (typeof window === "undefined") return;
  window.addEventListener(
    "load",
    () => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        const loadTime = Math.round(nav.loadEventEnd - nav.startTime);
        if (loadTime > 1500) {
          trackEvent("page_load_time", { duration_ms: loadTime, url: window.location.pathname });
        }
      }
    },
    { once: true }
  );
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
    const message =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason);
    const stack =
      event.reason instanceof Error ? event.reason.stack : undefined;
    logError(message, { stack, route: window.location.pathname, errorType: "frontend" });
  });
}
