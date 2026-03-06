import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Auth check ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    const sb = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await sb.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return jsonResponse({ error: "AI service not configured" }, 500);

    // ── Fetch user brand data ──
    const { data: brand } = await sb
      .from("brands")
      .select("id, name, current_step")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!brand) return jsonResponse({ insights: [], message: "Kein Brand gefunden. Erstelle zuerst eine Marke." });

    const brandId = brand.id;

    // Fetch all relevant data in parallel
    const [financialRes, profileRes, strategicRes, complianceRes, productionRes, launchRes] = await Promise.all([
      sb.from("financial_models").select("*").eq("brand_id", brandId).single(),
      sb.from("brand_profiles").select("*").eq("brand_id", brandId).single(),
      sb.from("strategic_scores").select("*").eq("brand_id", brandId).single(),
      sb.from("compliance_scores").select("*").eq("brand_id", brandId).single(),
      sb.from("production_plans").select("*").eq("brand_id", brandId).single(),
      sb.from("launch_plans").select("*").eq("brand_id", brandId).single(),
    ]);

    const financial = financialRes.data;
    const profile = profileRes.data;
    const strategic = strategicRes.data;
    const compliance = complianceRes.data;
    const production = productionRes.data;
    const launch = launchRes.data;

    // Build context for AI
    const dataContext = `
BRAND DATA:
- Name: ${brand.name}
- Phase: ${brand.current_step}/5
- Kategorie: ${profile?.product_category || "Nicht festgelegt"}
- Zielgruppe: ${profile?.target_audience || "Nicht festgelegt"}
- Budget: ${profile?.budget || "Nicht festgelegt"}
- Land: ${profile?.country || "DE"}

FINANZEN:
- Marge: ${financial?.margin ?? "Nicht berechnet"}%
- Produktionskosten: €${financial?.production_cost ?? "?"}
- Empfohlener Preis: €${financial?.recommended_price ?? "?"}
- Break-even: ${financial?.break_even_units ?? "?"} Stück
- Marketing-Budget: €${financial?.marketing_budget ?? "?"}

STRATEGIE:
- Execution Score: ${strategic?.execution_score ?? "?"}
- Supplier Risk: ${strategic?.supplier_risk_score ?? "?"}
- Cash Runway: ${strategic?.cash_runway_months ?? "?"} Monate
- Capital Burn: €${strategic?.capital_burn_monthly ?? "?"}/Monat
- Launch Probability: ${strategic?.launch_probability ?? "?"}%

COMPLIANCE:
- Score: ${compliance?.overall_score ?? "?"}%
- Gewerbeanmeldung: ${compliance?.gewerbeanmeldung ? "✓" : "✗"}
- VerpackG: ${compliance?.verpackg_registered ? "✓" : "✗"}
- DSGVO: ${compliance?.dsgvo_assessment ? "✓" : "✗"}

PRODUKTION:
- Region: ${production?.production_region ?? "?"}
- Kategorie: ${production?.product_category ?? "?"}
- MOQ: ${production?.moq_expectation ?? "?"}

LAUNCH:
- Kanal: ${launch?.sales_channel ?? "?"}
- Menge: ${launch?.launch_quantity ?? "?"}
- Readiness: ${launch?.launch_readiness_score ?? "?"}%
`;

    const systemPrompt = `Du bist ein Senior Private-Label-Analyst. Analysiere die Daten eines Gründers und generiere 3-5 datenbasierte, priorisierte und UMSETZBARE Smart Insights.

REGELN:
1. Jeder Insight MUSS sich auf konkrete Zahlen des Nutzers beziehen
2. Jeder Insight braucht eine klare Handlungsanweisung
3. Priorisiere nach €-Impact und Dringlichkeit
4. Insights müssen SPEZIFISCH sein, nicht generisch
5. Kategorisiere jeden Insight: risk, opportunity, optimization, compliance, growth
6. Bewerte den €-Impact wo möglich
7. Antworte NUR mit dem Tool Call`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analysiere diese Brand-Daten und generiere Smart Insights:\n\n${dataContext}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_insights",
            description: "Return prioritized smart insights based on brand data",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Kurzer, prägnanter Titel auf Deutsch" },
                      description: { type: "string", description: "Detaillierte Erklärung mit konkreten Zahlen, 2-3 Sätze" },
                      category: { type: "string", enum: ["risk", "opportunity", "optimization", "compliance", "growth"] },
                      priority: { type: "string", enum: ["critical", "high", "medium"] },
                      impact_eur: { type: "number", description: "Geschätzter €-Impact (positiv = Einsparung/Gewinn)" },
                      action: { type: "string", description: "Konkrete nächste Handlung, 1 Satz" },
                      metric_reference: { type: "string", description: "Welche Kennzahl betroffen ist, z.B. 'Marge', 'Runway'" },
                    },
                    required: ["title", "description", "category", "priority", "action", "metric_reference"],
                    additionalProperties: false,
                  },
                },
                overall_health: {
                  type: "string",
                  enum: ["critical", "fragile", "stable", "strong"],
                  description: "Gesamtbewertung der Markengesundheit",
                },
                summary: {
                  type: "string",
                  description: "1-Satz Executive Summary auf Deutsch",
                },
              },
              required: ["insights", "overall_health", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return jsonResponse({ error: "Rate limit erreicht. Bitte versuche es später erneut." }, 429);
      if (response.status === 402) return jsonResponse({ error: "AI-Credits aufgebraucht." }, 402);
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return jsonResponse({ error: "AI gateway error" }, 500);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return jsonResponse({ error: "AI returned unexpected format" }, 500);
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return jsonResponse({ error: "AI returned invalid data" }, 500);
    }

    return jsonResponse(parsed);
  } catch (err) {
    console.error("[ai-smart-insights]", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
