import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Not authenticated" }, 401);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data, error: claimsError } = await supabaseClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !data?.claims) return jsonResponse({ error: "Not authenticated" }, 401);

    if (!LOVABLE_API_KEY) return jsonResponse({ error: "AI service not configured" }, 500);

    let input: Record<string, unknown>;
    try { input = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }

    const brandName = typeof input.brandName === "string" ? input.brandName.trim() : "";
    const category = typeof input.category === "string" ? input.category.trim() : "";
    const tone = typeof input.tone === "string" ? input.tone.trim() : "";

    if (!brandName || brandName.length < 2) return jsonResponse({ error: "Brand name must be at least 2 characters" }, 400);

    const handleClean = brandName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

    const systemPrompt = `Du bist ein Brand-Intelligence-Analyst mit Expertise in Markenrecht, SEO und Digital Marketing für den DACH-Raum.

ANALYSE-STANDARDS:
- Domain-Einschätzung: Berücksichtige Namenslänge, Sprachspezifik, Branchenüblichkeit und bekannte Domain-Squatting-Muster
- Trademark: Recherchiere gegen bekannte EU-/DACH-Marken in der Kategorie "${category || "Consumer Goods"}"
- SEO: Bewerte basierend auf Suchvolumen-Schätzungen und Wettbewerbsdichte für "${brandName}" als Brand-Keyword
- Social: Berücksichtige die Popularität des Handle-Formats "@${handleClean}" auf Instagram/TikTok
- Rebranding nur vorschlagen wenn Score < 50, dann aber mit strategischer Begründung

Sei EHRLICH in deiner Bewertung. Überbewerte nicht – ein Score von 60-75 ist für die meisten realistischen Namen normal.`;

    const userPrompt = `Analysiere den Markennamen "${brandName}" für die Kategorie "${category || "Consumer Goods"}" mit Tonalität "${tone || "Professionell"}".`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_intelligence",
            description: "Return brand intelligence analysis results",
            parameters: {
              type: "object",
              properties: {
                legitimacy_score: { type: "number", description: "Gesamtbewertung 0-100" },
                domains: {
                  type: "object",
                  properties: {
                    de: { type: "string", enum: ["likely_available", "likely_taken", "uncertain"] },
                    com: { type: "string", enum: ["likely_available", "likely_taken", "uncertain"] },
                  },
                  required: ["de", "com"],
                  additionalProperties: false,
                },
                social: {
                  type: "object",
                  properties: {
                    instagram: { type: "string", enum: ["likely_available", "likely_taken", "uncertain"] },
                    tiktok: { type: "string", enum: ["likely_available", "likely_taken", "uncertain"] },
                  },
                  required: ["instagram", "tiktok"],
                  additionalProperties: false,
                },
                trademark: {
                  type: "object",
                  properties: {
                    risk_level: { type: "string", enum: ["low", "medium", "high"] },
                    similar_brands: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          similarity: { type: "number" },
                        },
                        required: ["name", "similarity"],
                        additionalProperties: false,
                      },
                    },
                    warning: { type: "string", description: "Warnung oder null wenn kein Risiko" },
                  },
                  required: ["risk_level", "similar_brands", "warning"],
                  additionalProperties: false,
                },
                seo: {
                  type: "object",
                  properties: {
                    competition: { type: "string", enum: ["low", "medium", "high"] },
                    difficulty_score: { type: "number" },
                    explanation: { type: "string" },
                  },
                  required: ["competition", "difficulty_score", "explanation"],
                  additionalProperties: false,
                },
                rebranding_suggestions: {
                  type: "array",
                  items: { type: "string" },
                  description: "3 alternative Namen nur wenn Score < 50",
                },
                summary: { type: "string", description: "Strategische Zusammenfassung auf Deutsch, 2-3 Sätze" },
              },
              required: ["legitimacy_score", "domains", "social", "trademark", "seo", "rebranding_suggestions", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_intelligence" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return jsonResponse({ error: "Rate limit erreicht." }, 429);
      if (response.status === 402) return jsonResponse({ error: "Guthaben aufgebraucht." }, 402);
      const t = await response.text();
      console.error("AI Gateway error:", response.status, t);
      return jsonResponse({ error: "AI service error" }, 500);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) return jsonResponse({ error: "AI returned unexpected format" }, 500);

    let result;
    try { result = JSON.parse(toolCall.function.arguments); } catch { return jsonResponse({ error: "AI returned invalid data" }, 500); }

    return jsonResponse({ result });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
