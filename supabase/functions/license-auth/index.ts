import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, corsResponse } from "../_shared/edge-utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const { license_key } = await req.json();
    if (!license_key || typeof license_key !== "string" || license_key.trim().length < 5) {
      return jsonResponse({ error: "Ungültiger Lizenzschlüssel" }, 400);
    }

    const key = license_key.trim().toUpperCase();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Check licenses table
    let { data: license } = await supabaseAdmin
      .from("licenses")
      .select("*")
      .eq("license_key", key)
      .eq("status", "active")
      .maybeSingle();

    // 2. Fallback: check license_invitations table
    let invitation = null;
    if (!license) {
      const { data: inv } = await supabaseAdmin
        .from("license_invitations")
        .select("*")
        .eq("license_key", key)
        .eq("status", "active")
        .maybeSingle();
      invitation = inv;
    }

    if (!license && !invitation) {
      return jsonResponse({ error: "Lizenzschlüssel nicht gefunden oder inaktiv" }, 404);
    }

    // Check expiry
    const record = license || invitation;
    if (record?.expires_at && new Date(record.expires_at) < new Date()) {
      return jsonResponse({ error: "Lizenz abgelaufen" }, 410);
    }

    const tier = license?.tier || invitation?.plan || "starter";
    const email = `license-${key.toLowerCase().replace(/[^a-z0-9]/g, "")}@brandos.local`;
    const password = `lic_${key}_${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.slice(-8)}`;

    // Try to sign in first
    let { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // User doesn't exist yet — create
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { license_key: key, tier, auth_type: "license" },
      });

      if (createError) {
        console.error("[license-auth] createUser error:", createError.message);
        return jsonResponse({ error: "Benutzer konnte nicht erstellt werden" }, 500);
      }

      // Sign in the newly created user
      const { data: freshSign, error: freshErr } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (freshErr || !freshSign.session) {
        return jsonResponse({ error: "Session konnte nicht erstellt werden" }, 500);
      }

      signInData = freshSign;

      // Link license to user
      if (license) {
        await supabaseAdmin.from("licenses").update({
          user_id: newUser.user!.id,
          activated_at: new Date().toISOString(),
          email: email,
        }).eq("id", license.id);
      }
      if (invitation) {
        await supabaseAdmin.from("license_invitations").update({
          used_by: newUser.user!.id,
          used_at: new Date().toISOString(),
          status: "used",
        }).eq("id", invitation.id);
      }

      // Create profile + subscription
      await supabaseAdmin.from("profiles").upsert({
        user_id: newUser.user!.id,
        completed_starter_mode: false,
      }, { onConflict: "user_id" });

      await supabaseAdmin.from("subscriptions").upsert({
        user_id: newUser.user!.id,
        status: tier,
        license_key: key,
      }, { onConflict: "user_id" });
    }

    if (!signInData?.session) {
      return jsonResponse({ error: "Authentifizierung fehlgeschlagen" }, 401);
    }

    return jsonResponse({
      session: signInData.session,
      tier,
      license_key: key,
    });
  } catch (e) {
    console.error("[license-auth] Error:", e.message);
    return jsonResponse({ error: e.message || "Interner Fehler" }, 500);
  }
});
