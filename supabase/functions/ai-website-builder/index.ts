import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { brandName, productDescription, targetAudience, priceLevel, tone, tagline, colorScheme } = await req.json();

    const systemPrompt = `Du bist ein professioneller Landing-Page-Generator für Direct-to-Consumer Marken.
Generiere eine vollständige, sofort einsetzbare Landing Page als JSON-Objekt.

WICHTIG:
- Alle Texte auf Deutsch
- Modernes, conversion-optimiertes Design
- Nutze die Markeninformationen für authentische Texte
- Keine Platzhalter – alle Texte müssen fertig sein
- Fokus auf Conversion und Trust

Antworte NUR mit dem JSON tool call.`;

    const userPrompt = `Erstelle eine Landing Page für:
- Markenname: ${brandName || "Meine Marke"}
- Produkt: ${productDescription || "Nicht angegeben"}
- Zielgruppe: ${targetAudience || "Nicht angegeben"}
- Preissegment: ${priceLevel || "mid"}
- Tonalität: ${tone || "Professionell"}
- Tagline: ${tagline || ""}
- Farbschema: ${colorScheme || "modern-dark"}`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_landing_page",
              description: "Generate a complete landing page structure",
              parameters: {
                type: "object",
                properties: {
                  hero: {
                    type: "object",
                    properties: {
                      headline: { type: "string" },
                      subheadline: { type: "string" },
                      cta_text: { type: "string" },
                      trust_badge: { type: "string" },
                    },
                    required: ["headline", "subheadline", "cta_text"],
                  },
                  features: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        icon: { type: "string" },
                      },
                      required: ["title", "description"],
                    },
                  },
                  social_proof: {
                    type: "object",
                    properties: {
                      headline: { type: "string" },
                      testimonials: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            text: { type: "string" },
                            rating: { type: "number" },
                          },
                          required: ["name", "text", "rating"],
                        },
                      },
                    },
                    required: ["headline", "testimonials"],
                  },
                  faq: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                      },
                      required: ["question", "answer"],
                    },
                  },
                  cta_section: {
                    type: "object",
                    properties: {
                      headline: { type: "string" },
                      subheadline: { type: "string" },
                      cta_text: { type: "string" },
                      urgency_text: { type: "string" },
                    },
                    required: ["headline", "cta_text"],
                  },
                  meta: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      primary_color: { type: "string" },
                      style: { type: "string" },
                    },
                    required: ["title", "description"],
                  },
                },
                required: ["hero", "features", "social_proof", "cta_section", "meta"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_landing_page" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es in einer Minute erneut." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Guthaben aufgebraucht. Bitte lade dein Workspace-Guthaben auf." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Keine Landing Page generiert" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pageData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(pageData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Website builder error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
