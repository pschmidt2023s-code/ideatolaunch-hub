import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { key, max_requests = 5, window_seconds = 60 } = body;

    if (!key || typeof key !== "string" || key.length > 200) {
      return new Response(
        JSON.stringify({ error: "Invalid key" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - window_seconds * 1000);

    // Try to get existing rate limit entry
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("key", key)
      .single();

    if (!existing) {
      // First request - create entry
      await supabase.from("rate_limits").insert({
        key,
        window_start: now.toISOString(),
        request_count: 1,
      });
      return new Response(
        JSON.stringify({ allowed: true, remaining: max_requests - 1 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const entryWindowStart = new Date(existing.window_start);

    if (entryWindowStart < windowStart) {
      // Window expired, reset
      await supabase
        .from("rate_limits")
        .update({ window_start: now.toISOString(), request_count: 1 })
        .eq("key", key);
      return new Response(
        JSON.stringify({ allowed: true, remaining: max_requests - 1 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existing.request_count >= max_requests) {
      const retryAfter = Math.ceil(
        (entryWindowStart.getTime() + window_seconds * 1000 - now.getTime()) / 1000
      );
      return new Response(
        JSON.stringify({ allowed: false, remaining: 0, retry_after: retryAfter }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // Increment counter
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("key", key);

    return new Response(
      JSON.stringify({ allowed: true, remaining: max_requests - existing.request_count - 1 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("rate-limit error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
