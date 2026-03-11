import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ valid: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from token
    const { data: { user }, error: authError } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { license_key } = body;

    // Strategy 1: Check by user_id (logged-in user)
    const { data: userLicense } = await supabaseAdmin
      .from("licenses")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Strategy 2: Check by license_key if provided (activation flow)
    let keyLicense = null;
    if (license_key && !userLicense) {
      const { data } = await supabaseAdmin
        .from("licenses")
        .select("*")
        .eq("license_key", license_key.trim().toUpperCase())
        .eq("status", "active")
        .maybeSingle();
      keyLicense = data;

      // If key exists and unassigned or belongs to this user, assign it
      if (keyLicense && (!keyLicense.user_id || keyLicense.user_id === user.id)) {
        await supabaseAdmin
          .from("licenses")
          .update({
            user_id: user.id,
            email: user.email,
            activated_at: keyLicense.activated_at || new Date().toISOString(),
          })
          .eq("id", keyLicense.id);

        keyLicense.user_id = user.id;
      }
    }

    const license = userLicense || keyLicense;

    if (!license) {
      // Also check legacy subscriptions table
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("status, license_key, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sub && sub.status !== "free") {
        // Log validation
        await logUsage(supabaseAdmin, null, user.id, "validated_legacy");

        return new Response(
          JSON.stringify({
            valid: true,
            tier: sub.status,
            license_key: sub.license_key,
            source: "subscription",
            expires_at: sub.current_period_end,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ valid: false, error: "Keine aktive Lizenz gefunden" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      await supabaseAdmin
        .from("licenses")
        .update({ status: "expired" })
        .eq("id", license.id);

      return new Response(
        JSON.stringify({ valid: false, error: "Lizenz abgelaufen", expired: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log validation
    await logUsage(supabaseAdmin, license.id, user.id, "validated");

    return new Response(
      JSON.stringify({
        valid: true,
        tier: license.tier,
        license_key: license.license_key,
        source: "license",
        expires_at: license.expires_at,
        max_devices: license.max_devices,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ valid: false, error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function logUsage(
  client: any,
  licenseId: string | null,
  userId: string,
  action: string
) {
  try {
    await client.from("license_usage_log").insert({
      license_id: licenseId,
      user_id: userId,
      action,
    });
  } catch {
    // non-critical
  }
}
