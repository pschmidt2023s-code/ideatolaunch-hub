import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Star, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LockedOverlay } from "@/components/LockedOverlay";
import { cn } from "@/lib/utils";

interface LandingPageData {
  hero: { headline: string; subheadline: string; cta_text: string; trust_badge?: string };
  features: { title: string; description: string; icon?: string }[];
  social_proof: { headline: string; testimonials: { name: string; text: string; rating: number }[] };
  faq?: { question: string; answer: string }[];
  cta_section: { headline: string; subheadline?: string; cta_text: string; urgency_text?: string };
  meta: { title: string; description: string; primary_color?: string; style?: string };
}

const COLOR_SCHEMES = [
  { value: "modern-dark", label: "Modern Dark" },
  { value: "clean-light", label: "Clean Light" },
  { value: "warm-natural", label: "Warm & Natural" },
  { value: "bold-accent", label: "Bold Accent" },
  { value: "luxury-minimal", label: "Luxury Minimal" },
];

export default function WebsiteBuilder() {
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const isPro = plan === "pro" || plan === "execution";
  const brandId = activeBrand?.id;

  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [copied, setCopied] = useState(false);
  const [colorScheme, setColorScheme] = useState("modern-dark");

  const { data: profile } = useQuery({
    queryKey: ["brand_profile", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_profiles").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const { data: identity } = useQuery({
    queryKey: ["brand_identity", brandId],
    queryFn: async () => {
      const { data } = await supabase.from("brand_identities").select("*").eq("brand_id", brandId!).maybeSingle();
      return data;
    },
    enabled: !!brandId,
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-website-builder", {
        body: {
          brandName: identity?.brand_name || activeBrand?.name || "",
          productDescription: profile?.product_description || "",
          targetAudience: profile?.target_audience || "",
          priceLevel: profile?.price_level || "mid",
          tone: identity?.tone || "Professionell",
          tagline: identity?.tagline || "",
          colorScheme,
        },
      });
      if (error) throw error;
      setPageData(data);
      toast.success("Landing Page generiert!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Generierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHTML = () => {
    if (!pageData) return;
    const html = generateHTML(pageData, identity?.brand_name || activeBrand?.name || "Brand");
    navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success("HTML kopiert!");
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">AI Website Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generiere eine conversion-optimierte Landing Page für deine Marke.
        </p>
      </div>

      {/* Config */}
      <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Marke</Label>
            <Input value={identity?.brand_name || activeBrand?.name || ""} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Farbschema</Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLOR_SCHEMES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-accent"
          onClick={handleGenerate}
          disabled={loading || !brandId}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generiere..." : "Landing Page generieren"}
        </Button>
      </div>

      {/* Preview */}
      {pageData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-display">Preview</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyHTML}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Kopiert!" : "HTML kopieren"}
            </Button>
          </div>

          {/* Live Preview */}
          <div className="rounded-2xl border bg-background overflow-hidden shadow-lg">
            {/* Hero */}
            <div className="bg-primary text-primary-foreground px-8 py-16 text-center space-y-4">
              {pageData.hero.trust_badge && (
                <Badge className="bg-accent/20 text-accent border-accent/30">{pageData.hero.trust_badge}</Badge>
              )}
              <h2 className="text-3xl font-bold font-display md:text-4xl max-w-2xl mx-auto">{pageData.hero.headline}</h2>
              <p className="text-lg opacity-80 max-w-lg mx-auto">{pageData.hero.subheadline}</p>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 mt-4 shadow-glow-accent">
                {pageData.hero.cta_text}
              </Button>
            </div>

            {/* Features */}
            <div className="px-8 py-12">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                {pageData.features.map((f, i) => (
                  <div key={i} className="rounded-xl border p-5 text-center space-y-2">
                    <div className="text-2xl">{f.icon || "✨"}</div>
                    <h3 className="font-semibold font-display">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-muted/30 px-8 py-12">
              <h3 className="text-xl font-bold text-center mb-8 font-display">{pageData.social_proof.headline}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                {pageData.social_proof.testimonials.map((t, i) => (
                  <div key={i} className="rounded-xl border bg-card p-5 space-y-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm">{t.text}</p>
                    <p className="text-xs text-muted-foreground font-medium">{t.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            {pageData.faq && pageData.faq.length > 0 && (
              <div className="px-8 py-12 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-center mb-6 font-display">Häufige Fragen</h3>
                <div className="space-y-3">
                  {pageData.faq.map((f, i) => (
                    <div key={i} className="rounded-xl border p-4">
                      <p className="font-medium text-sm">{f.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-primary text-primary-foreground px-8 py-12 text-center space-y-3">
              <h3 className="text-2xl font-bold font-display">{pageData.cta_section.headline}</h3>
              {pageData.cta_section.subheadline && (
                <p className="text-base opacity-80">{pageData.cta_section.subheadline}</p>
              )}
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-accent mt-2">
                {pageData.cta_section.cta_text}
              </Button>
              {pageData.cta_section.urgency_text && (
                <p className="text-xs opacity-60 mt-2">{pageData.cta_section.urgency_text}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {isPro ? content : (
        <LockedOverlay feature="brandNameIntelligence" requiredPlan="pro">
          {content}
        </LockedOverlay>
      )}
    </DashboardLayout>
  );
}

// ── HTML Export ──────────────────────────────────────────────────

function generateHTML(data: LandingPageData, brandName: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.meta.title}</title>
  <meta name="description" content="${data.meta.description}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; color: #1a1a2e; line-height: 1.6; }
    .hero { background: #1a1a2e; color: #fff; padding: 5rem 2rem; text-align: center; }
    .hero h1 { font-size: 2.5rem; font-weight: 800; max-width: 640px; margin: 0 auto 1rem; }
    .hero p { font-size: 1.125rem; opacity: 0.8; max-width: 480px; margin: 0 auto 2rem; }
    .btn { display: inline-block; background: #e68a00; color: #fff; padding: 0.75rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; }
    .features { padding: 4rem 2rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 900px; margin: 0 auto; }
    .feature-card { border: 1px solid #e5e5e5; border-radius: 1rem; padding: 1.5rem; text-align: center; }
    .feature-card h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0; }
    .feature-card p { font-size: 0.875rem; color: #666; }
    .testimonials { background: #f8f8f8; padding: 4rem 2rem; }
    .testimonials h2 { text-align: center; font-size: 1.5rem; margin-bottom: 2rem; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; max-width: 900px; margin: 0 auto; }
    .testimonial { background: #fff; border: 1px solid #e5e5e5; border-radius: 1rem; padding: 1.5rem; }
    .testimonial .stars { color: #e68a00; margin-bottom: 0.5rem; }
    .testimonial p { font-size: 0.875rem; }
    .testimonial .author { font-size: 0.75rem; color: #888; margin-top: 0.5rem; font-weight: 600; }
    .cta { background: #1a1a2e; color: #fff; padding: 4rem 2rem; text-align: center; }
    .cta h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <section class="hero">
    <h1>${data.hero.headline}</h1>
    <p>${data.hero.subheadline}</p>
    <a href="#" class="btn">${data.hero.cta_text}</a>
  </section>
  <section class="features">
    <div class="features-grid">
      ${data.features.map(f => `<div class="feature-card"><div style="font-size:2rem">${f.icon || "✨"}</div><h3>${f.title}</h3><p>${f.description}</p></div>`).join("\n      ")}
    </div>
  </section>
  <section class="testimonials">
    <h2>${data.social_proof.headline}</h2>
    <div class="testimonials-grid">
      ${data.social_proof.testimonials.map(t => `<div class="testimonial"><div class="stars">${"★".repeat(t.rating)}</div><p>${t.text}</p><p class="author">${t.name}</p></div>`).join("\n      ")}
    </div>
  </section>
  <section class="cta">
    <h2>${data.cta_section.headline}</h2>
    ${data.cta_section.subheadline ? `<p style="opacity:0.8;margin-bottom:1.5rem">${data.cta_section.subheadline}</p>` : ""}
    <a href="#" class="btn">${data.cta_section.cta_text}</a>
  </section>
</body>
</html>`;
}
