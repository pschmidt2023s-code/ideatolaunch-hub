import { supabase } from "@/integrations/supabase/client";

// ── Event Types ─────────────────────────────────────────────
export type FounderEvent =
  | "step_started"
  | "step_completed"
  | "guidance_opened"
  | "risk_generated"
  | "risk_resolved"
  | "upgrade_clicked"
  | "upgrade_completed"
  | "scenario_simulation_used";

interface TrackOpts {
  step?: number;
  plan?: string;
  riskLevel?: string;
  metadata?: Record<string, unknown>;
}

// ── Fire-and-forget event tracking ──────────────────────────
export function trackFounderEvent(event: FounderEvent, opts: TrackOpts = {}) {
  // Run async, never block UI
  void (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Resolve plan lazily from subscription table
      let plan = opts.plan;
      if (!plan) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();
        plan = sub?.status ?? "free";
      }

      await supabase.from("founder_analytics_events").insert({
        user_id: user.id,
        event_name: event,
        plan,
        step: opts.step ?? null,
        risk_level: opts.riskLevel ?? null,
        metadata: (opts.metadata ?? {}) as any,
      });
    } catch {
      // Silent – analytics must never break the app
    }
  })();
}

// ── Derived Metrics (admin helpers) ─────────────────────────

export interface StepDropOff {
  step: number;
  started: number;
  completed: number;
  dropOffPct: number;
}

export async function getStepDropOffRates(): Promise<StepDropOff[]> {
  const { data } = await supabase
    .from("founder_analytics_events")
    .select("event_name, step")
    .in("event_name", ["step_started", "step_completed"]);

  if (!data) return [];

  const map: Record<number, { started: number; completed: number }> = {};
  data.forEach((e) => {
    const s = e.step;
    if (s == null) return;
    if (!map[s]) map[s] = { started: 0, completed: 0 };
    if (e.event_name === "step_started") map[s].started++;
    if (e.event_name === "step_completed") map[s].completed++;
  });

  return Object.entries(map)
    .map(([step, v]) => ({
      step: Number(step),
      started: v.started,
      completed: v.completed,
      dropOffPct: v.started > 0 ? Math.round(((v.started - v.completed) / v.started) * 100) : 0,
    }))
    .sort((a, b) => a.step - b.step);
}

export async function getMostProblematicStep(): Promise<{ step: number; dropOffPct: number } | null> {
  const rates = await getStepDropOffRates();
  if (!rates.length) return null;
  return rates.reduce((worst, cur) => (cur.dropOffPct > worst.dropOffPct ? cur : worst));
}

export interface RiskFrequency {
  riskLevel: string;
  count: number;
}

export async function getMostFrequentRisks(): Promise<RiskFrequency[]> {
  const { data } = await supabase
    .from("founder_analytics_events")
    .select("risk_level")
    .eq("event_name", "risk_generated")
    .not("risk_level", "is", null);

  if (!data) return [];

  const map: Record<string, number> = {};
  data.forEach((e) => {
    const r = e.risk_level!;
    map[r] = (map[r] || 0) + 1;
  });

  return Object.entries(map)
    .map(([riskLevel, count]) => ({ riskLevel, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export interface UpgradeTrigger {
  source: string;
  count: number;
}

export async function getUpgradeTriggerSources(): Promise<UpgradeTrigger[]> {
  const { data } = await supabase
    .from("founder_analytics_events")
    .select("metadata, step")
    .eq("event_name", "upgrade_clicked");

  if (!data) return [];

  const map: Record<string, number> = {};
  data.forEach((e) => {
    const source = (e.metadata as any)?.source ?? `Step ${e.step ?? "?"}`;
    map[source] = (map[source] || 0) + 1;
  });

  return Object.entries(map)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export interface StepAvgTime {
  step: number;
  avgMinutes: number;
}

export async function getAverageCompletionTimePerStep(): Promise<StepAvgTime[]> {
  const { data } = await supabase
    .from("founder_analytics_events")
    .select("event_name, step, user_id, created_at")
    .in("event_name", ["step_started", "step_completed"])
    .order("created_at", { ascending: true });

  if (!data) return [];

  // Match start→complete per user per step
  const starts: Record<string, string> = {}; // key: `${userId}-${step}`
  const durations: Record<number, number[]> = {};

  data.forEach((e) => {
    const key = `${e.user_id}-${e.step}`;
    if (e.event_name === "step_started") {
      starts[key] = e.created_at;
    } else if (e.event_name === "step_completed" && starts[key]) {
      const mins = (new Date(e.created_at).getTime() - new Date(starts[key]).getTime()) / 60_000;
      if (mins > 0 && mins < 120) {
        if (!durations[e.step!]) durations[e.step!] = [];
        durations[e.step!].push(mins);
      }
      delete starts[key];
    }
  });

  return Object.entries(durations)
    .map(([step, times]) => ({
      step: Number(step),
      avgMinutes: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10,
    }))
    .sort((a, b) => a.step - b.step);
}

export interface PlanDistribution {
  plan: string;
  count: number;
}

export async function getPlanDistribution(): Promise<PlanDistribution[]> {
  const { data } = await supabase.from("subscriptions").select("status");
  if (!data) return [];

  const map: Record<string, number> = {};
  data.forEach((s) => {
    const p = s.status || "free";
    map[p] = (map[p] || 0) + 1;
  });

  return Object.entries(map)
    .map(([plan, count]) => ({ plan, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Admin check ─────────────────────────────────────────────
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}
