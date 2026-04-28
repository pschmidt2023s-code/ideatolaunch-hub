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

  // ===== Modul 4: JSON-LD / Schema.org Validator =====
  findings.push(...analyzeSchema(url, html));

  return findings;
}

// Required properties per schema type for Rich-Snippet-Eligibility (Google Search Central)
const RICH_SNIPPET_REQUIREMENTS: Record<string, { required: string[]; recommended: string[] }> = {
  Product: { required: ["name", "image", "offers"], recommended: ["description", "brand", "aggregateRating", "review", "sku", "gtin"] },
  Article: { required: ["headline", "image", "datePublished", "author"], recommended: ["dateModified", "publisher"] },
  NewsArticle: { required: ["headline", "image", "datePublished", "author"], recommended: ["dateModified", "publisher"] },
  BlogPosting: { required: ["headline", "image", "datePublished", "author"], recommended: ["dateModified", "publisher"] },
  Recipe: { required: ["name", "image", "recipeIngredient", "recipeInstructions"], recommended: ["author", "datePublished", "description", "nutrition", "aggregateRating"] },
  Event: { required: ["name", "startDate", "location"], recommended: ["endDate", "image", "description", "offers", "performer"] },
  FAQPage: { required: ["mainEntity"], recommended: [] },
  HowTo: { required: ["name", "step"], recommended: ["image", "totalTime", "estimatedCost", "supply", "tool"] },
  Organization: { required: ["name"], recommended: ["url", "logo", "sameAs", "contactPoint"] },
  LocalBusiness: { required: ["name", "address"], recommended: ["telephone", "openingHours", "image", "priceRange", "geo"] },
  Person: { required: ["name"], recommended: ["jobTitle", "image", "url", "sameAs"] },
  WebSite: { required: ["name", "url"], recommended: ["potentialAction"] },
  BreadcrumbList: { required: ["itemListElement"], recommended: [] },
  VideoObject: { required: ["name", "description", "thumbnailUrl", "uploadDate"], recommended: ["duration", "contentUrl", "embedUrl"] },
  Review: { required: ["reviewRating", "author"], recommended: ["itemReviewed", "datePublished"] },
  Course: { required: ["name", "description", "provider"], recommended: ["offers", "hasCourseInstance"] },
  JobPosting: { required: ["title", "description", "datePosted", "hiringOrganization", "jobLocation"], recommended: ["baseSalary", "employmentType", "validThrough"] },
};

function flattenJsonLd(node: any, out: any[] = []): any[] {
  if (!node) return out;
  if (Array.isArray(node)) { for (const n of node) flattenJsonLd(n, out); return out; }
  if (typeof node !== "object") return out;
  if (node["@graph"] && Array.isArray(node["@graph"])) { for (const n of node["@graph"]) flattenJsonLd(n, out); }
  if (node["@type"]) out.push(node);
  return out;
}

function analyzeSchema(url: string, html: string): Finding[] {
  const findings: Finding[] = [];
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim());

  if (blocks.length === 0) {
    findings.push({ url, category: "schema", severity: "warning", code: "SCHEMA_MISSING", title: "Kein Schema.org JSON-LD gefunden", recommendation: "Implementiere strukturierte Daten (Organization, WebSite, BreadcrumbList) für Rich Snippets.", auto_fixable: true });
    return findings;
  }

  const allTypes: string[] = [];
  let parseErrors = 0;

  for (const raw of blocks) {
    let parsed: any;
    try { parsed = JSON.parse(raw); }
    catch (e) {
      parseErrors++;
      findings.push({ url, category: "schema", severity: "critical", code: "SCHEMA_INVALID_JSON", title: "JSON-LD Block enthält ungültiges JSON", current_value: (e instanceof Error ? e.message : "parse error").slice(0, 120), recommendation: "Validiere JSON-Syntax (Trailing-Commas, Quotes). Block wird von Google ignoriert." });
      continue;
    }

    const nodes = flattenJsonLd(parsed);
    for (const node of nodes) {
      const ctx = node["@context"] ?? parsed["@context"];
      if (ctx && !/schema\.org/i.test(typeof ctx === "string" ? ctx : JSON.stringify(ctx))) {
        findings.push({ url, category: "schema", severity: "warning", code: "SCHEMA_BAD_CONTEXT", title: "Ungültiger @context", current_value: String(ctx).slice(0, 80), expected_value: "https://schema.org", recommendation: "Setze @context auf 'https://schema.org'." });
      }

      const typeRaw = node["@type"];
      const types = Array.isArray(typeRaw) ? typeRaw : [typeRaw];
      for (const t of types) {
        if (!t) continue;
        allTypes.push(t);
        const spec = RICH_SNIPPET_REQUIREMENTS[t];
        if (!spec) continue;

        const missingRequired = spec.required.filter((p) => node[p] === undefined || node[p] === null || node[p] === "");
        if (missingRequired.length > 0) {
          findings.push({
            url, category: "schema", severity: "critical",
            code: `SCHEMA_${t.toUpperCase()}_INCOMPLETE`,
            title: `${t}-Schema unvollständig (Rich Snippet blockiert)`,
            current_value: `Fehlend: ${missingRequired.join(", ")}`,
            expected_value: spec.required.join(", "),
            recommendation: `Google verweigert Rich Snippets ohne: ${missingRequired.join(", ")}.`,
            auto_fixable: true,
          });
        }

        const missingRecommended = spec.recommended.filter((p) => node[p] === undefined || node[p] === null || node[p] === "");
        if (missingRecommended.length > 0 && missingRequired.length === 0) {
          findings.push({
            url, category: "schema", severity: "info",
            code: `SCHEMA_${t.toUpperCase()}_OPTIMIZE`,
            title: `${t}-Schema kann erweitert werden`,
            current_value: `Optional fehlt: ${missingRecommended.slice(0, 5).join(", ")}`,
            recommendation: "Optionale Felder erhöhen Rich-Snippet-Qualität & CTR.",
          });
        }

        // Special: Product needs Offers with price
        if (t === "Product" && node.offers) {
          const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          if (!offers.price && !offers.lowPrice) {
            findings.push({ url, category: "schema", severity: "critical", code: "SCHEMA_PRODUCT_NO_PRICE", title: "Product-Offer ohne Preis", recommendation: "Setze offers.price + offers.priceCurrency für Rich Snippets." });
          }
          if (!offers.priceCurrency) {
            findings.push({ url, category: "schema", severity: "warning", code: "SCHEMA_PRODUCT_NO_CURRENCY", title: "Product-Offer ohne priceCurrency", recommendation: "Setze offers.priceCurrency (z. B. 'EUR')." });
          }
        }

        // FAQPage: at least 2 questions
        if (t === "FAQPage" && Array.isArray(node.mainEntity) && node.mainEntity.length < 2) {
          findings.push({ url, category: "schema", severity: "warning", code: "SCHEMA_FAQ_TOO_FEW", title: "FAQPage mit weniger als 2 Fragen", recommendation: "Google empfiehlt mindestens 2 Q&A-Paare." });
        }
      }
    }
  }

  // Eligibility hint: page has schema but none of the rich-snippet types
  const hasRichType = allTypes.some((t) => RICH_SNIPPET_REQUIREMENTS[t]);
  if (parseErrors === 0 && !hasRichType && allTypes.length > 0) {
    findings.push({ url, category: "schema", severity: "info", code: "SCHEMA_NO_RICH_TYPE", title: "Schema vorhanden, aber kein Rich-Snippet-Typ", current_value: allTypes.join(", "), recommendation: "Ergänze Product, Article, FAQPage o. ä. für sichtbare SERP-Features." });
  }

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

// ===== Modul 5: Internal Linking Graph =====
function analyzeLinkGraph(
  pages: Array<{ url: string; outLinks: Array<{ href: string; anchor: string }>; status: number }>,
  originHost: string,
  origin: string,
): Finding[] {
  const findings: Finding[] = [];
  if (pages.length === 0) return findings;

  const pageUrls = new Set(pages.map((p) => p.url));
  const inDegree = new Map<string, number>();
  const inboundAnchors = new Map<string, string[]>();
  const allInternalEdges: Array<{ from: string; to: string; anchor: string }> = [];
  const externalDomains = new Map<string, number>();

  for (const p of pages) {
    inDegree.set(p.url, inDegree.get(p.url) ?? 0);
    const seenOnPage = new Set<string>();
    for (const link of p.outLinks) {
      let host = "";
      try { host = new URL(link.href).host; } catch { continue; }
      const norm = link.href.replace(/\/$/, "");

      if (host === originHost) {
        if (norm === p.url) continue; // self link
        if (seenOnPage.has(norm)) continue;
        seenOnPage.add(norm);
        inDegree.set(norm, (inDegree.get(norm) ?? 0) + 1);
        const arr = inboundAnchors.get(norm) ?? [];
        arr.push(link.anchor);
        inboundAnchors.set(norm, arr);
        allInternalEdges.push({ from: p.url, to: norm, anchor: link.anchor });
      } else {
        externalDomains.set(host, (externalDomains.get(host) ?? 0) + 1);
      }
    }
  }

  // 1. Orphan pages (in sitemap aber 0 interne Links)
  for (const p of pages) {
    if (p.url === origin || p.url === origin.replace(/\/$/, "")) continue;
    const inDeg = inDegree.get(p.url) ?? 0;
    if (inDeg === 0) {
      findings.push({
        url: p.url, category: "links", severity: "warning", code: "ORPHAN_PAGE",
        title: "Orphan-Seite: keine internen Verlinkungen",
        recommendation: "Verlinke diese Seite aus relevantem Content (Hub-Pages, Footer, Navigation). Ohne interne Links bekommt Google kaum Crawl-Signal.",
      });
    } else if (inDeg === 1) {
      findings.push({
        url: p.url, category: "links", severity: "info", code: "WEAK_INBOUND",
        title: "Nur 1 interner Link auf diese Seite",
        current_value: "1", expected_value: "≥ 3",
        recommendation: "Wichtige Seiten brauchen mind. 3 interne Links für PageRank-Fluss.",
      });
    }
  }

  // 2. Broken internal links (Linkziel ist 4xx/5xx)
  const failedUrls = new Set(pages.filter((p) => p.status >= 400).map((p) => p.url));
  const brokenLinkMap = new Map<string, Set<string>>();
  for (const e of allInternalEdges) {
    if (failedUrls.has(e.to)) {
      const set = brokenLinkMap.get(e.from) ?? new Set();
      set.add(e.to);
      brokenLinkMap.set(e.from, set);
    }
  }
  for (const [from, targets] of brokenLinkMap) {
    findings.push({
      url: from, category: "links", severity: "critical", code: "BROKEN_INTERNAL_LINK",
      title: `${targets.size} interne(r) Link(s) führen zu 4xx/5xx`,
      current_value: [...targets].slice(0, 3).join(", "),
      recommendation: "Korrigiere oder entferne defekte Links — sie verschwenden Crawl-Budget und schaden UX.",
      auto_fixable: false,
    });
  }

  // 3. Generic Anchor Text (z. B. "hier", "klick", "mehr")
  const GENERIC = new Set(["hier", "klick", "klicken", "click", "more", "mehr", "weiter", "lesen", "read more", "learn more", "this", "link", "go"]);
  for (const [target, anchors] of inboundAnchors) {
    const generic = anchors.filter((a) => a && GENERIC.has(a.toLowerCase().trim()));
    if (generic.length > 0 && generic.length / anchors.length > 0.5) {
      findings.push({
        url: target, category: "links", severity: "info", code: "GENERIC_ANCHOR",
        title: `${generic.length} interne Links nutzen generische Anker`,
        current_value: [...new Set(generic)].slice(0, 3).join(", "),
        recommendation: "Nutze beschreibende Ankertexte mit Keywords statt 'hier' oder 'mehr lesen'. Google wertet Anchor-Text als Ranking-Signal.",
      });
    }
  }

  // 4. Empty / image-only anchors
  for (const p of pages) {
    let emptyCount = 0;
    for (const l of p.outLinks) {
      try { if (new URL(l.href).host !== originHost) continue; } catch { continue; }
      if (!l.anchor || l.anchor.length < 2) emptyCount++;
    }
    if (emptyCount >= 3) {
      findings.push({
        url: p.url, category: "links", severity: "info", code: "EMPTY_ANCHORS",
        title: `${emptyCount} Links ohne Anker-Text`,
        recommendation: "Setze aria-label oder Text in <a>-Elementen für SEO + Accessibility.",
      });
    }
  }

  // 5. Excessive external links (Spam-Signal)
  for (const p of pages) {
    const ext = p.outLinks.filter((l) => { try { return new URL(l.href).host !== originHost; } catch { return false; } }).length;
    if (ext > 100) {
      findings.push({
        url: p.url, category: "links", severity: "warning", code: "EXCESSIVE_EXTERNAL",
        title: `${ext} externe Links auf einer Seite`,
        current_value: `${ext}`, expected_value: "< 100",
        recommendation: "Zu viele externe Links wirken spammy & verlieren Link-Equity. Setze rel='nofollow' wo nötig.",
      });
    }
  }

  // 6. Pseudo-PageRank: 8 Iterationen, einfache Approximation
  const N = pages.length;
  if (N >= 5) {
    const damp = 0.85;
    const rank = new Map<string, number>();
    for (const p of pages) rank.set(p.url, 1 / N);
    const outCount = new Map<string, number>();
    const inboundEdges = new Map<string, string[]>();
    for (const e of allInternalEdges) {
      outCount.set(e.from, (outCount.get(e.from) ?? 0) + 1);
      const arr = inboundEdges.get(e.to) ?? [];
      arr.push(e.from);
      inboundEdges.set(e.to, arr);
    }
    for (let iter = 0; iter < 8; iter++) {
      const next = new Map<string, number>();
      for (const p of pages) {
        const incoming = inboundEdges.get(p.url) ?? [];
        let sum = 0;
        for (const src of incoming) {
          const oc = outCount.get(src) ?? 1;
          sum += (rank.get(src) ?? 0) / oc;
        }
        next.set(p.url, (1 - damp) / N + damp * sum);
      }
      for (const [k, v] of next) rank.set(k, v);
    }

    // Findings: Wichtige Seiten (homepage, root) mit niedrigem Rank → schlechte Link-Architektur
    const sorted = [...rank.entries()].sort((a, b) => b[1] - a[1]);
    const median = sorted[Math.floor(sorted.length / 2)][1];
    const homepage = pages.find((p) => p.url === origin || p.url === origin.replace(/\/$/, ""));
    if (homepage) {
      const homeRank = rank.get(homepage.url) ?? 0;
      const topRank = sorted[0][1];
      if (homeRank < topRank * 0.5) {
        findings.push({
          url: homepage.url, category: "links", severity: "warning", code: "WEAK_HOMEPAGE_AUTHORITY",
          title: "Homepage hat niedrigeren Pseudo-PageRank als andere Seiten",
          current_value: homeRank.toFixed(4), expected_value: `≈ ${topRank.toFixed(4)}`,
          recommendation: "Verlinke die Homepage stärker aus Footer/Navigation. Sie sollte die höchste interne Autorität haben.",
        });
      }
    }

    // Top 5% Seiten mit überdurchschnittlich vielen Outbound-Links und niedrigem Rank
    for (const [url, r] of sorted.slice(-Math.ceil(sorted.length * 0.1))) {
      if (r < median * 0.3 && (outCount.get(url) ?? 0) > 10) {
        findings.push({
          url, category: "links", severity: "info", code: "LINK_SINK",
          title: "Link-Sink: viele ausgehende, kaum eingehende Links",
          current_value: `Rank ${r.toFixed(4)} / ${outCount.get(url)} outgoing`,
          recommendation: "Diese Seite verteilt Link-Equity ohne welche zu erhalten. Erhöhe interne Verlinkung auf sie.",
        });
      }
    }
  }

  return findings;
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

// ===== Modul 6: AI Content Detection =====
// Heuristik basiert auf typischen LLM-Mustern: Phrasen, Satzlängen-Varianz, Filler-Wörter.
const AI_PHRASES = [
  "in the realm of", "in der welt von", "it's important to note", "es ist wichtig zu beachten",
  "delve into", "tauchen wir ein", "navigating the", "navigieren durch",
  "as an ai", "als ki", "as a language model", "als sprachmodell",
  "in conclusion", "zusammenfassend lässt sich sagen", "in today's fast-paced",
  "in der heutigen schnelllebigen", "let's explore", "lassen sie uns erkunden",
  "furthermore", "darüber hinaus", "moreover", "des weiteren",
  "it's worth noting", "es lohnt sich zu erwähnen", "a testament to", "ein zeugnis für",
  "tapestry of", "geflecht aus", "landscape of", "landschaft der",
  "embark on a journey", "begeben sie sich auf eine reise",
];

function analyzeAIContent(url: string, bodyText: string): Finding[] {
  const findings: Finding[] = [];
  if (!bodyText || bodyText.length < 500) return findings;
  const text = bodyText.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 100) return findings;

  // 1. Phrase-Matching
  let phraseHits = 0;
  const matchedPhrases: string[] = [];
  for (const p of AI_PHRASES) {
    if (text.includes(p)) { phraseHits++; matchedPhrases.push(p); }
  }

  // 2. Sentence-Length-Varianz (LLMs schreiben sehr gleichmäßig)
  const sentences = bodyText.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 10);
  let varianceScore = 0;
  if (sentences.length >= 5) {
    const lens = sentences.map((s) => s.split(/\s+/).length);
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const variance = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0; // Variationskoeffizient
    if (cv < 0.35) varianceScore = 2; // sehr uniform = LLM-Indikator
    else if (cv < 0.5) varianceScore = 1;
  }

  // 3. Filler/Hedging-Density
  const fillers = ["however", "additionally", "essentially", "basically", "fundamentally", "jedoch", "zusätzlich", "grundsätzlich", "letztendlich", "im wesentlichen"];
  let fillerCount = 0;
  for (const f of fillers) {
    const re = new RegExp(`\\b${f}\\b`, "gi");
    fillerCount += (text.match(re) ?? []).length;
  }
  const fillerDensity = (fillerCount / words.length) * 1000; // pro 1000 Wörter

  // Score
  const aiScore = phraseHits * 15 + varianceScore * 20 + Math.min(30, fillerDensity * 3);

  if (aiScore >= 60) {
    findings.push({
      url, category: "onpage", severity: "warning", code: "AI_CONTENT_LIKELY",
      title: `AI-generierter Content wahrscheinlich (Score ${Math.round(aiScore)}/100)`,
      description: `${phraseHits} LLM-Phrasen, Varianz=${varianceScore}/2, Filler-Dichte=${fillerDensity.toFixed(1)}/1k${matchedPhrases.length ? ` – z.B. "${matchedPhrases.slice(0,3).join('", "')}"` : ""}`,
      current_value: `${Math.round(aiScore)}/100`,
      expected_value: "< 40",
      recommendation: "Editiere Inhalte mit persönlichen Beispielen, variiere Satzlängen, entferne generische LLM-Floskeln. Google's E-E-A-T bevorzugt menschliche Erfahrung.",
    });
  } else if (aiScore >= 35) {
    findings.push({
      url, category: "onpage", severity: "info", code: "AI_CONTENT_POSSIBLE",
      title: `AI-Spuren möglich (Score ${Math.round(aiScore)}/100)`,
      description: `${phraseHits} LLM-Phrasen, Varianz=${varianceScore}/2, Filler-Dichte=${fillerDensity.toFixed(1)}/1k`,
      recommendation: "Optional: Inhalt menschlicher gestalten (Anekdoten, Meinungen, Branchen-Insights).",
    });
  }
  return findings;
}

// ===== Modul 7: Live Index Status =====
// Vergleicht Sitemap-URLs mit Google-Index (Approximation via search.brave.com / DuckDuckGo HTML).
async function checkIndexStatus(origin: string, sitemapUrls: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];
  if (sitemapUrls.length === 0) return findings;
  const host = (() => { try { return new URL(origin).host; } catch { return ""; } })();
  if (!host) return findings;

  // Verwende DuckDuckGo HTML-Endpoint (kein API-Key nötig, mild rate-limited)
  let indexedApprox = 0;
  let querySucceeded = false;
  try {
    const q = encodeURIComponent(`site:${host}`);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; BrandOS-SEOBot/1.0)" } });
    clearTimeout(t);
    if (res.ok) {
      const html = await res.text();
      // Zähle eindeutige result-Links
      const re = /<a[^>]+class=["'][^"']*result__url[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
      const set = new Set<string>();
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null) {
        const t2 = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, "").toLowerCase();
        if (t2) set.add(t2);
      }
      indexedApprox = set.size;
      querySucceeded = true;
    }
  } catch (_e) { /* silent */ }

  if (!querySucceeded) {
    findings.push({
      url: origin, category: "technical", severity: "info", code: "INDEX_CHECK_UNAVAILABLE",
      title: "Index-Status konnte nicht geprüft werden",
      recommendation: "Prüfe manuell via Google Search Console > Abdeckung.",
    });
    return findings;
  }

  const sitemapCount = sitemapUrls.length;
  // DuckDuckGo HTML zeigt nur ~10-30 Ergebnisse pro Page → Approximation
  // Wenn > 5 indiziert, gilt Domain als generell indiziert
  if (indexedApprox === 0) {
    findings.push({
      url: origin, category: "technical", severity: "critical", code: "NOT_INDEXED",
      title: "Domain scheint nicht indiziert",
      current_value: "0 Treffer",
      expected_value: `~${sitemapCount} Seiten`,
      recommendation: "Reiche Sitemap in Google Search Console ein. Prüfe robots.txt und 'noindex'-Tags.",
    });
  } else if (indexedApprox < Math.min(sitemapCount * 0.3, 5)) {
    findings.push({
      url: origin, category: "technical", severity: "warning", code: "LOW_INDEX_COVERAGE",
      title: `Nur ~${indexedApprox} von ${sitemapCount} Seiten indiziert`,
      current_value: `${indexedApprox}`,
      expected_value: `≥ ${Math.round(sitemapCount * 0.7)}`,
      recommendation: "Beschleunige Indexierung: Sitemap pingen, interne Links zu unindizierten Seiten setzen, Crawl-Errors fixen.",
    });
  } else {
    findings.push({
      url: origin, category: "technical", severity: "info", code: "INDEX_OK",
      title: `~${indexedApprox} Seiten indiziert (Approximation)`,
      description: `Sitemap enthält ${sitemapCount} URLs. DuckDuckGo zeigt ${indexedApprox} eindeutige Treffer.`,
    });
  }
  return findings;
}

// ===== Modul 8: Core Web Vitals Deep-Dive =====
// Detaillierte Aufschlüsselung von LCP/CLS/INP/FCP/TTFB pro URL inkl. spezifischer Empfehlungen.
async function pageSpeedDeepDive(url: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  if (!PSI_KEY) return findings;
  try {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`
      + `&key=${PSI_KEY}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30000);
    const res = await fetch(api, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return [];
    const data = await res.json();
    const lh = data?.lighthouseResult;
    if (!lh) return [];

    // FCP
    const fcp = lh.audits?.["first-contentful-paint"];
    const fcpVal = fcp?.numericValue ?? 0;
    if (fcpVal > 1800) {
      findings.push({
        url, category: "performance", severity: fcpVal > 3000 ? "warning" : "info",
        code: "POOR_FCP", title: `FCP zu hoch: ${fcp?.displayValue}`,
        current_value: fcp?.displayValue, expected_value: "≤ 1.8s",
        recommendation: "Render-blocking CSS/JS reduzieren, Server-Antwortzeit verbessern (TTFB).",
      });
    }

    // TTFB
    const ttfb = lh.audits?.["server-response-time"];
    const ttfbVal = ttfb?.numericValue ?? 0;
    if (ttfbVal > 600) {
      findings.push({
        url, category: "performance", severity: ttfbVal > 1500 ? "warning" : "info",
        code: "POOR_TTFB", title: `TTFB zu hoch: ${Math.round(ttfbVal)}ms`,
        current_value: `${Math.round(ttfbVal)}ms`, expected_value: "≤ 600ms",
        recommendation: "CDN aktivieren, Edge-Caching, DB-Queries optimieren, statisches Pre-Rendering.",
      });
    }

    // INP (Interaction to Next Paint) - replaces FID
    const inp = lh.audits?.["interaction-to-next-paint"] ?? lh.audits?.["max-potential-fid"];
    const inpVal = inp?.numericValue ?? 0;
    if (inpVal > 200) {
      findings.push({
        url, category: "performance", severity: inpVal > 500 ? "critical" : "warning",
        code: "POOR_INP", title: `INP/Responsiveness schwach: ${Math.round(inpVal)}ms`,
        current_value: `${Math.round(inpVal)}ms`, expected_value: "≤ 200ms",
        recommendation: "Long Tasks (>50ms) splitten, debounce Event-Handler, vermeide synchrones JS bei Klick/Tap.",
      });
    }

    // Speed Index
    const si = lh.audits?.["speed-index"];
    const siVal = si?.numericValue ?? 0;
    if (siVal > 3400) {
      findings.push({
        url, category: "performance", severity: siVal > 5800 ? "warning" : "info",
        code: "POOR_SI", title: `Speed Index hoch: ${si?.displayValue}`,
        current_value: si?.displayValue, expected_value: "≤ 3.4s",
        recommendation: "Above-the-fold zuerst rendern, kritische Bilder priorisieren (fetchpriority='high').",
      });
    }

    // LCP-Element-Detail
    const lcpEl = lh.audits?.["largest-contentful-paint-element"];
    if (lcpEl?.details?.items?.[0]?.node?.snippet) {
      const snippet = String(lcpEl.details.items[0].node.snippet).slice(0, 120);
      const lcpVal2 = lh.audits?.["largest-contentful-paint"]?.numericValue ?? 0;
      if (lcpVal2 > 2500) {
        findings.push({
          url, category: "performance", severity: "info", code: "LCP_ELEMENT_INFO",
          title: "LCP-Element identifiziert",
          description: `Element: ${snippet}`,
          recommendation: snippet.toLowerCase().includes("img") ? "Preload dieses Bild mit <link rel='preload' as='image' fetchpriority='high'>." : "Reduziere Render-Zeit dieses Elements (kritisches CSS inline).",
        });
      }
    }

    // Unused JS / CSS
    const unusedJs = lh.audits?.["unused-javascript"];
    const unusedJsBytes = unusedJs?.details?.overallSavingsBytes ?? 0;
    if (unusedJsBytes > 50000) {
      findings.push({
        url, category: "performance", severity: unusedJsBytes > 200000 ? "warning" : "info",
        code: "UNUSED_JS", title: `${Math.round(unusedJsBytes / 1024)}KB ungenutztes JavaScript`,
        current_value: `${Math.round(unusedJsBytes / 1024)}KB`, expected_value: "< 50KB",
        recommendation: "Code-Splitting via React.lazy(), Tree-Shaking, entferne ungenutzte Dependencies.",
      });
    }
    const unusedCss = lh.audits?.["unused-css-rules"];
    const unusedCssBytes = unusedCss?.details?.overallSavingsBytes ?? 0;
    if (unusedCssBytes > 30000) {
      findings.push({
        url, category: "performance", severity: "info", code: "UNUSED_CSS",
        title: `${Math.round(unusedCssBytes / 1024)}KB ungenutztes CSS`,
        current_value: `${Math.round(unusedCssBytes / 1024)}KB`, expected_value: "< 30KB",
        recommendation: "PurgeCSS/Tailwind-JIT nutzen, kritisches CSS extrahieren.",
      });
    }

    // Modern image formats
    const modernImg = lh.audits?.["modern-image-formats"];
    const imgSavings = modernImg?.details?.overallSavingsBytes ?? 0;
    if (imgSavings > 20000) {
      findings.push({
        url, category: "performance", severity: "info", code: "LEGACY_IMAGES",
        title: `Bilder nicht in WebP/AVIF: ${Math.round(imgSavings / 1024)}KB Einsparung möglich`,
        recommendation: "Konvertiere PNG/JPG zu WebP oder AVIF (50-80% kleiner).",
      });
    }
  } catch (_e) { /* silent */ }
  return findings;
}

async function runScan(runId: string, supabase: ReturnType<typeof createClient>, origin: string, scanType: string) {
  const startTs = Date.now();
  const findings: Finding[] = [];

  // 1. Technical: robots + sitemap
  findings.push(...(await checkRobotsAndSitemap(origin)));

  // 2. URLs (limit raised: 150 URLs)
  let urls = await getSitemapUrls(origin);
  if (urls.length === 0) urls = [origin];
  if (scanType === "single") urls = urls.slice(0, 1);
  const MAX_URLS = 150;
  const PSI_LIMIT = 15;
  urls = urls.slice(0, MAX_URLS);

  // 3. Parallel per-URL analysis with concurrency=6
  const pageData: Array<{ url: string; html: string; title: string; bodyText: string; outLinks: Array<{ href: string; anchor: string }>; status: number }> = [];
  let scanned = 0;
  const CONCURRENCY = 6;

  const originHost = new URL(origin).host;

  function extractLinks(html: string, baseUrl: string): Array<{ href: string; anchor: string }> {
    const out: Array<{ href: string; anchor: string }> = [];
    const re = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      try {
        const abs = new URL(m[1], baseUrl).toString().replace(/#.*$/, "").replace(/\/$/, "");
        if (!abs.startsWith("http")) continue;
        const anchor = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        out.push({ href: abs, anchor });
      } catch { /* invalid url */ }
    }
    return out;
  }

  async function processUrl(url: string, index: number) {
    const r = await fetchText(url);
    if (!r) {
      findings.push({ url, category: "technical", severity: "critical", code: "FETCH_FAIL", title: "Seite nicht erreichbar" });
      return;
    }
    findings.push(...analyzeTechnical(url, r.status, r.headers, r.html));
    findings.push(...analyzeOnPage(url, r.html));

    // Module 2: collect for content/duplicate analysis
    const title = (r.html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "").trim();
    const bodyText = r.html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const outLinks = extractLinks(r.html, url);
    pageData.push({ url: url.replace(/\/$/, ""), html: r.html, title, bodyText, outLinks, status: r.status });

    // Thin content check
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
    if (wordCount < 200) {
      findings.push({ url, category: "onpage", severity: wordCount < 80 ? "warning" : "info", code: "THIN_CONTENT", title: `Wenig Inhalt: ${wordCount} Wörter`, current_value: `${wordCount}`, expected_value: "≥ 300", recommendation: "Erweitere den Inhalt mit relevanten Sub-Topics, FAQ, Beispielen." });
    }

    // Modul 6: AI Content Detection
    findings.push(...analyzeAIContent(url, bodyText));

    // PSI for first PSI_LIMIT URLs (klassisch + Modul 8 Deep-Dive)
    if (PSI_KEY && index < PSI_LIMIT) {
      findings.push(...(await pageSpeed(url)));
      findings.push(...(await pageSpeedDeepDive(url)));
    }

    // PSI for first PSI_LIMIT URLs
    if (PSI_KEY && index < PSI_LIMIT) {
      findings.push(...(await pageSpeed(url)));
    }
    scanned++;
  }

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY).map((u, j) => processUrl(u, i + j));
    await Promise.all(batch);
  }

  // ===== Modul 5: Internal Linking Graph =====
  findings.push(...analyzeLinkGraph(pageData, originHost, origin));


  // Module 2: Duplicate Title/Description + Index Bloat detection
  const titleMap = new Map<string, string[]>();
  for (const p of pageData) {
    if (!p.title) continue;
    const arr = titleMap.get(p.title) ?? [];
    arr.push(p.url);
    titleMap.set(p.title, arr);
  }
  for (const [title, urls] of titleMap) {
    if (urls.length > 1) {
      for (const u of urls) {
        findings.push({ url: u, category: "onpage", severity: "warning", code: "DUPLICATE_TITLE", title: "Duplizierter Title-Tag", description: `${urls.length} Seiten mit gleichem Title: "${title.slice(0, 60)}"`, recommendation: "Eindeutige Titles pro Seite verwenden — gleiche Titles verwirren Google." });
      }
    }
  }

  // Index Bloat: zu viele Seiten mit dünnem/ähnlichem Inhalt
  if (pageData.length > 50) {
    const thinPages = pageData.filter((p) => p.bodyText.split(/\s+/).length < 300).length;
    const ratio = thinPages / pageData.length;
    if (ratio > 0.3) {
      findings.push({ url: origin, category: "technical", severity: "warning", code: "INDEX_BLOAT", title: `Index Bloat Risiko: ${Math.round(ratio * 100)}% dünne Seiten`, current_value: `${thinPages}/${pageData.length}`, expected_value: "< 30%", recommendation: "Konsolidiere ähnliche Seiten, setze noindex auf Tags/Filter, reduziere Crawl-Budget-Verschwendung." });
    }
  }

  // Module 2: Near-duplicate content (Jaccard auf Wort-Shingles)
  if (pageData.length >= 2 && pageData.length <= 100) {
    const shingles = pageData.map((p) => {
      const words = p.bodyText.toLowerCase().split(/\s+/).slice(0, 500);
      const set = new Set<string>();
      for (let i = 0; i < words.length - 2; i++) set.add(`${words[i]} ${words[i+1]} ${words[i+2]}`);
      return { url: p.url, set };
    });
    const seen = new Set<string>();
    for (let i = 0; i < shingles.length; i++) {
      for (let j = i + 1; j < shingles.length; j++) {
        const a = shingles[i], b = shingles[j];
        if (a.set.size === 0 || b.set.size === 0) continue;
        let inter = 0;
        for (const s of a.set) if (b.set.has(s)) inter++;
        const union = a.set.size + b.set.size - inter;
        const sim = inter / Math.max(1, union);
        if (sim > 0.7) {
          const key = `${a.url}|${b.url}`;
          if (seen.has(key)) continue;
          seen.add(key);
          findings.push({ url: a.url, category: "onpage", severity: "warning", code: "NEAR_DUPLICATE", title: `Inhalt fast identisch (${Math.round(sim*100)}%) zu anderer Seite`, description: `Ähnlich zu: ${b.url}`, recommendation: "Kanonisiere oder konsolidiere die Duplikate — Google straft Cannibalization ab." });
        }
      }
    }
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
