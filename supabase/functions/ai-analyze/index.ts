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

    const productDescription = typeof input.productDescription === "string" ? input.productDescription.trim() : "";
    if (!productDescription) return jsonResponse({ error: "productDescription is required" }, 400);
    if (productDescription.length > 5000) return jsonResponse({ error: "productDescription too long (max 5000 chars)" }, 400);

    const sanitize = (v: unknown, max = 500): string => {
      if (typeof v !== "string") return "Nicht angegeben";
      const s = v.trim();
      return s.length > max ? s.slice(0, max) : s || "Nicht angegeben";
    };

    const targetAudience = sanitize(input.targetAudience);
    const priceLevel = sanitize(input.priceLevel, 50);
    const country = sanitize(input.country, 100);
    const budget = sanitize(input.budget, 100);
    const timeline = sanitize(input.timeline, 50);

    const systemPrompt = `Du bist ein erfahrener Markenberater und Positionierungs-Experte für DTC/Private-Label-Marken im DACH-Raum.

ANALYSE-TIEFE:
- Positionierung: Nicht nur beschreiben WAS die Marke macht, sondern WHY sie existiert. Finde den emotionalen Kern.
- Markenwerte: Wähle Werte die sich von Wettbewerbern ABHEBEN, nicht generische wie "Qualität" oder "Innovation"
- Marktwinkel: Identifiziere eine UNBESETZTE Nische oder einen kontraintuitiven Ansatz
- Differenzierung: Nenne konkrete, messbare Unterscheidungsmerkmale, nicht vage Versprechen

QUALITÄTSKRITERIEN:
- Jeder Satz muss einen strategischen Zweck haben
- Vermeide Marketing-Floskeln und Buzzwords
- Beziehe dich auf reale Marktdynamiken im ${country}-Markt
- Berücksichtige das Budget von ${budget} und den Zeitrahmen von ${timeline}`;

    const userPrompt = `Analysiere diese Geschäftsidee:

Produkt: ${productDescription}
Zielgruppe: ${targetAudience}
Preissegment: ${priceLevel}
Land: ${country}
Budget: ${budget}
Zeitrahmen: ${timeline}`;

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
            name: "return_analysis",
            description: "Return brand positioning analysis",
            parameters: {
              type: "object",
              properties: {
                positioning: { type: "string", description: "Klares Positionierungs-Statement mit emotionalem Kern, 2-3 Sätze" },
                values: { type: "string", description: "3-5 differenzierende Markenwerte, kommagetrennt" },
                marketAngle: { type: "string", description: "Der einzigartige Marktwinkel mit konkreter Nische, 2-3 Sätze" },
                differentiation: { type: "string", description: "Messbare Unterscheidungsmerkmale vs. Wettbewerb, 2-3 Sätze" },
              },
              required: ["positioning", "values", "marketAngle", "differentiation"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return jsonResponse({ error: "Rate limit erreicht. Bitte versuche es später erneut." }, 429);
      if (response.status === 402) return jsonResponse({ error: "Guthaben aufgebraucht." }, 402);
      const t = await response.text();
      console.error("AI Gateway error:", response.status, t);
      return jsonResponse({ error: "AI analysis failed" }, 500);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) return jsonResponse({ error: "AI returned unexpected format" }, 500);

    let result;
    try { result = JSON.parse(toolCall.function.arguments); } catch { return jsonResponse({ error: "AI returned invalid data" }, 500); }

    return jsonResponse(result);
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
