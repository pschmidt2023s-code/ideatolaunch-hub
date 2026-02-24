import { supabase } from "@/integrations/supabase/client";

type EventName =
  | "user_signed_up"
  | "brand_created"
  | "entered_business_calculator"
  | "calculated_price"
  | "viewed_insights"
  | "clicked_upgrade"
  | "checkout_started"
  | "subscription_activated"
  | "step_completed"
  | "page_load_time"
  | "calculation_time";

export async function trackEvent(
  eventName: EventName,
  metadata: Record<string, unknown> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("analytics_events").insert([{
      user_id: user.id,
      event_name: eventName,
      metadata: metadata as any,
    }]);
  } catch {
    // Silent fail – observability should never break the app
  }
}

export async function logError(
  message: string,
  opts: { stack?: string; route?: string } = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("error_logs").insert([{
      user_id: user?.id ?? null,
      message,
      stack: opts.stack ?? null,
      route: opts.route ?? window.location.pathname,
    }]);
  } catch {
    // Silent fail
  }
}

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
    trackEvent("calculation_time", { label, duration_ms: duration });
  }

  return result;
}

/** Install global error listeners – call once at app startup */
export function installGlobalErrorHandler() {
  window.addEventListener("error", (event) => {
    logError(event.message, {
      stack: event.error?.stack,
      route: window.location.pathname,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason);
    const stack =
      event.reason instanceof Error ? event.reason.stack : undefined;
    logError(message, { stack, route: window.location.pathname });
  });
}
