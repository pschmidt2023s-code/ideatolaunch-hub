import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { trades, strategy, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Du bist ein Elite-Trading-Coach mit 15+ Jahren Erfahrung in Krypto, Forex und Aktien. Du analysierst Trade-Daten wie ein institutioneller Risk Manager.

ANALYSE-FRAMEWORK:
1. **📊 Performance Summary** – P&L Breakdown, Win Rate, Risk-Reward Ratio, erwartungswert (Expectancy)
2. **🔍 Pattern Analysis** – Erkenne: Overtrading, Revenge Trading, FOMO-Einstiege, zu frühe Exits, Session-Timing-Patterns
3. **⚠️ Risk Assessment** – Position Sizing Konsistenz, Max Drawdown, Risk per Trade vs. Kontostand, korrelierte Positionen
4. **📋 Discipline Check** – Setup-Konformität, Stop-Loss-Einhaltung, Take-Profit-Management, emotionale Entscheidungen identifizieren
5. **🎯 Actionable Improvements** – Exakt 5 konkrete Maßnahmen mit erwartetem Impact auf Win Rate/P&L
6. **📈 Overall Grade** – A-F mit spezifischer Begründung und Vergleich zu professionellen Standards

QUALITÄTSSTANDARDS:
- Berechne ALLE Metriken aus den Daten, nicht schätzen
- Nenne konkrete Trade-IDs wenn du Fehler identifizierst
- Vergleiche mit institutionellen Benchmarks (z.B. Sharpe > 1.5 = gut)
- Sei DIREKT und EHRLICH – beschönige nichts
- Nutze Tabellen und Listen für Übersichtlichkeit
- Antworte auf Deutsch mit Emojis für visuelle Struktur`;

    const userPrompt = `Strategie: ${strategy || "Nicht angegeben"}
Kontext: ${context || "Keine weiteren Infos"}

Trade-Daten (${Array.isArray(trades) ? trades.length : 0} Trades):
${JSON.stringify(trades, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es später erneut." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI Credits aufgebraucht." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI Fehler" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("trade review error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
