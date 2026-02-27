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
      return jsonResponse({ error: "AI service not configured" }, 500);
    }

    let input: Record<string, unknown>;
    try {
      input = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const productDescription = typeof input.productDescription === "string" ? input.productDescription.trim() : "";
    const tone = typeof input.tone === "string" ? input.tone.trim() : "";
    const visual = typeof input.visual === "string" ? input.visual.trim() : "";

    const prompt = `Du bist ein kreativer Markenberater. Generiere 5 einzigartige, einprägsame Markennamen.

${productDescription ? `Produktbeschreibung: ${productDescription}` : "Kein Produkt angegeben – generiere allgemein kreative Namen."}
${tone ? `Tonalität: ${tone}` : ""}
${visual ? `Visuelle Richtung: ${visual}` : ""}

Antworte NUR mit einem JSON-Array von 5 Strings. Kein Markdown, kein Code-Block.
Beispiel: ["Name1", "Name2", "Name3", "Name4", "Name5"]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) return jsonResponse({ error: "Rate limit erreicht. Bitte versuche es später erneut." }, 429);
      if (response.status === 402) return jsonResponse({ error: "Guthaben aufgebraucht." }, 402);
      return jsonResponse({ error: "AI service error" }, 500);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let names: string[];
    try {
      const match = content.match(/\[[\s\S]*\]/);
      names = JSON.parse(match ? match[0] : content);
      if (!Array.isArray(names)) throw new Error("not array");
      names = names.filter((n): n is string => typeof n === "string").slice(0, 5);
    } catch {
      names = content.split("\n").map((l: string) => l.replace(/^[\d.\-*]+\s*/, "").trim()).filter(Boolean).slice(0, 5);
    }

    return jsonResponse({ names });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
