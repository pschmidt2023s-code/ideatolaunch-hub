import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const start = Date.now();
  const checks: Record<string, { status: string; latency_ms: number; details?: string }> = {};

  // 1. Database connectivity
  try {
    const dbStart = Date.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { count, error } = await supabase
      .from("brands")
      .select("id", { count: "exact", head: true });
    checks.database = {
      status: error ? "degraded" : "healthy",
      latency_ms: Date.now() - dbStart,
      ...(error && { details: error.message }),
    };
  } catch (e) {
    checks.database = { status: "down", latency_ms: Date.now() - start, details: String(e) };
  }

  // 2. Auth service
  try {
    const authStart = Date.now();
    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/settings`, {
      headers: { apikey: Deno.env.get("SUPABASE_ANON_KEY")! },
    });
    checks.auth = {
      status: res.ok ? "healthy" : "degraded",
      latency_ms: Date.now() - authStart,
    };
  } catch (e) {
    checks.auth = { status: "down", latency_ms: 0, details: String(e) };
  }

  // 3. Edge Functions runtime
  checks.edge_functions = {
    status: "healthy",
    latency_ms: 0,
    details: `Deno ${Deno.version.deno}`,
  };

  // 4. Recent error rate (last hour)
  try {
    const errStart = Date.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count } = await supabase
      .from("error_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", oneHourAgo);
    checks.error_rate = {
      status: (count ?? 0) > 50 ? "degraded" : "healthy",
      latency_ms: Date.now() - errStart,
      details: `${count ?? 0} errors in last hour`,
    };
  } catch {
    checks.error_rate = { status: "unknown", latency_ms: 0 };
  }

  const overallStatus = Object.values(checks).some((c) => c.status === "down")
    ? "down"
    : Object.values(checks).some((c) => c.status === "degraded")
    ? "degraded"
    : "healthy";

  return new Response(
    JSON.stringify({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      total_latency_ms: Date.now() - start,
      checks,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: overallStatus === "down" ? 503 : 200,
    }
  );
});
