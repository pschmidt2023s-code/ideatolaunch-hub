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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return jsonResponse({ error: "AI service not configured" }, 500);

    let input: Record<string, unknown>;
    try {
      input = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const sanitize = (v: unknown, max = 200): string => {
      if (typeof v !== "string") return "Nicht angegeben";
      const s = v.trim().slice(0, max);
      return s || "Nicht angegeben";
    };

    const brandName = sanitize(input.brandName);
    const productDescription = sanitize(input.productDescription, 500);
    const targetAudience = sanitize(input.targetAudience);
    const priceLevel = sanitize(input.priceLevel, 50);
    const tone = sanitize(input.tone, 50);
    const tagline = sanitize(input.tagline, 100);
    const colorScheme = sanitize(input.colorScheme, 50);

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
- Markenname: ${brandName}
- Produkt: ${productDescription}
- Zielgruppe: ${targetAudience}
- Preissegment: ${priceLevel}
- Tonalität: ${tone}
- Tagline: ${tagline}
- Farbschema: ${colorScheme}`;

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
      if (response.status === 429) return jsonResponse({ error: "Rate limit erreicht. Bitte versuche es in einer Minute erneut." }, 429);
      if (response.status === 402) return jsonResponse({ error: "Guthaben aufgebraucht. Bitte lade dein Workspace-Guthaben auf." }, 402);
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return jsonResponse({ error: "AI gateway error" }, 500);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return jsonResponse({ error: "Keine Landing Page generiert" }, 500);
    }

    let pageData;
    try {
      pageData = JSON.parse(toolCall.function.arguments);
    } catch {
      return jsonResponse({ error: "AI returned invalid data" }, 500);
    }

    return jsonResponse(pageData);
  } catch (e) {
    console.error("Website builder error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
