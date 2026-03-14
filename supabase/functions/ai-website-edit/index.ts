import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return jsonResponse({ error: "AI service not configured" }, 500);

    let input: Record<string, unknown>;
    try { input = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }

    const wish = typeof input.wish === "string" ? input.wish.trim().slice(0, 500) : "";
    const currentData = input.currentData as Record<string, unknown> | undefined;
    const targetPage = typeof input.targetPage === "string" ? input.targetPage : undefined;
    const targetSection = typeof input.targetSection === "string" ? input.targetSection : undefined;
    const brandName = typeof input.brandName === "string" ? input.brandName : "Marke";

    if (!wish || !currentData) {
      return jsonResponse({ error: "wish and currentData are required" }, 400);
    }

    const systemPrompt = `Du bist ein Website-Editor-Assistent. Der Nutzer hat eine bestehende Website und möchte Änderungen vornehmen.
Du erhältst die aktuelle Website-Struktur als JSON und einen Änderungswunsch.

REGELN:
- Gib NUR die geänderten Teile zurück, im exakt gleichen JSON-Format wie die Eingabe
- Behalte alle bestehenden Felder bei, die nicht geändert werden sollen
- Schreibe alle Texte auf Deutsch
- Sei kreativ aber konsistent mit dem bestehenden Stil
- Wenn der Nutzer eine neue Sektion will, füge sie dem bestehenden Format hinzu
- Wenn der Nutzer etwas löschen will, entferne es aus dem JSON
- Antworte NUR mit dem tool call, keine Erklärung`;

    let context = `Markenname: ${brandName}\n`;
    if (targetPage) context += `Zielseite: ${targetPage}\n`;
    if (targetSection) context += `Zielsektion: ${targetSection}\n`;
    context += `\nÄnderungswunsch: ${wish}\n\nAktuelle Website-Daten:\n${JSON.stringify(currentData, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context },
        ],
        tools: [{
          type: "function",
          function: {
            name: "update_website",
            description: "Return the complete updated website data structure",
            parameters: {
              type: "object",
              properties: {
                pages: { type: "object" },
                navigation: { type: "array", items: { type: "object" } },
                footer: { type: "object" },
                meta: { type: "object" },
              },
              required: ["pages", "navigation", "footer", "meta"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "update_website" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return jsonResponse({ error: "Rate limit erreicht. Bitte versuche es in einer Minute erneut." }, 429);
      if (response.status === 402) return jsonResponse({ error: "Guthaben aufgebraucht." }, 402);
      console.error("AI gateway error:", response.status, await response.text());
      return jsonResponse({ error: "AI gateway error" }, 500);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return jsonResponse({ error: "Keine Änderungen generiert" }, 500);

    let updatedData;
    try { updatedData = JSON.parse(toolCall.function.arguments); } catch { return jsonResponse({ error: "AI returned invalid data" }, 500); }

    return jsonResponse(updatedData);
  } catch (e) {
    console.error("Website edit error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
