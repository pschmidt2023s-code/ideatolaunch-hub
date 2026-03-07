import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles, Loader2, Star, Copy, CheckCircle2, ArrowRight, ArrowLeft,
  Globe, FileText, Users, Mail, HelpCircle, Shield, Eye, Code, Download,
  Smartphone, Monitor, ChevronRight, Terminal, Folder, Rocket, ExternalLink,
} from "lucide-react";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LockedOverlay } from "@/components/LockedOverlay";
import { cn } from "@/lib/utils";

// ── Types ──
interface WebsiteData {
  pages: {
    home?: { hero: { headline: string; subheadline: string; cta_text: string; cta_target?: string; trust_badge?: string }; features: { title: string; description: string; icon?: string }[]; social_proof: { headline: string; testimonials: { name: string; text: string; rating: number }[] }; cta_section: { headline: string; subheadline?: string; cta_text: string; urgency_text?: string } };
    about?: { headline: string; story: string; mission: string; values: { title: string; description: string }[]; team_headline?: string };
    products?: { headline: string; subheadline?: string; items: { name: string; description: string; price?: string; badge?: string; cta_text?: string }[] };
    contact?: { headline: string; subheadline?: string; email?: string; phone?: string; address?: string; form_fields: { label: string; type: string; placeholder?: string }[] };
    faq?: { headline: string; items: { question: string; answer: string }[] };
  };
  navigation: { label: string; page: string }[];
  footer: { copyright: string; links: { label: string; page: string }[] };
  meta: { title: string; description: string; primary_color?: string; accent_color?: string };
}

const PAGE_OPTIONS = [
  { id: "home", label: "Startseite", icon: Globe, desc: "Hero, Features, Testimonials, CTA", required: true as const },
  { id: "about", label: "Über uns", icon: Users, desc: "Story, Mission, Werte", required: false as const },
  { id: "products", label: "Produkte", icon: FileText, desc: "Produktkarten mit Preisen", required: false as const },
  { id: "contact", label: "Kontakt", icon: Mail, desc: "Formular & Kontaktdaten", required: false as const },
  { id: "faq", label: "FAQ", icon: HelpCircle, desc: "Häufige Fragen", required: false as const },
];

const COLOR_SCHEMES = [
  { value: "modern-dark", label: "Modern Dark", preview: "bg-[hsl(235,50%,15%)]" },
  { value: "clean-light", label: "Clean Light", preview: "bg-[hsl(0,0%,97%)]" },
  { value: "warm-natural", label: "Warm & Natural", preview: "bg-[hsl(30,30%,92%)]" },
  { value: "bold-accent", label: "Bold Accent", preview: "bg-[hsl(350,80%,50%)]" },
  { value: "luxury-minimal", label: "Luxury Minimal", preview: "bg-[hsl(0,0%,8%)]" },
];

// ── Component ──
export default function WebsiteBuilder() {
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const isPro = plan === "pro" || plan === "execution" || plan === "trading";
  const brandId = activeBrand?.id;

  // Wizard state
  const [step, setStep] = useState(0);
  const [selectedPages, setSelectedPages] = useState<string[]>(["home"]);
  const [colorScheme, setColorScheme] = useState("modern-dark");
  const [loading, setLoading] = useState(false);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [activePage, setActivePage] = useState("home");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

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

  const brandName = identity?.brand_name || activeBrand?.name || "";

  const togglePage = (id: string) => {
    if (id === "home") return;
    setSelectedPages(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-website-builder", {
        body: {
          brandName,
          productDescription: profile?.product_description || "",
          targetAudience: profile?.target_audience || "",
          priceLevel: profile?.price_level || "mid",
          tone: identity?.tone || "Professionell",
          tagline: identity?.tagline || "",
          colorScheme,
          pages: selectedPages,
        },
      });
      if (error) throw error;
      setWebsiteData(data);
      setActivePage("home");
      setStep(2);
      toast.success("Website generiert!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Generierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHTML = useCallback(() => {
    if (!websiteData) return;
    const html = generateFullHTML(websiteData, brandName);
    navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success("HTML kopiert!");
    setTimeout(() => setCopied(false), 2000);
  }, [websiteData, brandName]);

  const content = (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">AI Website Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Erstelle eine komplette, mehrseitige Website für deine Marke.
          </p>
        </div>
        {websiteData && (
          <Badge variant="outline" className="gap-1.5 text-xs">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {Object.keys(websiteData.pages).length} Seiten generiert
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {["Seiten wählen", "Generieren", "Vorschau & Export"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => { if (i <= (websiteData ? 2 : step)) setStep(i); }}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                step === i ? "bg-primary text-primary-foreground" :
                i < step || (i === 2 && websiteData) ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-[10px] font-bold">
                {i < step || (i === 2 && websiteData) ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
          </div>
        ))}
      </div>

      {/* Step 0: Page Selection */}
      {step === 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Welche Seiten soll deine Website haben?</CardTitle>
              <CardDescription>Wähle die Seiten, die generiert werden sollen. Startseite ist immer dabei.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PAGE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const checked = selectedPages.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => togglePage(opt.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                      checked ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30",
                      opt.required && "cursor-default"
                    )}
                  >
                    <Checkbox checked={checked} disabled={opt.required} className="pointer-events-none" />
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{opt.label} {opt.required && <Badge variant="secondary" className="ml-2 text-[10px]">Pflicht</Badge>}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stil & Farbschema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {COLOR_SCHEMES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setColorScheme(s.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 transition-all",
                      colorScheme === s.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn("h-8 w-8 rounded-lg border", s.preview)} />
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Marken-Daten</CardTitle>
              <CardDescription>Diese Daten werden aus deinem Brand-Profil übernommen.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoField label="Marke" value={brandName} />
                <InfoField label="Tagline" value={identity?.tagline} />
                <InfoField label="Produkt" value={profile?.product_description} />
                <InfoField label="Zielgruppe" value={profile?.target_audience} />
                <InfoField label="Tonalität" value={identity?.tone} />
                <InfoField label="Preisniveau" value={profile?.price_level} />
              </div>
              {!brandName && (
                <p className="mt-3 text-xs text-orange-500">
                  ⚠ Bitte lege zuerst ein Brand-Profil in der Founder Journey an.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setStep(1)} disabled={!brandId} className="gap-2">
              Weiter <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Generate */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display">Bereit zur Generierung</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPages.length} {selectedPages.length === 1 ? "Seite" : "Seiten"} werden erstellt: {selectedPages.map(p => PAGE_OPTIONS.find(o => o.id === p)?.label).join(", ")}
                </p>
              </div>

              {loading ? (
                <div className="space-y-3 py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
                  <p className="text-sm text-muted-foreground">KI generiert deine Website...</p>
                  <p className="text-xs text-muted-foreground/60">Das kann bis zu 30 Sekunden dauern.</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Zurück
                  </Button>
                  <Button onClick={handleGenerate} disabled={!brandId} variant="premium" className="gap-2">
                    <Sparkles className="h-4 w-4" /> Website generieren
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Preview & Export */}
      {step === 2 && websiteData && (
        <div className="space-y-6">
          <Tabs defaultValue="preview">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <TabsList>
                <TabsTrigger value="preview" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> Vorschau</TabsTrigger>
                <TabsTrigger value="code" className="gap-1.5"><Code className="h-3.5 w-3.5" /> Code</TabsTrigger>
                <TabsTrigger value="deploy" className="gap-1.5"><Rocket className="h-3.5 w-3.5" /> Veröffentlichen</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep(0)} className="gap-1.5 text-xs">
                  <ArrowLeft className="h-3 w-3" /> Neu generieren
                </Button>
              </div>
            </div>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4 mt-4">
              {/* Page nav + device toggle */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {websiteData.navigation.map(nav => (
                    <Button
                      key={nav.page}
                      variant={activePage === nav.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActivePage(nav.page)}
                      className="text-xs"
                    >
                      {nav.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant={previewMode === "desktop" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setPreviewMode("desktop")}>
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button variant={previewMode === "mobile" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setPreviewMode("mobile")}>
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Preview frame */}
              <div className={cn(
                "mx-auto rounded-2xl border bg-background overflow-hidden shadow-lg transition-all",
                previewMode === "mobile" ? "max-w-[375px]" : "w-full"
              )}>
                <PreviewRenderer data={websiteData} activePage={activePage} onNavigate={setActivePage} brandName={brandName} />
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">HTML Export</CardTitle>
                    <CardDescription>Komplette Website als einzelne HTML-Datei.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyHTML}>
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Kopiert!" : "HTML kopieren"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-80 overflow-auto rounded-xl bg-muted p-4 text-xs font-mono">
                    {generateFullHTML(websiteData, brandName).slice(0, 3000)}...
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deploy Tab */}
            <TabsContent value="deploy" className="space-y-4 mt-4">
              <DeployGuide pageCount={Object.keys(websiteData.pages).length} brandName={brandName} />
            </TabsContent>
          </Tabs>
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

// ── Info Field ──
function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      <p className="text-sm truncate">{value || <span className="text-muted-foreground italic">Nicht angegeben</span>}</p>
    </div>
  );
}

// ── Preview Renderer ──
function PreviewRenderer({ data, activePage, onNavigate, brandName }: {
  data: WebsiteData; activePage: string; onNavigate: (p: string) => void; brandName: string;
}) {
  const page = data.pages[activePage as keyof typeof data.pages];
  if (!page) return <div className="p-8 text-center text-muted-foreground">Seite nicht gefunden</div>;

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="text-sm font-bold">{brandName}</span>
        <nav className="hidden sm:flex items-center gap-4">
          {data.navigation.map(nav => (
            <button
              key={nav.page}
              onClick={() => onNavigate(nav.page)}
              className={cn("text-xs transition-colors", activePage === nav.page ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground")}
            >
              {nav.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Page Content */}
      {activePage === "home" && data.pages.home && <HomePreview page={data.pages.home} />}
      {activePage === "about" && data.pages.about && <AboutPreview page={data.pages.about} />}
      {activePage === "products" && data.pages.products && <ProductsPreview page={data.pages.products} />}
      {activePage === "contact" && data.pages.contact && <ContactPreview page={data.pages.contact} />}
      {activePage === "faq" && data.pages.faq && <FaqPreview page={data.pages.faq} />}

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          {data.footer.links?.map((link, i) => (
            <button key={i} onClick={() => onNavigate(link.page)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{data.footer.copyright}</p>
      </footer>
    </div>
  );
}

function HomePreview({ page }: { page: NonNullable<WebsiteData["pages"]["home"]> }) {
  return (
    <>
      <div className="bg-primary text-primary-foreground px-6 py-16 text-center space-y-4">
        {page.hero.trust_badge && <Badge className="bg-accent/20 text-accent border-accent/30">{page.hero.trust_badge}</Badge>}
        <h2 className="text-2xl sm:text-3xl font-bold font-display max-w-2xl mx-auto">{page.hero.headline}</h2>
        <p className="text-base opacity-80 max-w-lg mx-auto">{page.hero.subheadline}</p>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2 shadow-glow-accent">{page.hero.cta_text}</Button>
      </div>
      <div className="px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {page.features.map((f, i) => (
            <div key={i} className="rounded-xl border p-5 text-center space-y-2">
              <div className="text-2xl">{f.icon || "✨"}</div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-muted/30 px-6 py-12">
        <h3 className="text-lg font-bold text-center mb-6 font-display">{page.social_proof.headline}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {page.social_proof.testimonials.map((t, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-accent text-accent" />)}</div>
              <p className="text-xs">{t.text}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-primary text-primary-foreground px-6 py-12 text-center space-y-3">
        <h3 className="text-xl font-bold font-display">{page.cta_section.headline}</h3>
        {page.cta_section.subheadline && <p className="text-sm opacity-80">{page.cta_section.subheadline}</p>}
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-accent">{page.cta_section.cta_text}</Button>
        {page.cta_section.urgency_text && <p className="text-[11px] opacity-60">{page.cta_section.urgency_text}</p>}
      </div>
    </>
  );
}

function AboutPreview({ page }: { page: NonNullable<WebsiteData["pages"]["about"]> }) {
  return (
    <div className="px-6 py-12 max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold font-display text-center">{page.headline}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{page.story}</p>
      <div className="rounded-xl bg-primary/5 border p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Unsere Mission</p>
        <p className="text-sm font-medium">{page.mission}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {page.values.map((v, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-1">
            <h4 className="text-sm font-semibold">{v.title}</h4>
            <p className="text-xs text-muted-foreground">{v.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsPreview({ page }: { page: NonNullable<WebsiteData["pages"]["products"]> }) {
  return (
    <div className="px-6 py-12 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-display">{page.headline}</h2>
        {page.subheadline && <p className="text-sm text-muted-foreground">{page.subheadline}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {page.items.map((item, i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3 flex flex-col">
            {item.badge && <Badge variant="secondary" className="self-start text-[10px]">{item.badge}</Badge>}
            <h3 className="text-sm font-bold">{item.name}</h3>
            <p className="text-xs text-muted-foreground flex-1">{item.description}</p>
            {item.price && <p className="text-lg font-bold text-primary">{item.price}</p>}
            <Button size="sm" className="w-full">{item.cta_text || "Mehr erfahren"}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPreview({ page }: { page: NonNullable<WebsiteData["pages"]["contact"]> }) {
  return (
    <div className="px-6 py-12 max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-display">{page.headline}</h2>
        {page.subheadline && <p className="text-sm text-muted-foreground">{page.subheadline}</p>}
      </div>
      <div className="rounded-xl border p-6 space-y-4">
        {page.form_fields.map((field, i) => (
          <div key={i} className="space-y-1.5">
            <label className="text-xs font-medium">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder={field.placeholder} rows={4} />
            ) : (
              <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" type={field.type} placeholder={field.placeholder} />
            )}
          </div>
        ))}
        <Button className="w-full">Nachricht senden</Button>
      </div>
      {(page.email || page.phone || page.address) && (
        <div className="grid gap-3 sm:grid-cols-3">
          {page.email && <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">E-Mail</p><p className="text-xs font-medium">{page.email}</p></div>}
          {page.phone && <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">Telefon</p><p className="text-xs font-medium">{page.phone}</p></div>}
          {page.address && <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">Adresse</p><p className="text-xs font-medium">{page.address}</p></div>}
        </div>
      )}
    </div>
  );
}

function FaqPreview({ page }: { page: NonNullable<WebsiteData["pages"]["faq"]> }) {
  return (
    <div className="px-6 py-12 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold font-display text-center">{page.headline}</h2>
      <div className="space-y-3">
        {page.items.map((item, i) => (
          <div key={i} className="rounded-xl border p-4">
            <p className="text-sm font-medium">{item.question}</p>
            <p className="text-xs text-muted-foreground mt-1.5">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Deploy Guide ──
function DeployGuide({ pageCount, brandName }: { pageCount: number; brandName: string }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Rocket className="h-4 w-4 text-accent" /> Veröffentlichung</CardTitle>
          <CardDescription>So bringst du deine generierte Website online.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DeployStep number={1} title="HTML herunterladen" icon={Download}>
            <p className="text-xs text-muted-foreground">Kopiere den HTML-Code über den "Code"-Tab. Speichere ihn als <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">index.html</code> auf deinem Computer.</p>
          </DeployStep>

          <DeployStep number={2} title="Dateien vorbereiten" icon={Folder}>
            <p className="text-xs text-muted-foreground">Erstelle einen Ordner für deine Website:</p>
            <pre className="mt-2 rounded-lg bg-muted p-3 text-[11px] font-mono">{`${brandName.toLowerCase().replace(/\s+/g, "-")}-website/
├── index.html        ← Deine Startseite
├── images/           ← Bilder hier ablegen
└── favicon.ico       ← Dein Favicon`}</pre>
          </DeployStep>

          <DeployStep number={3} title="Lokal testen" icon={Terminal}>
            <p className="text-xs text-muted-foreground">Öffne <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">index.html</code> direkt im Browser oder nutze einen lokalen Server:</p>
            <pre className="mt-2 rounded-lg bg-muted p-3 text-[11px] font-mono">npx serve .</pre>
          </DeployStep>

          <DeployStep number={4} title="Website veröffentlichen" icon={Globe}>
            <p className="text-xs text-muted-foreground">Lade deine Dateien bei einem dieser Hosting-Anbieter hoch:</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {[
                { name: "Netlify", url: "https://app.netlify.com/drop", desc: "Drag & Drop" },
                { name: "Vercel", url: "https://vercel.com/new", desc: "Git oder Upload" },
                { name: "GitHub Pages", url: "https://pages.github.com", desc: "Gratis Hosting" },
              ].map(h => (
                <a key={h.name} href={h.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{h.name}</p>
                    <p className="text-[10px] text-muted-foreground">{h.desc}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          </DeployStep>

          <DeployStep number={5} title="Anpassen" icon={FileText}>
            <p className="text-xs text-muted-foreground">Im HTML-Code kannst du folgendes direkt anpassen:</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>• <strong>Texte:</strong> Suche und ersetze die Inhalte im HTML</li>
              <li>• <strong>Farben:</strong> Ändere die CSS-Variablen im <code className="rounded bg-muted px-1 py-0.5 font-mono">:root</code> Block</li>
              <li>• <strong>Bilder:</strong> Ersetze Platzhalter durch eigene Bilder</li>
              <li>• <strong>Links:</strong> Passe E-Mail, Social Media und externe Links an</li>
              <li>• <strong>Rechtliches:</strong> Füge Impressum & Datenschutz hinzu</li>
            </ul>
          </DeployStep>
        </CardContent>
      </Card>
    </div>
  );
}

function DeployStep({ number, title, icon: Icon, children }: { number: number; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{number}</div>
        <div className="flex-1 w-px bg-border mt-2" />
      </div>
      <div className="flex-1 pb-4 min-w-0">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><Icon className="h-4 w-4 text-muted-foreground" />{title}</h4>
        {children}
      </div>
    </div>
  );
}

// ── Full HTML Generator ──
function generateFullHTML(data: WebsiteData, brandName: string): string {
  const navLinks = data.navigation.map(n => `<a href="#${n.page}" class="nav-link" onclick="showPage('${n.page}')">${n.label}</a>`).join("\n          ");
  const footerLinks = data.footer.links?.map(l => `<a href="#${l.page}" onclick="showPage('${l.page}')">${l.label}</a>`).join(" · ") || "";

  let pagesHTML = "";

  if (data.pages.home) {
    const h = data.pages.home;
    pagesHTML += `
    <div id="page-home" class="page active">
      <section class="hero">
        ${h.hero.trust_badge ? `<span class="trust-badge">${h.hero.trust_badge}</span>` : ""}
        <h1>${h.hero.headline}</h1>
        <p>${h.hero.subheadline}</p>
        <a href="#contact" class="btn" onclick="showPage('contact')">${h.hero.cta_text}</a>
      </section>
      <section class="features">
        <div class="grid">
          ${h.features.map(f => `<div class="card"><div class="icon">${f.icon || "✨"}</div><h3>${f.title}</h3><p>${f.description}</p></div>`).join("\n          ")}
        </div>
      </section>
      <section class="testimonials">
        <h2>${h.social_proof.headline}</h2>
        <div class="grid">
          ${h.social_proof.testimonials.map(t => `<div class="card"><div class="stars">${"★".repeat(t.rating)}</div><p>${t.text}</p><span class="author">${t.name}</span></div>`).join("\n          ")}
        </div>
      </section>
      <section class="cta-section">
        <h2>${h.cta_section.headline}</h2>
        ${h.cta_section.subheadline ? `<p>${h.cta_section.subheadline}</p>` : ""}
        <a href="#contact" class="btn" onclick="showPage('contact')">${h.cta_section.cta_text}</a>
        ${h.cta_section.urgency_text ? `<small>${h.cta_section.urgency_text}</small>` : ""}
      </section>
    </div>`;
  }

  if (data.pages.about) {
    const a = data.pages.about;
    pagesHTML += `
    <div id="page-about" class="page">
      <section class="content-section">
        <h1>${a.headline}</h1>
        <p class="story">${a.story}</p>
        <div class="mission-box"><span class="label">Unsere Mission</span><p>${a.mission}</p></div>
        <div class="grid values-grid">
          ${a.values.map(v => `<div class="card"><h3>${v.title}</h3><p>${v.description}</p></div>`).join("\n          ")}
        </div>
      </section>
    </div>`;
  }

  if (data.pages.products) {
    const p = data.pages.products;
    pagesHTML += `
    <div id="page-products" class="page">
      <section class="content-section">
        <h1>${p.headline}</h1>
        ${p.subheadline ? `<p class="subtitle">${p.subheadline}</p>` : ""}
        <div class="grid products-grid">
          ${p.items.map(item => `<div class="card product-card">${item.badge ? `<span class="badge">${item.badge}</span>` : ""}<h3>${item.name}</h3><p>${item.description}</p>${item.price ? `<div class="price">${item.price}</div>` : ""}<a href="#contact" class="btn-sm" onclick="showPage('contact')">${item.cta_text || "Mehr erfahren"}</a></div>`).join("\n          ")}
        </div>
      </section>
    </div>`;
  }

  if (data.pages.contact) {
    const c = data.pages.contact;
    pagesHTML += `
    <div id="page-contact" class="page">
      <section class="content-section">
        <h1>${c.headline}</h1>
        ${c.subheadline ? `<p class="subtitle">${c.subheadline}</p>` : ""}
        <form class="contact-form" onsubmit="event.preventDefault(); alert('Nachricht gesendet!')">
          ${c.form_fields.map(f => f.type === "textarea" ? `<label>${f.label}<textarea placeholder="${f.placeholder || ""}" required></textarea></label>` : `<label>${f.label}<input type="${f.type}" placeholder="${f.placeholder || ""}" required /></label>`).join("\n          ")}
          <button type="submit" class="btn">Nachricht senden</button>
        </form>
        <div class="contact-info">
          ${c.email ? `<div><strong>E-Mail</strong><br/>${c.email}</div>` : ""}
          ${c.phone ? `<div><strong>Telefon</strong><br/>${c.phone}</div>` : ""}
          ${c.address ? `<div><strong>Adresse</strong><br/>${c.address}</div>` : ""}
        </div>
      </section>
    </div>`;
  }

  if (data.pages.faq) {
    const f = data.pages.faq;
    pagesHTML += `
    <div id="page-faq" class="page">
      <section class="content-section">
        <h1>${f.headline}</h1>
        <div class="faq-list">
          ${f.items.map(item => `<details class="faq-item"><summary>${item.question}</summary><p>${item.answer}</p></details>`).join("\n          ")}
        </div>
      </section>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.meta.title}</title>
  <meta name="description" content="${data.meta.description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #1a1a2e; --accent: #e68a00; --bg: #fff; --text: #1a1a2e; --muted: #666; --border: #e5e5e5; --card-bg: #fff; --section-alt: #f8f8f8; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; color: var(--text); line-height: 1.6; background: var(--bg); }

    /* Nav */
    .site-nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 100; }
    .site-nav .brand { font-weight: 700; font-size: 1.125rem; }
    .site-nav nav { display: flex; gap: 1.5rem; }
    .nav-link { text-decoration: none; color: var(--muted); font-size: 0.875rem; font-weight: 500; transition: color 0.2s; }
    .nav-link:hover, .nav-link.active { color: var(--text); }
    .mobile-toggle { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; }

    /* Pages */
    .page { display: none; } .page.active { display: block; }

    /* Hero */
    .hero { background: var(--primary); color: #fff; padding: 5rem 2rem; text-align: center; }
    .hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; max-width: 640px; margin: 0 auto 1rem; }
    .hero p { font-size: 1.125rem; opacity: 0.8; max-width: 480px; margin: 0 auto 2rem; }
    .trust-badge { display: inline-block; background: rgba(230,138,0,0.2); color: var(--accent); border: 1px solid rgba(230,138,0,0.3); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem; }

    /* Buttons */
    .btn { display: inline-block; background: var(--accent); color: #fff; padding: 0.75rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; border: none; cursor: pointer; font-size: 1rem; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .btn-sm { display: inline-block; background: var(--primary); color: #fff; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.875rem; font-weight: 500; }

    /* Grid */
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; max-width: 960px; margin: 0 auto; }
    .card { border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; background: var(--card-bg); }
    .card h3 { font-size: 1rem; font-weight: 600; margin: 0.5rem 0; }
    .card p { font-size: 0.875rem; color: var(--muted); }
    .card .icon { font-size: 2rem; }

    /* Features */
    .features { padding: 4rem 2rem; text-align: center; }
    .features .card { text-align: center; }

    /* Testimonials */
    .testimonials { background: var(--section-alt); padding: 4rem 2rem; text-align: center; }
    .testimonials h2 { font-size: 1.5rem; margin-bottom: 2rem; }
    .stars { color: var(--accent); margin-bottom: 0.5rem; }
    .author { display: block; font-size: 0.75rem; color: var(--muted); margin-top: 0.75rem; font-weight: 600; }

    /* CTA */
    .cta-section { background: var(--primary); color: #fff; padding: 4rem 2rem; text-align: center; }
    .cta-section h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    .cta-section p { opacity: 0.8; margin-bottom: 1.5rem; }
    .cta-section small { display: block; margin-top: 1rem; opacity: 0.5; font-size: 0.75rem; }

    /* Content sections */
    .content-section { padding: 4rem 2rem; max-width: 800px; margin: 0 auto; }
    .content-section h1 { font-size: 2rem; font-weight: 800; margin-bottom: 1rem; text-align: center; }
    .subtitle { text-align: center; color: var(--muted); margin-bottom: 2rem; }
    .story { color: var(--muted); margin-bottom: 2rem; line-height: 1.8; }
    .mission-box { background: var(--section-alt); border: 1px solid var(--border); border-radius: 1rem; padding: 2rem; text-align: center; margin-bottom: 2rem; }
    .mission-box .label { text-transform: uppercase; font-size: 0.625rem; letter-spacing: 0.1em; color: var(--muted); display: block; margin-bottom: 0.5rem; }

    /* Products */
    .product-card { display: flex; flex-direction: column; }
    .product-card .price { font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0.75rem 0; }
    .badge { display: inline-block; background: var(--section-alt); padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.625rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }

    /* Contact */
    .contact-form { max-width: 560px; margin: 0 auto 2rem; }
    .contact-form label { display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 1rem; }
    .contact-form input, .contact-form textarea { width: 100%; border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.625rem 0.75rem; font-size: 0.875rem; margin-top: 0.375rem; font-family: inherit; }
    .contact-form textarea { resize: vertical; min-height: 120px; }
    .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; text-align: center; font-size: 0.875rem; }
    .contact-info strong { font-size: 0.625rem; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em; }

    /* FAQ */
    .faq-list { max-width: 640px; margin: 0 auto; }
    .faq-item { border: 1px solid var(--border); border-radius: 0.75rem; margin-bottom: 0.75rem; overflow: hidden; }
    .faq-item summary { padding: 1rem 1.25rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; list-style: none; }
    .faq-item summary::-webkit-details-marker { display: none; }
    .faq-item p { padding: 0 1.25rem 1rem; font-size: 0.875rem; color: var(--muted); }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 2rem; text-align: center; }
    .site-footer a { color: var(--muted); text-decoration: none; font-size: 0.75rem; }
    .site-footer .copy { font-size: 0.75rem; color: var(--muted); margin-top: 0.75rem; }

    /* Responsive */
    @media (max-width: 768px) {
      .site-nav nav { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); border-bottom: 1px solid var(--border); padding: 1rem 2rem; gap: 0.75rem; }
      .site-nav nav.open { display: flex; }
      .mobile-toggle { display: block; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="site-nav">
    <span class="brand">${brandName}</span>
    <button class="mobile-toggle" onclick="document.querySelector('.site-nav nav').classList.toggle('open')">☰</button>
    <nav>
      ${navLinks}
    </nav>
  </header>

  ${pagesHTML}

  <footer class="site-footer">
    ${footerLinks ? `<div>${footerLinks}</div>` : ""}
    <p class="copy">${data.footer.copyright}</p>
  </footer>

  <script>
    function showPage(id) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const el = document.getElementById('page-' + id);
      if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
      document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
      document.querySelectorAll('.nav-link').forEach(a => { if (a.getAttribute('onclick')?.includes(id)) a.classList.add('active'); });
      document.querySelector('.site-nav nav')?.classList.remove('open');
    }
    // Handle hash on load
    if (location.hash) showPage(location.hash.replace('#',''));
  </script>
</body>
</html>`;
}
