// SEO Audit Scanner – Modul 1: Technical + On-Page + Performance
// Crawlt URLs (eigener Crawl + optional PageSpeed) und speichert Findings.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PSI_KEY = Deno.env.get("GOOGLE_PAGESPEED_API_KEY") ?? "";

type Severity = "critical" | "warning" | "info";
type Category = "technical" | "onpage" | "performance" | "schema" | "links";

interface Finding {
  url: string;
  category: Category;
  severity: Severity;
  code: string;
  title: string;
  description?: string;
  recommendation?: string;
  current_value?: string;
  expected_value?: string;
  auto_fixable?: boolean;
}

const SEVERITY_WEIGHT: Record<Severity, number> = { critical: 10, warning: 4, info: 1 };

async function fetchText(url: string, timeoutMs = 10000): Promise<{ html: string; status: number; headers: Headers } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "BrandOS-SEOBot/1.0" } });
    clearTimeout(t);
    const html = await res.text();
    return { html, status: res.status, headers: res.headers };
  } catch (_e) {
    return null;
  }
}

function extractTag(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.push(m[1].replace(/<[^>]+>/g, "").trim());
  return out;
}

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractAttr(html: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function analyzeOnPage(url: string, html: string): Finding[] {
  const findings: Finding[] = [];
  const titles = extractTag(html, "title");
  const title = titles[0] ?? "";
  const desc = extractMeta(html, "description") ?? "";
  const h1s = extractTag(html, "h1");
  const canonical = extractAttr(html, 'link[^>]+rel=["\']canonical["\']', "href") ?? html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? null;

  if (!title) findings.push({ url, category: "onpage", severity: "critical", code: "MISSING_TITLE", title: "Title-Tag fehlt", recommendation: "Füge einen aussagekräftigen <title> mit 50-60 Zeichen hinzu." });
  else {
    if (title.length < 30) findings.push({ url, category: "onpage", severity: "warning", code: "TITLE_SHORT", title: "Title zu kurz", current_value: `${title.length} Zeichen`, expected_value: "50-60", recommendation: "Erweitere den Title mit Keyword + Brand." });
    if (title.length > 65) findings.push({ url, category: "onpage", severity: "warning", code: "TITLE_LONG", title: "Title zu lang", current_value: `${title.length} Zeichen`, expected_value: "≤ 60", recommendation: "Kürze den Title – Google schneidet ab ~60 Zeichen ab." });
  }

  if (!desc) findings.push({ url, category: "onpage", severity: "warning", code: "MISSING_META_DESC", title: "Meta Description fehlt", recommendation: "Füge eine 140-160 Zeichen Description mit CTA hinzu.", auto_fixable: false });
  else if (desc.length < 80 || desc.length > 170) findings.push({ url, category: "onpage", severity: "info", code: "META_DESC_LEN", title: "Meta Description Länge nicht optimal", current_value: `${desc.length} Zeichen`, expected_value: "140-160" });

  if (h1s.length === 0) findings.push({ url, category: "onpage", severity: "critical", code: "MISSING_H1", title: "H1 fehlt", recommendation: "Genau eine semantische H1 pro Seite verwenden." });
  else if (h1s.length > 1) findings.push({ url, category: "onpage", severity: "warning", code: "MULTIPLE_H1", title: `${h1s.length} H1-Tags gefunden`, expected_value: "1", recommendation: "Verwende nur eine H1." });

  if (!canonical) findings.push({ url, category: "onpage", severity: "info", code: "MISSING_CANONICAL", title: "Canonical-Tag fehlt", recommendation: "Setze <link rel='canonical'> um Duplicate Content zu vermeiden." });

  // Images without alt
  const imgs = [...html.matchAll(/<img[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((i) => !/alt=["'][^"']*["']/i.test(i) || /alt=["']\s*["']/i.test(i));
  if (noAlt.length > 0) findings.push({ url, category: "onpage", severity: "warning", code: "IMG_NO_ALT", title: `${noAlt.length} Bild(er) ohne alt-Text`, current_value: `${noAlt.length}/${imgs.length}`, recommendation: "Setze beschreibende alt-Attribute für SEO + Accessibility." });

  // OpenGraph / Twitter
  if (!extractMeta(html, "og:title")) findings.push({ url, category: "onpage", severity: "info", code: "MISSING_OG", title: "OpenGraph-Tags fehlen", recommendation: "Füge og:title, og:description, og:image für Social Sharing hinzu." });

  // JSON-LD
  if (!/application\/ld\+json/i.test(html)) findings.push({ url, category: "schema", severity: "info", code: "NO_SCHEMA", title: "Kein Schema.org JSON-LD gefunden", recommendation: "Implementiere strukturierte Daten (Organization, WebSite, BreadcrumbList)." });

  return findings;
}

function analyzeTechnical(url: string, status: number, headers: Headers, html: string): Finding[] {
  const findings: Finding[] = [];
  if (status >= 400) findings.push({ url, category: "technical", severity: "critical", code: `HTTP_${status}`, title: `HTTP ${status}`, recommendation: "URL ist nicht erreichbar. Korrigiere Link oder setze 301-Redirect." });

  const ct = headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) findings.push({ url, category: "technical", severity: "info", code: "NON_HTML", title: `Content-Type: ${ct}` });

  if (!headers.get("strict-transport-security")) findings.push({ url, category: "technical", severity: "info", code: "NO_HSTS", title: "HSTS-Header fehlt", recommendation: "Setze Strict-Transport-Security Header für mehr Sicherheit." });

  // Viewport
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) findings.push({ url, category: "technical", severity: "warning", code: "NO_VIEWPORT", title: "Viewport-Meta-Tag fehlt", recommendation: "Pflicht für Mobile SEO: <meta name='viewport' content='width=device-width, initial-scale=1'>" });

  // Lang
  if (!/<html[^>]+lang=/i.test(html)) findings.push({ url, category: "technical", severity: "warning", code: "NO_LANG", title: "html lang-Attribut fehlt", recommendation: "Setze <html lang='de'> für korrekte Sprachzuordnung." });

  // Page weight
  const sizeKb = Math.round(html.length / 1024);
  if (sizeKb > 500) findings.push({ url, category: "performance", severity: "warning", code: "LARGE_HTML", title: "HTML-Dokument sehr groß", current_value: `${sizeKb} KB`, expected_value: "< 200 KB", recommendation: "Reduziere DOM-Größe, lazy-load nicht-kritische Inhalte." });

  return findings;
}

async function checkRobotsAndSitemap(origin: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const robots = await fetchText(`${origin}/robots.txt`);
  if (!robots || robots.status >= 400) {
    findings.push({ url: `${origin}/robots.txt`, category: "technical", severity: "critical", code: "NO_ROBOTS", title: "robots.txt fehlt", recommendation: "Lege /robots.txt mit Sitemap-Referenz an.", auto_fixable: true });
  } else if (!/sitemap:/i.test(robots.html)) {
    findings.push({ url: `${origin}/robots.txt`, category: "technical", severity: "warning", code: "ROBOTS_NO_SITEMAP", title: "robots.txt ohne Sitemap-Referenz", recommendation: "Füge `Sitemap: https://.../sitemap.xml` hinzu.", auto_fixable: true });
  }
  const sitemap = await fetchText(`${origin}/sitemap.xml`);
  if (!sitemap || sitemap.status >= 400) {
    findings.push({ url: `${origin}/sitemap.xml`, category: "technical", severity: "critical", code: "NO_SITEMAP", title: "sitemap.xml fehlt", recommendation: "Generiere und veröffentliche eine sitemap.xml.", auto_fixable: true });
  }
  return findings;
}

async function getSitemapUrls(origin: string): Promise<string[]> {
  const r = await fetchText(`${origin}/sitemap.xml`);
  if (!r) return [];
  const urls = [...r.html.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
  return urls;
}

async function pageSpeed(url: string): Promise<Finding[]> {
  if (!PSI_KEY) return [];
  const findings: Finding[] = [];
  try {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${PSI_KEY}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25000);
    const res = await fetch(api, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return [];
    const data = await res.json();
    const lh = data?.lighthouseResult;
    const score = Math.round((lh?.categories?.performance?.score ?? 0) * 100);
    const lcp = lh?.audits?.["largest-contentful-paint"]?.displayValue;
    const cls = lh?.audits?.["cumulative-layout-shift"]?.displayValue;
    const tbt = lh?.audits?.["total-blocking-time"]?.displayValue;

    if (score < 50) findings.push({ url, category: "performance", severity: "critical", code: "LOW_PSI", title: `PageSpeed Score ${score}/100`, current_value: `${score}`, expected_value: "≥ 90", recommendation: "Optimiere Bilder, reduziere JS, nutze Caching." });
    else if (score < 90) findings.push({ url, category: "performance", severity: "warning", code: "MID_PSI", title: `PageSpeed Score ${score}/100`, current_value: `${score}`, expected_value: "≥ 90" });
    else findings.push({ url, category: "performance", severity: "info", code: "GOOD_PSI", title: `PageSpeed Score ${score}/100 ✓` });

    const lcpVal = lh?.audits?.["largest-contentful-paint"]?.numericValue ?? 0;
    if (lcpVal > 2500) findings.push({ url, category: "performance", severity: lcpVal > 4000 ? "critical" : "warning", code: "POOR_LCP", title: `LCP zu hoch: ${lcp}`, expected_value: "≤ 2.5s", recommendation: "Hero-Bild preloaden, kritisches CSS inline, CDN nutzen." });
    const clsVal = lh?.audits?.["cumulative-layout-shift"]?.numericValue ?? 0;
    if (clsVal > 0.1) findings.push({ url, category: "performance", severity: clsVal > 0.25 ? "critical" : "warning", code: "POOR_CLS", title: `CLS zu hoch: ${cls}`, expected_value: "≤ 0.1", recommendation: "Setze width/height auf Bilder, vermeide late-loaded Layouts." });
    const tbtVal = lh?.audits?.["total-blocking-time"]?.numericValue ?? 0;
    if (tbtVal > 200) findings.push({ url, category: "performance", severity: "warning", code: "POOR_TBT", title: `TBT hoch: ${tbt}`, expected_value: "≤ 200ms", recommendation: "Splitte JS-Bundles, defer/async non-critical Scripts." });
  } catch (_e) {
    // silent
  }
  return findings;
}

async function runScan(runId: string, supabase: ReturnType<typeof createClient>, origin: string, scanType: string) {
  const startTs = Date.now();
  const findings: Finding[] = [];

  // 1. Technical: robots + sitemap
  findings.push(...(await checkRobotsAndSitemap(origin)));

  // 2. URLs
  let urls = await getSitemapUrls(origin);
  if (urls.length === 0) urls = [origin];
  if (scanType === "single") urls = urls.slice(0, 1);
  // Limit to 30 URLs per run for stability
  urls = urls.slice(0, 30);

  // 3. Per-URL analysis (sequential w/ small concurrency)
  let scanned = 0;
  for (const url of urls) {
    const r = await fetchText(url);
    if (!r) {
      findings.push({ url, category: "technical", severity: "critical", code: "FETCH_FAIL", title: "Seite nicht erreichbar" });
      continue;
    }
    findings.push(...analyzeTechnical(url, r.status, r.headers, r.html));
    findings.push(...analyzeOnPage(url, r.html));
    if (PSI_KEY && scanned < 5) {
      // PSI is slow + quota-limited → max 5 PSI runs per scan
      findings.push(...(await pageSpeed(url)));
    }
    scanned++;
  }

  // 4. Score
  const totalDeduction = findings.reduce((s, f) => s + SEVERITY_WEIGHT[f.severity], 0);
  const score = Math.max(0, Math.min(100, 100 - Math.round(totalDeduction / Math.max(1, scanned))));
  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    info: findings.filter((f) => f.severity === "info").length,
  };

  // 5. Persist findings
  if (findings.length > 0) {
    const rows = findings.map((f) => ({ ...f, run_id: runId }));
    // chunk insert
    for (let i = 0; i < rows.length; i += 200) {
      await supabase.from("seo_audit_findings").insert(rows.slice(i, i + 200));
    }
  }

  await supabase.from("seo_audit_runs").update({
    status: "completed",
    urls_scanned: scanned,
    findings_count: findings.length,
    critical_count: counts.critical,
    warning_count: counts.warning,
    info_count: counts.info,
    overall_score: score,
    duration_ms: Date.now() - startTs,
    completed_at: new Date().toISOString(),
  }).eq("id", runId);
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

    const body = await req.json().catch(() => ({}));
    const origin: string = (body.origin || "https://ideatolaunch-hub.lovable.app").replace(/\/$/, "");
    const scanType: string = body.scanType || "full";

    const { data: run, error: runErr } = await supabase.from("seo_audit_runs").insert({
      triggered_by: user.id,
      status: "running",
      scan_type: scanType,
      target_urls: [origin],
    }).select("id").single();

    if (runErr || !run) throw runErr ?? new Error("Failed to create run");

    // Background processing
    // @ts-ignore EdgeRuntime is available in Supabase Edge
    EdgeRuntime.waitUntil(runScan(run.id as string, supabase, origin, scanType).catch(async (e) => {
      console.error("[seo-audit-scan] failed:", e);
      await supabase.from("seo_audit_runs").update({ status: "failed", error_message: String(e?.message ?? e), completed_at: new Date().toISOString() }).eq("id", run.id);
    }));

    return new Response(JSON.stringify({ runId: run.id, status: "running" }), { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[seo-audit-scan] error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
