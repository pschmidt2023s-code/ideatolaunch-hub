// SEO Audit – Bulk Auto-Fix
// Generiert Patches für ALLE offenen Findings eines Runs in einem Rutsch.
// POST { run_id, severity?: "critical"|"warning"|"info"|"all" }
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

function deterministicFix(finding: any): FixSuggestion | null {
  const origin = (() => { try { return new URL(finding.url).origin; } catch { return ""; } })();
  switch (finding.code) {
    case "NO_ROBOTS":
    case "ROBOTS_MISSING":
      return { fix_type: "auto_apply", target_file: "public/robots.txt", patch_content: `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, ai_explanation: "Standard robots.txt mit Sitemap-Verweis." };
    case "ROBOTS_NO_SITEMAP":
      return { fix_type: "auto_apply", target_file: "public/robots.txt", patch_content: `Sitemap: ${origin}/sitemap.xml`, ai_explanation: "Sitemap-Zeile zu robots.txt hinzufügen." };
    case "NO_SITEMAP":
    case "SITEMAP_MISSING":
      return { fix_type: "manual_guide", target_file: "public/sitemap.xml", patch_content: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${origin}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`, ai_explanation: "Sitemap-Stub. Erweitere die URL-Einträge." };
    case "NO_VIEWPORT":
    case "VIEWPORT_MISSING":
      return { fix_type: "manual_guide", target_file: "index.html", patch_content: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`, ai_explanation: "Im <head> der index.html ergänzen." };
    case "NO_HSTS":
    case "HSTS_MISSING":
      return { fix_type: "manual_guide", target_file: "public/_headers", patch_content: `/*\n  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, ai_explanation: "HSTS via _headers (Netlify/CF Pages)." };
    case "NO_LANG":
      return { fix_type: "manual_guide", target_file: "index.html", patch_content: `<html lang="de">`, ai_explanation: "Ersetze <html> Tag mit lang-Attribut." };
    case "MISSING_CANONICAL":
    case "CANONICAL_MISSING":
      return { fix_type: "manual_guide", target_file: null, patch_content: `<link rel="canonical" href="${finding.url}" />`, ai_explanation: "Im <head> der Seite ergänzen (z. B. via SEO-Komponente)." };
    case "MISSING_OG":
      return { fix_type: "manual_guide", target_file: "index.html", patch_content: `<meta property="og:title" content="..." />\n<meta property="og:description" content="..." />\n<meta property="og:image" content="..." />\n<meta property="og:url" content="${finding.url}" />\n<meta name="twitter:card" content="summary_large_image" />`, ai_explanation: "OpenGraph + Twitter Card im <head>." };
    case "SCHEMA_MISSING":
      return { fix_type: "manual_guide", target_file: "index.html", patch_content: `<script type="application/ld+json">\n${JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Brand", url: origin, logo: `${origin}/logo.png` }, null, 2)}\n</script>`, ai_explanation: "Organization-Schema als Basis. Ergänze WebSite + BreadcrumbList je nach Bedarf." };
    default:
      return null;
  }
}

async function aiFix(finding: any): Promise<FixSuggestion> {
  const prompt = `Senior SEO-Engineer: Generiere einen sofort umsetzbaren Fix.\n\nURL: ${finding.url}\nCode: ${finding.code}\nTitel: ${finding.title}\nKategorie: ${finding.category}\nSchweregrad: ${finding.severity}\nIst: ${finding.current_value ?? "—"}\nSoll: ${finding.expected_value ?? "—"}\nEmpfehlung: ${finding.recommendation ?? "—"}`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "Präziser SEO-Fix-Generator. Antworte nur via tool call." },
        { role: "user", content: prompt },
      ],
      tools: [{ type: "function", function: { name: "seo_fix", description: "SEO fix", parameters: { type: "object", properties: { target_file: { type: "string" }, patch_content: { type: "string" }, ai_explanation: { type: "string" } }, required: ["target_file", "patch_content", "ai_explanation"], additionalProperties: false } } }],
      tool_choice: { type: "function", function: { name: "seo_fix" } },
    }),
  });
  if (!r.ok) throw new Error(`AI ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  const parsed = args ? JSON.parse(args) : {};
  return { fix_type: "ai_patch", target_file: parsed.target_file ?? null, patch_content: parsed.patch_content ?? "", ai_explanation: parsed.ai_explanation ?? "" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: admin } = await supabase.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
    if (!admin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { run_id, severity = "all" } = await req.json();
    if (!run_id) return new Response(JSON.stringify({ error: "run_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Hole Findings ohne bisherigen Fix
    let q = supabase.from("seo_audit_findings").select("*").eq("run_id", run_id).neq("fix_status", "fixed");
    if (severity !== "all") q = q.eq("severity", severity);
    const { data: findings, error: fErr } = await q.limit(500);
    if (fErr) throw fErr;
    if (!findings || findings.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, message: "Keine offenen Findings." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Skip Findings die bereits einen Fix haben
    const { data: existingFixes } = await supabase.from("seo_audit_fixes").select("finding_id").eq("run_id", run_id);
    const fixedIds = new Set((existingFixes ?? []).map((f: any) => f.finding_id));
    const todo = findings.filter((f: any) => !fixedIds.has(f.id));

    // Dedupliziere nach Code+Code-Type um redundante AI-Calls zu sparen
    const seen = new Map<string, any>(); // key = code|target_file
    const unique: any[] = [];
    for (const f of todo) {
      const key = f.code;
      if (!seen.has(key)) {
        seen.set(key, f);
        unique.push(f);
      }
    }

    const results: any[] = [];
    let successCount = 0;
    let aiCount = 0;
    let detCount = 0;
    let errorCount = 0;

    // Parallele Verarbeitung mit Concurrency=4 um Rate-Limits zu schonen
    const CONCURRENCY = 4;
    for (let i = 0; i < unique.length; i += CONCURRENCY) {
      const batch = unique.slice(i, i + CONCURRENCY).map(async (finding: any) => {
        try {
          let suggestion = deterministicFix(finding);
          if (suggestion) detCount++;
          else { suggestion = await aiFix(finding); aiCount++; }

          // Speichere Fix für ALLE Findings mit gleichem Code in diesem Run
          const sameCodeFindings = todo.filter((f: any) => f.code === finding.code);
          const rows = sameCodeFindings.map((f: any) => ({
            finding_id: f.id,
            run_id: f.run_id,
            fix_type: suggestion!.fix_type,
            status: "pending",
            target_file: suggestion!.target_file,
            patch_content: suggestion!.patch_content,
            ai_explanation: suggestion!.ai_explanation,
          }));
          await supabase.from("seo_audit_fixes").insert(rows);
          successCount += rows.length;
          results.push({ code: finding.code, target_file: suggestion.target_file, applied_to: rows.length, fix_type: suggestion.fix_type, ai_explanation: suggestion.ai_explanation, patch_content: suggestion.patch_content });
        } catch (e) {
          errorCount++;
          console.error(`[bulk-fix] ${finding.code} failed:`, e);
        }
      });
      await Promise.all(batch);
    }

    return new Response(JSON.stringify({
      success: true,
      total_findings: todo.length,
      unique_codes: unique.length,
      fixes_generated: successCount,
      ai_calls: aiCount,
      deterministic: detCount,
      errors: errorCount,
      fixes: results,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[seo-audit-fix-bulk]", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
