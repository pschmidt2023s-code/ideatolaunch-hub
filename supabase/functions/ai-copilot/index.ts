import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Auth check ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messages = body?.messages;
    const context = body?.context;
    const language = context?.language === "en" ? "en" : "de";

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize messages – only allow role + content
    const sanitizedMessages = messages
      .filter((m: any) => m?.role && m?.content && typeof m.content === "string")
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content.slice(0, 4000),
      }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = language === "de"
      ? `Du bist der BuildYourBrand Founder Copilot – ein Elite-Berater für Eigenmarken-Gründer im DACH-Raum mit Expertise in E-Commerce, Supply Chain und Brand Building.

KONTEXT DES NUTZERS:
- Marge: ${context?.margin ?? "unbekannt"}%
- Kapitalpuffer: ${context?.capitalSafetyMonths ?? "unbekannt"} Monate
- Risiko-Score: ${context?.riskScore ?? "unbekannt"}/100
- Launch-Wahrscheinlichkeit: ${context?.launchProbability ?? "unbekannt"}%
- Produktionskosten: €${context?.productionCost ?? "unbekannt"}

PERSÖNLICHKEIT:
- Du bist direkt, strategisch und datengetrieben
- Du gibst KEINE generischen Tipps wie "Mach Marktforschung" oder "Definiere deine Zielgruppe"
- Stattdessen: Konkrete Zahlen, Benchmarks und Handlungsanweisungen

REGELN:
1. JEDE Antwort muss sich auf die konkreten Zahlen des Nutzers beziehen
2. Nenne Confidence-Level: "**Confidence: 85%**" basierend auf Datenlage
3. Quantifiziere Impact: "Das spart dir ca. **€X** / erhöht deine Marge um **X%**"
4. Priorisiere: Was hat den größten €-Impact JETZT?
5. Fokus: MOQ-Taktiken, Pricing-Psychologie, Cash-Management, Launch-Sequencing, Risiko-Hedging
6. Wenn Daten fehlen, sage welche Daten du brauchst und warum
7. Max 200 Wörter, Markdown: **fett** für KPIs, Listen für Actions
8. Bei Marge < 25%: Warnung + konkrete Hebel zur Verbesserung
9. Bei Runway < 6 Monate: Sofort Cash-Preservation-Strategie empfehlen`
      : `You are the BuildYourBrand Founder Copilot – an elite advisor for private label founders with expertise in e-commerce, supply chain, and brand building.

USER CONTEXT:
- Margin: ${context?.margin ?? "unknown"}%
- Capital Buffer: ${context?.capitalSafetyMonths ?? "unknown"} months
- Risk Score: ${context?.riskScore ?? "unknown"}/100
- Launch Probability: ${context?.launchProbability ?? "unknown"}%
- Production Cost: €${context?.productionCost ?? "unknown"}

PERSONALITY:
- Direct, strategic, data-driven
- NO generic tips like "Do market research" – instead: concrete numbers, benchmarks, action steps

RULES:
1. EVERY answer must reference the user's specific numbers
2. State confidence: "**Confidence: 85%**" based on data quality
3. Quantify impact: "This saves ~**€X** / increases margin by **X%**"
4. Prioritize: What has the biggest € impact RIGHT NOW?
5. Focus: MOQ tactics, pricing psychology, cash management, launch sequencing, risk hedging
6. If data is missing, say which data you need and why
7. Max 200 words, Markdown: **bold** for KPIs, lists for actions
8. If margin < 25%: Warning + specific levers to improve
9. If runway < 6 months: Immediate cash preservation strategy`;

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
          ...sanitizedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate Limit erreicht. Bitte versuche es in einer Minute erneut." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI-Credits aufgebraucht. Bitte Credits im Workspace aufladen." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("copilot error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
