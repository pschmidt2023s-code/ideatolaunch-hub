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
    try { input = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }

    const sanitize = (v: unknown, max = 200): string => {
      if (typeof v !== "string") return "Nicht angegeben";
      return v.trim().slice(0, max) || "Nicht angegeben";
    };

    const brandName = sanitize(input.brandName);
    const productDescription = sanitize(input.productDescription, 500);
    const targetAudience = sanitize(input.targetAudience);
    const priceLevel = sanitize(input.priceLevel, 50);
    const tone = sanitize(input.tone, 50);
    const tagline = sanitize(input.tagline, 100);
    const colorScheme = sanitize(input.colorScheme, 50);
    const pages = Array.isArray(input.pages) ? input.pages : ["home"];

    const systemPrompt = `Du bist ein professioneller Website-Generator für Direct-to-Consumer Marken.
Generiere eine vollständige, mehrseitige Website-Struktur als JSON.

WICHTIG:
- Alle Texte auf Deutsch
- Modernes, conversion-optimiertes Design
- Nutze die Markeninformationen für authentische, fertige Texte
- Keine Platzhalter – alle Texte müssen fertig sein
- Fokus auf Conversion und Trust
- Generiere NUR die angeforderten Seiten

Antworte NUR mit dem JSON tool call.`;

    const userPrompt = `Erstelle eine Website mit folgenden Seiten: ${pages.join(", ")}

Markeninformationen:
- Markenname: ${brandName}
- Produkt: ${productDescription}
- Zielgruppe: ${targetAudience}
- Preissegment: ${priceLevel}
- Tonalität: ${tone}
- Tagline: ${tagline}
- Farbschema: ${colorScheme}`;

    const pageSchemas: Record<string, object> = {
      home: {
        type: "object",
        properties: {
          hero: { type: "object", properties: { headline: { type: "string" }, subheadline: { type: "string" }, cta_text: { type: "string" }, cta_target: { type: "string" }, trust_badge: { type: "string" } }, required: ["headline", "subheadline", "cta_text"] },
          features: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, icon: { type: "string" } }, required: ["title", "description"] } },
          social_proof: { type: "object", properties: { headline: { type: "string" }, testimonials: { type: "array", items: { type: "object", properties: { name: { type: "string" }, text: { type: "string" }, rating: { type: "number" } }, required: ["name", "text", "rating"] } } }, required: ["headline", "testimonials"] },
          cta_section: { type: "object", properties: { headline: { type: "string" }, subheadline: { type: "string" }, cta_text: { type: "string" }, urgency_text: { type: "string" } }, required: ["headline", "cta_text"] },
        },
        required: ["hero", "features", "social_proof", "cta_section"],
      },
      about: {
        type: "object",
        properties: {
          headline: { type: "string" },
          story: { type: "string" },
          mission: { type: "string" },
          values: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] } },
          team_headline: { type: "string" },
        },
        required: ["headline", "story", "mission", "values"],
      },
      products: {
        type: "object",
        properties: {
          headline: { type: "string" },
          subheadline: { type: "string" },
          items: { type: "array", items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, price: { type: "string" }, badge: { type: "string" }, cta_text: { type: "string" } }, required: ["name", "description"] } },
        },
        required: ["headline", "items"],
      },
      contact: {
        type: "object",
        properties: {
          headline: { type: "string" },
          subheadline: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          form_fields: { type: "array", items: { type: "object", properties: { label: { type: "string" }, type: { type: "string" }, placeholder: { type: "string" } }, required: ["label", "type"] } },
        },
        required: ["headline", "form_fields"],
      },
      faq: {
        type: "object",
        properties: {
          headline: { type: "string" },
          items: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } }, required: ["question", "answer"] } },
        },
        required: ["headline", "items"],
      },
    };

    const pagesProperty: Record<string, object> = {};
    for (const p of pages) {
      if (pageSchemas[p as string]) pagesProperty[p as string] = pageSchemas[p as string];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_website",
            description: "Generate a complete multi-page website structure",
            parameters: {
              type: "object",
              properties: {
                pages: { type: "object", properties: pagesProperty, required: pages.filter((p: string) => pageSchemas[p]) },
                navigation: { type: "array", items: { type: "object", properties: { label: { type: "string" }, page: { type: "string" } }, required: ["label", "page"] } },
                footer: { type: "object", properties: { copyright: { type: "string" }, links: { type: "array", items: { type: "object", properties: { label: { type: "string" }, page: { type: "string" } }, required: ["label", "page"] } } } },
                meta: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, primary_color: { type: "string" }, accent_color: { type: "string" } }, required: ["title", "description"] },
              },
              required: ["pages", "navigation", "footer", "meta"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_website" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return jsonResponse({ error: "Rate limit erreicht. Bitte versuche es in einer Minute erneut." }, 429);
      if (response.status === 402) return jsonResponse({ error: "Guthaben aufgebraucht." }, 402);
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return jsonResponse({ error: "AI gateway error" }, 500);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return jsonResponse({ error: "Keine Website generiert" }, 500);

    let websiteData;
    try { websiteData = JSON.parse(toolCall.function.arguments); } catch { return jsonResponse({ error: "AI returned invalid data" }, 500); }

    return jsonResponse(websiteData);
  } catch (e) {
    console.error("Website builder error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
