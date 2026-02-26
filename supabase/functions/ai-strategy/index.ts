import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const input: StrategyInput = await req.json();

    const prompt = `Du bist ein erfahrener Private-Label-Berater für den deutschen Markt. Analysiere diese Geschäftsdaten und gib konkrete, umsetzbare Empfehlungen:

Geschäftsdaten:
- Marge: ${input.margin}%
- MOQ (Mindestbestellmenge): ${input.moq} Stück
- Budget: ${input.budget}€
- Monatliche Absatzmenge: ${input.monthlyUnits} Stück
- Verkaufspreis: ${input.pricePerUnit}€
- Produktionskosten: ${input.productionCost}€ pro Stück
- Marketingbudget: ${input.marketingBudget}€/Monat
- Region: ${input.region}
- Produktkategorie: ${input.productCategory}

Gib genau 4 Empfehlungen in diesen Kategorien:
1. PREIS: Eine konkrete Preisstrategie-Empfehlung
2. MOQ: Eine MOQ-Verhandlungsempfehlung
3. BUDGET: Eine Budget-Reallokationsempfehlung
4. TIMING: Eine Launch-Timing-Empfehlung

Format: Jede Empfehlung als JSON-Objekt mit "category", "title", "description", "impact" (high/medium/low), "savings_potential" (geschätzter €-Betrag).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
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
        return new Response(JSON.stringify({ error: "Rate limit – bitte versuche es in einer Minute erneut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI-Credits aufgebraucht." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let recommendations = [];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      recommendations = parsed.recommendations || [];
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[ai-strategy]", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
