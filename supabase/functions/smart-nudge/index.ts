import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/email.ts";
import { wrapLayout } from "../_shared/email-layout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Missing Supabase config");

    const sb = createClient(url, key);

    // Find users who signed up but haven't progressed
    const threeDaysAgo = new Date(Date.now() - 3 * 86400_000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

    // Get all brands with their users
    const { data: brands, error: brandsErr } = await sb
      .from("brands")
      .select("id, user_id, name, current_step, updated_at")
      .lt("updated_at", threeDaysAgo);

    if (brandsErr) throw brandsErr;
    if (!brands || brands.length === 0) {
      return new Response(JSON.stringify({ nudged: 0, message: "No inactive users" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let nudgeCount = 0;

    for (const brand of brands) {
      try {
        // Don't nudge completed users
        if (brand.current_step >= 5) continue;

        // Get user email
        const { data: { user }, error: userErr } = await sb.auth.admin.getUserById(brand.user_id);
        if (userErr || !user?.email) continue;

        // Check if we already nudged recently (using analytics)
        const { data: recentNudge } = await sb
          .from("analytics_events")
          .select("id")
          .eq("user_id", brand.user_id)
          .eq("event_name", "nudge_sent")
          .gt("created_at", sevenDaysAgo)
          .limit(1);

        if (recentNudge && recentNudge.length > 0) continue;

        // Determine nudge type based on step
        const stepLabels: Record<number, { title: string; action: string; tip: string }> = {
          1: {
            title: "Deine Geschäftsidee wartet!",
            action: "Idee & Foundation abschließen",
            tip: "Die meisten erfolgreichen Gründer definieren ihre Positionierung in den ersten 48 Stunden.",
          },
          2: {
            title: "Dein Finanzplan braucht dich",
            action: "Economic Modeling starten",
            tip: "Gründer, die ihre Break-even-Punkte kennen, starten 3x schneller.",
          },
          3: {
            title: "Produktion wartet auf dich",
            action: "Sourcing & Produktion planen",
            tip: "Die richtige Lieferantenwahl spart durchschnittlich 22% der Produktionskosten.",
          },
          4: {
            title: "Fast geschafft – Compliance!",
            action: "Compliance-Check abschließen",
            tip: "85% der Compliance-Probleme lassen sich in unter 2 Stunden lösen.",
          },
        };

        const nudge = stepLabels[brand.current_step] || stepLabels[1];

        const bodyHtml = `
          <h1>${nudge.title}</h1>
          <p>Hi – deine Marke <strong>${brand.name}</strong> wartet auf dich in Phase ${brand.current_step}/5.</p>
          
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid #f59e0b;">
            <p style="margin:0;font-size:14px;color:#71717a;">💡 <strong>Wusstest du?</strong></p>
            <p style="margin:8px 0 0;font-size:14px;">${nudge.tip}</p>
          </div>

          <a href="https://ideatolaunch-hub.lovable.app/#/dashboard/step/${brand.current_step}" class="cta">${nudge.action} →</a>

          <p class="note">Du erhältst diese E-Mail, weil dein Fortschritt seit ${Math.round((Date.now() - new Date(brand.updated_at).getTime()) / 86400_000)} Tagen pausiert.</p>
        `;

        const success = await sendEmail({
          to: user.email,
          subject: `🔔 ${nudge.title} – ${brand.name}`,
          html: wrapLayout(bodyHtml, "de"),
          text: `${nudge.title}\n\nDeine Marke ${brand.name} wartet in Phase ${brand.current_step}/5.\n\n${nudge.tip}\n\nWeiter: https://ideatolaunch-hub.lovable.app/#/dashboard/step/${brand.current_step}`,
        });

        if (success) {
          nudgeCount++;
          // Track the nudge
          await sb.from("analytics_events").insert({
            user_id: brand.user_id,
            event_name: "nudge_sent",
            metadata: { step: brand.current_step, brand_name: brand.name },
          });
        }
      } catch (userError) {
        console.error(`[smart-nudge] Error for user ${brand.user_id}:`, userError);
      }
    }

    return new Response(JSON.stringify({ nudged: nudgeCount, total: brands.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[smart-nudge] Fatal error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
