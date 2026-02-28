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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
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

    const brandName = typeof input.brandName === "string" ? input.brandName.trim() : "";
    const category = typeof input.category === "string" ? input.category.trim() : "";
    const tone = typeof input.tone === "string" ? input.tone.trim() : "";

    if (!brandName || brandName.length < 2) {
      return jsonResponse({ error: "Brand name must be at least 2 characters" }, 400);
    }

    const prompt = `Du bist ein Brand-Intelligence-Analyst. Analysiere den Markennamen "${brandName}" für eine ${category || "Consumer Goods"} Marke mit Tonalität "${tone || "Professionell"}".

Führe folgende Checks durch und antworte NUR mit einem JSON-Objekt (kein Markdown, kein Code-Block):

1. Domain-Verfügbarkeit: Schätze die Wahrscheinlichkeit, dass "${brandName}.de" und "${brandName}.com" verfügbar sind (basierend auf Namenslänge, Häufigkeit, generische Begriffe). Gib "likely_available", "likely_taken" oder "uncertain" an.

2. Social-Handle-Verfügbarkeit: Schätze für Instagram und TikTok ob @${brandName.toLowerCase().replace(/\s+/g, "")} verfügbar sein könnte.

3. Trademark-Ähnlichkeit: Gibt es bekannte Marken oder Unternehmen mit ähnlichem Namen? Liste bis zu 3 ähnliche Namen auf und bewerte das Verwechslungsrisiko (low/medium/high).

4. SEO-Wettbewerb: Wie stark ist der SEO-Wettbewerb für "${brandName}" als Keyword? (low/medium/high)

5. Gesamtbewertung: Gib einen "legitimacy_score" von 0-100.

6. Wenn der Score unter 50 liegt und du Execution-Level Rebranding-Vorschläge machen sollst, generiere 3 alternative Markennamen.

JSON Format:
{
  "legitimacy_score": number,
  "domains": {
    "de": "likely_available" | "likely_taken" | "uncertain",
    "com": "likely_available" | "likely_taken" | "uncertain"
  },
  "social": {
    "instagram": "likely_available" | "likely_taken" | "uncertain",
    "tiktok": "likely_available" | "likely_taken" | "uncertain"
  },
  "trademark": {
    "risk_level": "low" | "medium" | "high",
    "similar_brands": [{"name": string, "similarity": number}],
    "warning": string | null
  },
  "seo": {
    "competition": "low" | "medium" | "high",
    "difficulty_score": number,
    "explanation": string
  },
  "rebranding_suggestions": string[],
  "summary": string
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) return jsonResponse({ error: "Rate limit erreicht." }, 429);
      if (response.status === 402) return jsonResponse({ error: "Guthaben aufgebraucht." }, 402);
      return jsonResponse({ error: "AI service error" }, 500);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let result: Record<string, unknown>;
    try {
      const match = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(match ? match[0] : content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return jsonResponse({ error: "Could not parse intelligence result" }, 500);
    }

    return jsonResponse({ result });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
