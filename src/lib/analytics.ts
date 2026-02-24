import { supabase } from "@/integrations/supabase/client";

// ── Session ID ──────────────────────────────────────────────
let _sessionId: string | null = null;

function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  return _sessionId;
}

/** Reset session (call on login) */
export function resetSession() {
  _sessionId = null;
}

// ── Event types ─────────────────────────────────────────────
type EventName =
  | "user_signed_up"
  | "first_brand_created"
  | "brand_created"
  | "entered_business_calculator"
  | "calculated_price"
  | "viewed_insights"
  | "clicked_upgrade"
  | "checkout_started"
  | "subscription_started"
  | "subscription_canceled"
  | "subscription_activated"
  | "step_completed"
  | "idea_completed"
  | "calculator_completed"
  | "production_completed"
  | "step_abandoned"
  | "page_load_time"
  | "calculation_time"
  | "performance_warning";

// ── Core tracking ───────────────────────────────────────────
export async function trackEvent(
  eventName: EventName,
  metadata: Record<string, unknown> = {}
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("analytics_events").insert([
      {
        user_id: user.id,
        event_name: eventName,
        metadata: metadata as any,
        session_id: getSessionId(),
      },
    ]);
  } catch {
    // Silent fail – observability should never break the app
  }
}

// ── Error logging ───────────────────────────────────────────
type ErrorType = "frontend" | "api" | "validation" | "performance";

export async function logError(
  message: string,
  opts: {
    stack?: string;
    route?: string;
    errorType?: ErrorType;
    metadata?: Record<string, unknown>;
  } = {}
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("error_logs").insert([
      {
        user_id: user?.id ?? null,
        message,
        stack: opts.stack ?? null,
        route: opts.route ?? window.location.pathname,
        error_type: opts.errorType ?? "frontend",
        metadata: (opts.metadata ?? {}) as any,
        session_id: getSessionId(),
      },
    ]);
  } catch {
    // Silent fail
  }
}

// ── Performance tracking ────────────────────────────────────
/** Measure an async operation; logs if it exceeds threshold (default 800ms) */
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
let _currentStep: number | null = null;

export function startStepTimer(step: number) {
  clearStepTimer();
  _currentStep = step;
  _abandonTimer = setTimeout(() => {
    trackEvent("step_abandoned", { step, after_minutes: 15 });
  }, 15 * 60 * 1000); // 15 minutes
}

export function clearStepTimer() {
  if (_abandonTimer) {
    clearTimeout(_abandonTimer);
    _abandonTimer = null;
  }
  _currentStep = null;
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
