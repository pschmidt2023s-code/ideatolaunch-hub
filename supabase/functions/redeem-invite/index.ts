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

  try {
    const body = await req.json();
    const { token, short_code } = body;

    if (!token && !short_code) {
      return new Response(JSON.stringify({ error: "Token oder Code erforderlich" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } =
      await supabaseUser.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Find invitation by token OR short_code
    let query = supabaseAdmin
      .from("license_invitations")
      .select("*")
      .eq("status", "active");

    if (short_code) {
      query = query.eq("short_code", short_code.toUpperCase().trim());
    } else {
      query = query.eq("token", token);
    }

    const { data: invitation, error: invErr } = await query.maybeSingle();

    if (invErr || !invitation) {
      return new Response(
        JSON.stringify({ error: "Einladung nicht gefunden oder bereits verwendet" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      await supabaseAdmin
        .from("license_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);
      return new Response(
        JSON.stringify({ error: "Einladung abgelaufen" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert subscription for user
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingSub) {
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: invitation.plan,
          license_key: invitation.license_key,
          current_period_end: invitation.expires_at,
        })
        .eq("id", existingSub.id);
    } else {
      await supabaseAdmin.from("subscriptions").insert({
        user_id: userId,
        status: invitation.plan,
        license_key: invitation.license_key,
        current_period_end: invitation.expires_at,
      });
    }

    // Mark invitation as used
    await supabaseAdmin
      .from("license_invitations")
      .update({ status: "used", used_by: userId, used_at: new Date().toISOString() })
      .eq("id", invitation.id);

    // Audit log
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: invitation.created_by,
      affected_user_id: userId,
      action_type: "invite_redeemed",
      details: {
        plan: invitation.plan,
        license_key: invitation.license_key,
        method: short_code ? "short_code" : "token",
        short_code: invitation.short_code,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        plan: invitation.plan,
        license_key: invitation.license_key,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
