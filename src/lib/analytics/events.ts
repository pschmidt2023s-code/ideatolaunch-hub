import { supabase } from "@/integrations/supabase/client";
import { isTrackingAllowed } from "./consent";
import { getSessionId } from "./session";

// ── Event types ─────────────────────────────────────────────
export type EventName =
  | "app_opened"
  | "signup_completed"
  | "onboarding_finished"
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
  | "feature_locked_seen"
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
    // Silent fail
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
