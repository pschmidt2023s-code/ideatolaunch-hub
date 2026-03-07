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

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return jsonResponse({ error: "AI service not configured" }, 500);
    }

    // Validate input
    let input: Record<string, unknown>;
    try {
      input = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const productDescription = typeof input.productDescription === "string" ? input.productDescription.trim() : "";
    if (!productDescription) {
      return jsonResponse({ error: "productDescription is required" }, 400);
    }
    if (productDescription.length > 5000) {
      return jsonResponse({ error: "productDescription too long (max 5000 chars)" }, 400);
    }

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

    const prompt = `Du bist ein erfahrener Markenberater. Analysiere die folgende Geschäftsidee und generiere strukturierte Ergebnisse auf Deutsch.

Geschäftsidee: ${productDescription}
Zielgruppe: ${targetAudience}
Preissegment: ${priceLevel}
Verkaufsland: ${country}
Budget: ${budget}
Zeitrahmen: ${timeline}

Antworte NUR mit einem JSON-Objekt (kein Markdown, kein Code-Block) mit genau diesen Feldern:
{
  "positioning": "Ein klares Positionierungs-Statement (2-3 Sätze)",
  "values": "3-5 Markenwerte, kommagetrennt",
  "marketAngle": "Der einzigartige Marktwinkel (2-3 Sätze)",
  "differentiation": "Wie sich die Marke differenziert (2-3 Sätze)"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) {
        return jsonResponse({ error: "Rate limit erreicht. Bitte versuche es später erneut." }, 429);
      }
      if (response.status === 402) {
        return jsonResponse({ error: "Guthaben aufgebraucht. Bitte lade dein Konto auf." }, 402);
      }
      return jsonResponse({ error: "AI analysis failed" }, 500);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      result = {
        positioning: content,
        values: "",
        marketAngle: "",
        differentiation: "",
      };
    }

    return jsonResponse(result);
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
