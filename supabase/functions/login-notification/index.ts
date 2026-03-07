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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { device_fingerprint, is_new_device } = body;

    // Only send notification for new devices
    if (!is_new_device) {
      return new Response(JSON.stringify({ sent: false, reason: "known_device" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set, skipping login notification");
      return new Response(JSON.stringify({ sent: false, reason: "no_email_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Send notification email
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BrandOS Security <security@buildyourbrand.app>",
        to: user.email,
        subject: "🔐 Neuer Login erkannt – BrandOS",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px;">
            <h2 style="color: #1a1a1a; margin-bottom: 16px;">Neuer Login erkannt</h2>
            <p style="color: #555; line-height: 1.6;">
              Ein neues Gerät hat sich soeben in deinen BrandOS-Account eingeloggt:
            </p>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="margin: 4px 0; color: #333;"><strong>Zeitpunkt:</strong> ${formattedDate}</p>
              <p style="margin: 4px 0; color: #333;"><strong>Geräte-ID:</strong> ${(device_fingerprint || "unbekannt").slice(0, 12)}…</p>
            </div>
            <p style="color: #555; line-height: 1.6;">
              Wenn du das warst, kannst du diese Nachricht ignorieren.
            </p>
            <p style="color: #d32f2f; line-height: 1.6; font-weight: 500;">
              Wenn du das NICHT warst, ändere bitte sofort dein Passwort und aktiviere 2FA in den Einstellungen.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">BrandOS Security · Automatische Benachrichtigung</p>
          </div>
        `,
      }),
    });

    // Log security event
    await supabase.from("security_events").insert({
      event_type: "new_device_login",
      user_id: user.id,
      metadata: {
        device_fingerprint: (device_fingerprint || "").slice(0, 16),
        email_sent: emailRes.ok,
      },
    });

    return new Response(
      JSON.stringify({ sent: emailRes.ok }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("login-notification error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
