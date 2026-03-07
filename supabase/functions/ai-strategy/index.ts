import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

interface StrategyInput {
  margin: number;
  moq: number;
  budget: number;
  monthlyUnits: number;
  pricePerUnit: number;
  productionCost: number;
  marketingBudget: number;
  region: string;
  productCategory: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth check ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data, error: claimsError } = await supabaseClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !data?.claims) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return jsonResponse({ error: "LOVABLE_API_KEY not configured" }, 500);

    const input: StrategyInput = await req.json();

    const prompt = `Analysiere diese Geschäftsdaten eines Private-Label-Gründers:

DATEN:
- Marge: ${input.margin}% | MOQ: ${input.moq} Stk | Budget: €${input.budget}
- Absatz/Monat: ${input.monthlyUnits} Stk | VK-Preis: €${input.pricePerUnit} | EK-Preis: €${input.productionCost}
- Marketing: €${input.marketingBudget}/Monat | Region: ${input.region} | Kategorie: ${input.productCategory}

BERECHNE für jede Empfehlung:
- Break-even bei aktuellen Zahlen: ${input.budget} / (${input.pricePerUnit} - ${input.productionCost}) = ? Stück
- Customer Acquisition Cost (CAC): €${input.marketingBudget} / ${input.monthlyUnits} = ? pro Kunde
- Monatlicher Deckungsbeitrag: ${input.monthlyUnits} * (${input.pricePerUnit} - ${input.productionCost}) - ${input.marketingBudget}

Gib exakt 4 Empfehlungen:
1. PREIS: Preispsychologie-Taktik mit konkretem Preispunkt und erwartetem Margeneffekt
2. MOQ: Verhandlungsskript-Element + alternative Bestellstrategie (z.B. Split-Order)
3. BUDGET: Reallokation mit Prozentsätzen und erwartetem ROI pro Kanal
4. TIMING: Konkreter Launch-Kalender basierend auf Saisonalität der Kategorie "${input.productCategory}"

Jede Empfehlung MUSS einen €-Betrag als savings_potential nennen, basierend auf den obigen Berechnungen.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "Du bist ein Experte für Private-Label-Geschäftsberatung. Antworte immer auf Deutsch. Gib nur das JSON-Array zurück, keine andere Formatierung." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_recommendations",
            description: "Provide strategic recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string", enum: ["pricing", "moq", "budget", "timing"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      impact: { type: "string", enum: ["high", "medium", "low"] },
                      savings_potential: { type: "number" },
                    },
                    required: ["category", "title", "description", "impact", "savings_potential"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["recommendations"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ error: "Rate limit – bitte versuche es in einer Minute erneut." }, 429);
      }
      if (response.status === 402) {
        return jsonResponse({ error: "AI-Credits aufgebraucht." }, 402);
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return jsonResponse({ error: "AI gateway error" }, 500);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let recommendations = [];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      recommendations = parsed.recommendations || [];
    }

    return jsonResponse({ recommendations });
  } catch (err) {
    console.error("[ai-strategy]", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
