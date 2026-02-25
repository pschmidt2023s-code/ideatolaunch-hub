import { supabase } from "@/integrations/supabase/client";

// ── Consent ─────────────────────────────────────────────────
const CONSENT_KEY = "analytics_consent";

export function getConsent(): boolean | null {
  const val = localStorage.getItem(CONSENT_KEY);
  if (val === "true") return true;
  if (val === "false") return false;
  return null; // not yet decided
}

export function setConsent(accepted: boolean) {
  localStorage.setItem(CONSENT_KEY, String(accepted));
}

function isTrackingAllowed(): boolean {
  return getConsent() === true;
}

// ── Session ID ──────────────────────────────────────────────
let _sessionId: string | null = null;

function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  return _sessionId;
}

export function resetSession() {
  _sessionId = null;
}

// ── Event types ─────────────────────────────────────────────
type EventName =
  | "app_opened"
  | "signup_completed"
  | "brand_created"
  | "first_brand_created"
  | "step_viewed"
  | "step_saved"
  | "step_completed"
  | "step_abandoned"
  | "guidance_opened"
  | "supplier_matches_viewed"
  | "scenario_simulation_used"
  | "pricing_viewed"
  | "upgrade_clicked"
  | "clicked_upgrade"
  | "clicked_smart_upgrade"
  | "checkout_started"
  | "checkout_success"
  | "subscription_started"
  | "subscription_canceled"
  | "subscription_activated"
  | "feature_locked_viewed"
  | "pdf_export_clicked"
  | "insight_viewed"
  | "viewed_insights"
  | "entered_business_calculator"
  | "calculated_price"
  | "idea_completed"
  | "calculator_completed"
  | "production_completed"
  | "page_load_time"
  | "calculation_time"
  | "performance_warning"
  | "user_signed_up";

// ── Core tracking ───────────────────────────────────────────
export async function trackEvent(
  eventName: EventName | string,
  metadata: Record<string, unknown> = {}
) {
  if (!isTrackingAllowed()) return;

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

/** Track event and also persist to founder_analytics_events for admin dashboard */
export async function trackCriticalEvent(
  eventName: string,
  metadata: Record<string, unknown> & { plan?: string; step?: number; riskLevel?: string }
) {
  if (!isTrackingAllowed()) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fire both in parallel
    await Promise.all([
      supabase.from("analytics_events").insert([
        {
          user_id: user.id,
          event_name: eventName,
          metadata: metadata as any,
          session_id: getSessionId(),
        },
      ]),
      supabase.from("founder_analytics_events").insert([
        {
          user_id: user.id,
          event_name: eventName,
          plan: metadata.plan ?? "free",
          step: metadata.step ?? null,
          risk_level: metadata.riskLevel ?? null,
          metadata: metadata as any,
        },
      ]),
    ]);
  } catch {
    // Silent fail
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
  // Always log errors regardless of consent (operational necessity)
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
