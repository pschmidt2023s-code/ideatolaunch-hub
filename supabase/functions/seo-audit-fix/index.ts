// SEO Audit – Modul 3: Auto-Fix Engine
// Generates AI-powered fix patches for findings (one-click style).
// POST { finding_id }  →  generates patch + saves to seo_audit_fixes
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

interface FixSuggestion {
  fix_type: "ai_patch" | "auto_apply" | "manual_guide";
  target_file: string | null;
  patch_content: string;
  ai_explanation: string;
}

// Deterministic fixes for well-known codes (no AI needed).
function deterministicFix(finding: any): FixSuggestion | null {
  switch (finding.code) {
    case "ROBOTS_MISSING":
      return {
        fix_type: "auto_apply",
        target_file: "public/robots.txt",
        patch_content: `User-agent: *\nAllow: /\n\nSitemap: ${new URL(finding.url).origin}/sitemap.xml\n`,
        ai_explanation: "Erstellt eine standard robots.txt, die alle Crawler erlaubt und auf die Sitemap verweist.",
      };
    case "SITEMAP_MISSING":
      return {
        fix_type: "manual_guide",
        target_file: "public/sitemap.xml",
        patch_content: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${new URL(finding.url).origin}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`,
        ai_explanation: "Sitemap-Stub erstellt. Erweitere die <url>-Einträge für jede wichtige Seite.",
      };
    case "VIEWPORT_MISSING":
      return {
        fix_type: "manual_guide",
        target_file: "index.html",
        patch_content: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
        ai_explanation: "Füge dieses Meta-Tag im <head> der index.html ein.",
      };
    case "HSTS_MISSING":
      return {
        fix_type: "manual_guide",
        target_file: "public/_headers",
        patch_content: `/*\n  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
        ai_explanation: "Aktiviert HSTS via _headers Datei (Netlify/Cloudflare Pages Format).",
      };
    case "CANONICAL_MISSING":
      return {
        fix_type: "manual_guide",
        target_file: null,
        patch_content: `<link rel="canonical" href="${finding.url}" />`,
        ai_explanation: "Füge dieses <link>-Tag im <head> der betroffenen Seite ein (z.B. via SEO-Komponente).",
      };
    default:
      return null;
  }
}

async function aiFix(finding: any): Promise<FixSuggestion> {
  const prompt = `Du bist ein Senior SEO-Engineer. Generiere einen konkreten, sofort umsetzbaren Fix für folgendes SEO-Problem:

URL: ${finding.url}
Problem-Code: ${finding.code}
Titel: ${finding.title}
Kategorie: ${finding.category}
Schweregrad: ${finding.severity}
Beschreibung: ${finding.description ?? "—"}
Aktueller Wert: ${finding.current_value ?? "—"}
Soll-Wert: ${finding.expected_value ?? "—"}
Empfehlung: ${finding.recommendation ?? "—"}

Antworte als JSON: { "target_file": "z.B. src/pages/Index.tsx", "patch_content": "konkreter Code/Snippet", "ai_explanation": "1-3 Sätze warum & wie" }`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "Du bist ein präziser SEO-Fix-Generator. Antworte ausschließlich mit dem geforderten JSON." },
        { role: "user", content: prompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "seo_fix",
          description: "Return a concrete SEO fix",
          parameters: {
            type: "object",
            properties: {
              target_file: { type: "string" },
              patch_content: { type: "string" },
              ai_explanation: { type: "string" },
            },
            required: ["target_file", "patch_content", "ai_explanation"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "seo_fix" } },
    }),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`AI gateway ${r.status}: ${txt}`);
  }
  const data = await r.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  const parsed = args ? JSON.parse(args) : {};
  return {
    fix_type: "ai_patch",
    target_file: parsed.target_file ?? null,
    patch_content: parsed.patch_content ?? "",
    ai_explanation: parsed.ai_explanation ?? "",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { finding_id } = await req.json();
    if (!finding_id) {
      return new Response(JSON.stringify({ error: "finding_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: finding, error: fErr } = await supabase
      .from("seo_audit_findings")
      .select("*")
      .eq("id", finding_id)
      .maybeSingle();

    if (fErr || !finding) {
      return new Response(JSON.stringify({ error: "Finding not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try deterministic first, fallback to AI
    let suggestion = deterministicFix(finding);
    if (!suggestion) {
      suggestion = await aiFix(finding);
    }

    const { data: fix, error: insErr } = await supabase
      .from("seo_audit_fixes")
      .insert({
        finding_id: finding.id,
        run_id: finding.run_id,
        fix_type: suggestion.fix_type,
        status: "pending",
        target_file: suggestion.target_file,
        patch_content: suggestion.patch_content,
        ai_explanation: suggestion.ai_explanation,
      })
      .select()
      .single();

    if (insErr) throw insErr;

    return new Response(JSON.stringify({ success: true, fix }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[seo-audit-fix]", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
