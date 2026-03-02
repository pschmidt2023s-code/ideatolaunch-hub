import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data, error: claimsError } = await supabaseClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !data?.claims) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    if (!LOVABLE_API_KEY) {
      return jsonResponse({ error: "AI service not configured" }, 500);
    }

    let input: Record<string, unknown>;
    try {
      input = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const productDescription =
      typeof input.productDescription === "string"
        ? input.productDescription.trim()
        : "";
    const targetAudience =
      typeof input.targetAudience === "string"
        ? input.targetAudience.trim()
        : "";
    const tone =
      typeof input.tone === "string" ? input.tone.trim() : "";
    const visual =
      typeof input.visual === "string" ? input.visual.trim() : "";
    const priceLevel =
      typeof input.priceLevel === "string" ? input.priceLevel.trim() : "";
    const category =
      typeof input.category === "string" ? input.category.trim() : "";

    const systemPrompt = `You are an elite brand strategist specializing in private-label and DTC brands for the EU market. You generate brand names that are:
- Internationally usable (easy to pronounce in EN/DE/FR/ES)
- Memorable and distinctive
- Premium-feeling and scalable
- Free of trademark risk indicators
- Short (1-2 words, max 12 characters ideally)

AVOID: hard-to-spell names, overused suffixes (-ify, -ly, -io), generic dictionary words, names that sound like existing major brands.

SCORING CRITERIA (total 100):
1. Memorability (0-20): How sticky and recall-friendly is the name?
2. Pronunciation simplicity (0-15): Easy across languages?
3. International usability (0-15): Works globally without negative connotations?
4. Premium perception (0-15): Does it feel high-value?
5. Emotional resonance (0-15): Does it evoke the right feelings?
6. Market positioning strength (0-10): Does it support the brand's positioning?
7. Risk factor penalty (-0 to -10): Deductions for trademark similarity, confusion risk, etc.

ONLY return names that score >= 90 total. Generate exactly 5 candidates, then filter to the top 3-5 with score >= 90. If fewer than 3 qualify, lower threshold to 85.`;

    const userPrompt = `Generate premium brand names for this brand:

${productDescription ? `Product: ${productDescription}` : "General brand – no specific product yet"}
${targetAudience ? `Target audience: ${targetAudience}` : ""}
${priceLevel ? `Price segment: ${priceLevel}` : ""}
${category ? `Category: ${category}` : ""}
${tone ? `Tone: ${tone}` : ""}
${visual ? `Visual direction: ${visual}` : ""}

Return the best 3-5 names with full analysis.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
          temperature: 0.85,
          tools: [
            {
              type: "function",
              function: {
                name: "return_brand_names",
                description:
                  "Return scored brand name suggestions with full analysis.",
                parameters: {
                  type: "object",
                  properties: {
                    names: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "The brand name" },
                          total_score: {
                            type: "number",
                            description: "Total score 0-100",
                          },
                          scores: {
                            type: "object",
                            properties: {
                              memorability: { type: "number" },
                              pronunciation: { type: "number" },
                              international: { type: "number" },
                              premium: { type: "number" },
                              emotional: { type: "number" },
                              positioning: { type: "number" },
                              risk_penalty: { type: "number" },
                            },
                            required: [
                              "memorability",
                              "pronunciation",
                              "international",
                              "premium",
                              "emotional",
                              "positioning",
                              "risk_penalty",
                            ],
                            additionalProperties: false,
                          },
                          explanation: {
                            type: "string",
                            description:
                              "1-2 sentences why this name works. In German.",
                          },
                          emotional_positioning: {
                            type: "string",
                            description:
                              "e.g. 'Vertrauen & Eleganz' or 'Energie & Innovation'. In German.",
                          },
                          target_segment: {
                            type: "string",
                            description:
                              "Ideal customer segment. In German.",
                          },
                          archetype: {
                            type: "string",
                            enum: [
                              "The Creator",
                              "The Explorer",
                              "The Sage",
                              "The Hero",
                              "The Rebel",
                              "The Lover",
                              "The Caregiver",
                              "The Ruler",
                              "The Magician",
                              "The Innocent",
                              "The Jester",
                              "The Everyman",
                            ],
                            description: "Best matching brand archetype",
                          },
                          risk_level: {
                            type: "string",
                            enum: ["low", "medium", "high"],
                          },
                          slogan: {
                            type: "string",
                            description:
                              "A short brand slogan/tagline suggestion. In German.",
                          },
                          visual_direction: {
                            type: "string",
                            enum: [
                              "minimal",
                              "bold",
                              "luxury",
                              "organic",
                              "futuristic",
                            ],
                          },
                          color_suggestion: {
                            type: "string",
                            description:
                              "Primary color recommendation, e.g. 'Deep Navy + Gold Accent'",
                          },
                          domain_style: {
                            type: "string",
                            description:
                              "Domain suggestion, e.g. 'name.de / name.com'",
                          },
                        },
                        required: [
                          "name",
                          "total_score",
                          "scores",
                          "explanation",
                          "emotional_positioning",
                          "target_segment",
                          "archetype",
                          "risk_level",
                          "slogan",
                          "visual_direction",
                          "color_suggestion",
                          "domain_style",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["names"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_brand_names" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429)
        return jsonResponse(
          { error: "Rate limit erreicht. Bitte versuche es später erneut." },
          429
        );
      if (response.status === 402)
        return jsonResponse({ error: "Guthaben aufgebraucht." }, 402);
      return jsonResponse({ error: "AI service error" }, 500);
    }

    const aiData = await response.json();

    // Extract from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      // Fallback: try content
      const content = aiData.choices?.[0]?.message?.content || "";
      console.error("No tool call found, content:", content);
      return jsonResponse({ error: "AI returned unexpected format" }, 500);
    }

    let parsed: { names: unknown[] };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse tool call args:", toolCall.function.arguments);
      return jsonResponse({ error: "AI returned invalid data" }, 500);
    }

    // Sort by score descending, take top 5
    const names = (parsed.names as any[])
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
      .slice(0, 5);

    return jsonResponse({ names });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
