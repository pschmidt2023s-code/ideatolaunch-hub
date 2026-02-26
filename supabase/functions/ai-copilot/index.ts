import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Du bist der BuildYourBrand Founder Copilot – ein strategischer Berater für Eigenmarken-Gründer im DACH-Raum.

KONTEXT DES NUTZERS:
- Marge: ${context?.margin ?? "unbekannt"}%
- Kapitalpuffer: ${context?.capitalSafetyMonths ?? "unbekannt"} Monate
- Risiko-Score: ${context?.riskScore ?? "unbekannt"}/100
- Monatliche Burn Rate: €${context?.monthlyBurnRate ?? "unbekannt"}
- Launch-Wahrscheinlichkeit: ${context?.launchProbability ?? "unbekannt"}%
- MOQ: ${context?.moq ?? "unbekannt"} Einheiten
- Budget: €${context?.budget ?? "unbekannt"}
- Retourenquote: ${context?.returnRate ?? "unbekannt"}%

REGELN:
1. Gib konkrete, datenbasierte Empfehlungen basierend auf dem Nutzerkontext
2. Nenne immer den Confidence-Level deiner Empfehlung (z.B. "Confidence: 85%")
3. Erkläre die Auswirkungen quantitativ wenn möglich
4. Antworte auf Deutsch, außer der Nutzer schreibt auf Englisch
5. Fokussiere auf: MOQ-Verhandlung, Preisgestaltung, Budgetallokation, Launch-Timing, Risikominimierung
6. Vermeide generische Ratschläge – beziehe dich auf die konkreten Zahlen des Nutzers
7. Halte Antworten unter 200 Wörtern`;

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
          ...messages,
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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
