import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { productDescription, targetAudience, priceLevel, country, budget, timeline } = await req.json();

    if (!productDescription) {
      return new Response(JSON.stringify({ error: "productDescription is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Du bist ein erfahrener Markenberater. Analysiere die folgende Geschäftsidee und generiere strukturierte Ergebnisse auf Deutsch.

Geschäftsidee: ${productDescription}
Zielgruppe: ${targetAudience || "Nicht angegeben"}
Preissegment: ${priceLevel || "Nicht angegeben"}
Verkaufsland: ${country || "Nicht angegeben"}
Budget: ${budget || "Nicht angegeben"}
Zeitrahmen: ${timeline || "Nicht angegeben"}

Antworte NUR mit einem JSON-Objekt (kein Markdown, kein Code-Block) mit genau diesen Feldern:
{
  "positioning": "Ein klares Positionierungs-Statement (2-3 Sätze)",
  "values": "3-5 Markenwerte, kommagetrennt",
  "marketAngle": "Der einzigartige Marktwinkel (2-3 Sätze)",
  "differentiation": "Wie sich die Marke differenziert (2-3 Sätze)"
}`;

    const response = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response
    let result;
    try {
      // Try to extract JSON from potential markdown code blocks
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

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
