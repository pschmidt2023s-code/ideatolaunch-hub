import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendEmail } from "../_shared/email.ts";
import { wrapLayout } from "../_shared/email-layout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Missing Supabase config");

    const sb = createClient(url, key);

    // Get all users with active paid subscriptions
    const { data: subs, error: subErr } = await sb
      .from("subscriptions")
      .select("user_id, status")
      .neq("status", "free");

    if (subErr) throw subErr;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No paid users" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const sub of subs) {
      try {
        // Get user email
        const { data: { user }, error: userErr } = await sb.auth.admin.getUserById(sub.user_id);
        if (userErr || !user?.email) continue;

        // Get user's brand
        const { data: brand } = await sb
          .from("brands")
          .select("id, name, current_step")
          .eq("user_id", sub.user_id)
          .limit(1)
          .single();

        if (!brand) continue;

        // Get financial data
        const { data: financial } = await sb
          .from("financial_models")
          .select("margin, break_even_units, production_cost, recommended_price")
          .eq("brand_id", brand.id)
          .single();

        // Get strategic scores
        const { data: strategic } = await sb
          .from("strategic_scores")
          .select("execution_score, supplier_risk_score, cash_runway_months, capital_burn_monthly")
          .eq("brand_id", brand.id)
          .single();

        // Get compliance
        const { data: compliance } = await sb
          .from("compliance_scores")
          .select("overall_score")
          .eq("brand_id", brand.id)
          .single();

        // Calculate a simple risk index
        const margin = financial?.margin ?? 0;
        const runway = strategic?.cash_runway_months ?? 0;
        const execution = strategic?.execution_score ?? 0;
        const complianceScore = compliance?.overall_score ?? 0;
        const supplierRisk = strategic?.supplier_risk_score ?? 0;

        const riskIndex = Math.min(100, Math.max(0, Math.round(
          (margin * 0.25) + (Math.min(runway * 5, 25)) + (execution * 0.2) + (complianceScore * 0.15) + ((100 - supplierRisk) * 0.15)
        )));

        const riskLabel = riskIndex >= 70 ? "🟢 Stabil" : riskIndex >= 40 ? "🟡 Fragil" : "🔴 Gefährdet";
        const runwayText = runway > 0 ? `${runway} Monate` : "Nicht berechnet";

        // Determine top blocker
        const blockers: string[] = [];
        if (margin < 30) blockers.push("Marge unter 30%");
        if (supplierRisk > 60) blockers.push("Hohes Lieferantenrisiko");
        if (complianceScore < 50) blockers.push("Compliance unvollständig");
        if (execution < 40) blockers.push("Niedriger Execution Score");
        if (runway < 6) blockers.push("Runway unter 6 Monaten");

        const topBlocker = blockers.length > 0 ? blockers[0] : "Keine kritischen Blocker";

        // Determine next action
        const nextAction = brand.current_step <= 2
          ? "Break-even validieren und Finanzdaten vervollständigen"
          : brand.current_step <= 3
            ? "Lieferanten-Backup sichern und Muster bestellen"
            : brand.current_step <= 4
              ? "Compliance-Checkliste abschließen"
              : "Launch-Roadmap finalisieren";

        const bodyHtml = `
          <h1>Dein wöchentlicher CEO Briefing</h1>
          <p>Hi – hier ist dein wöchentliches Update für <strong>${brand.name}</strong>.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:16px;background:#f9fafb;border-radius:8px 8px 0 0;border-bottom:1px solid #e4e4e7;">
                <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#71717a;font-weight:600;">Founder Risk Index</span><br>
                <span style="font-size:36px;font-weight:700;color:${riskIndex >= 70 ? '#22c55e' : riskIndex >= 40 ? '#f59e0b' : '#ef4444'};">${riskIndex}</span>
                <span style="font-size:16px;color:#71717a;"> / 100</span>
                <span style="margin-left:12px;font-size:14px;">${riskLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px;background:#f9fafb;border-bottom:1px solid #e4e4e7;">
                <strong>Runway:</strong> ${runwayText}<br>
                <strong>Marge:</strong> ${margin}%<br>
                <strong>Phase:</strong> ${brand.current_step} / 5
              </td>
            </tr>
            <tr>
              <td style="padding:16px;background:#f9fafb;border-bottom:1px solid #e4e4e7;">
                <strong>Top Blocker:</strong> ${topBlocker}
              </td>
            </tr>
            <tr>
              <td style="padding:16px;background:#f9fafb;border-radius:0 0 8px 8px;">
                <strong>Nächste Action:</strong> ${nextAction}
              </td>
            </tr>
          </table>

          <a href="https://ideatolaunch-hub.lovable.app/#/dashboard/command" class="cta">Command Center öffnen</a>

          <p class="note">Dieses Briefing wird jeden Montag automatisch erstellt, basierend auf deinen aktuellen Daten.</p>
        `;

        const textVersion = `CEO Briefing – ${brand.name}\n\nRisk Index: ${riskIndex}/100 (${riskLabel})\nRunway: ${runwayText}\nMarge: ${margin}%\nPhase: ${brand.current_step}/5\nTop Blocker: ${topBlocker}\nNächste Action: ${nextAction}`;

        const success = await sendEmail({
          to: user.email,
          subject: `📊 CEO Briefing: Risk Index ${riskIndex}/100 – ${brand.name}`,
          html: wrapLayout(bodyHtml, "de"),
          text: textVersion,
        });

        if (success) sentCount++;
      } catch (userError) {
        console.error(`[ceo-briefing] Error for user ${sub.user_id}:`, userError);
      }
    }

    return new Response(JSON.stringify({ sent: sentCount, total: subs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ceo-briefing] Fatal error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
