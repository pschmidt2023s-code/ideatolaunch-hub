import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles, Loader2, Copy, CheckCircle2, ArrowRight, ArrowLeft,
  Globe, FileText, Users, Mail, HelpCircle, Eye, Code, Download,
  Smartphone, Monitor, ChevronRight, Rocket, ExternalLink, Plus,
  Trash2, Save, FolderOpen, Wand2, MousePointerClick, PenLine,
  LayoutGrid, Terminal, Folder,
} from "lucide-react";
import { BackButton } from "@/components/dashboard/BackButton";
import { useBrand } from "@/hooks/useBrand";
import { useSubscription } from "@/hooks/useSubscription";
import { useWebsiteProjects } from "@/hooks/useWebsiteProjects";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LockedOverlay } from "@/components/LockedOverlay";
import { cn } from "@/lib/utils";
import type { WebsiteData } from "@/components/website-builder/types";
import { PAGE_OPTIONS, COLOR_SCHEMES } from "@/components/website-builder/types";
import { PreviewRenderer } from "@/components/website-builder/PreviewRenderer";
import { WishPanel } from "@/components/website-builder/WishPanel";
import { InlineEditor, setNestedValue } from "@/components/website-builder/InlineEditor";
import { generateFullHTML } from "@/components/website-builder/htmlExport";

const PAGE_ICONS: Record<string, React.ElementType> = { home: Globe, about: Users, products: FileText, contact: Mail, faq: HelpCircle };

export default function WebsiteBuilder() {
  const { activeBrand } = useBrand();
  const { plan } = useSubscription();
  const isPro = plan === "pro" || plan === "execution" || plan === "trading";
  const brandId = activeBrand?.id;
  const { projects, isLoading: projectsLoading, saveProject, deleteProject } = useWebsiteProjects();

  // View state
  const [view, setView] = useState<"manager" | "wizard" | "editor">("manager");
  const [step, setStep] = useState(0);
  const [selectedPages, setSelectedPages] = useState<string[]>(["home"]);
  const [colorScheme, setColorScheme] = useState("modern-dark");
  const [loading, setLoading] = useState(false);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [activePage, setActivePage] = useState("home");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Meine Website");
  const [editorTab, setEditorTab] = useState<"preview" | "wish" | "code" | "deploy">("preview");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

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
          brandName, productDescription: profile?.product_description || "",
          targetAudience: profile?.target_audience || "", priceLevel: profile?.price_level || "mid",
          tone: identity?.tone || "Professionell", tagline: identity?.tagline || "",
          colorScheme, pages: selectedPages,
        },
      });
      if (error) throw error;
      setWebsiteData(data);
      setActivePage("home");
      setView("editor");
      toast.success("Website generiert!");
    } catch (err: any) {
      toast.error(err.message || "Generierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!websiteData) return;
    try {
      const result = await saveProject.mutateAsync({
        id: activeProjectId || undefined,
        name: projectName,
        website_data: websiteData,
        color_scheme: colorScheme,
        selected_pages: selectedPages,
        status: "draft",
      });
      setActiveProjectId(result.id);
      toast.success("Projekt gespeichert!");
    } catch (err: any) {
      toast.error("Speichern fehlgeschlagen");
    }
  };

  const handleOpenProject = (project: any) => {
    setWebsiteData(project.website_data);
    setActiveProjectId(project.id);
    setProjectName(project.name);
    setColorScheme(project.color_scheme || "modern-dark");
    setSelectedPages(project.selected_pages || ["home"]);
    setActivePage("home");
    setView("editor");
  };

  const handleCopyHTML = useCallback(() => {
    if (!websiteData) return;
    navigator.clipboard.writeText(generateFullHTML(websiteData, brandName));
    setCopied(true);
    toast.success("HTML kopiert!");
    setTimeout(() => setCopied(false), 2000);
  }, [websiteData, brandName]);

  const handleFieldClick = (path: string, value: string) => {
    setEditingField(path);
    setEditingValue(value);
  };

  const handleFieldSave = (path: string, value: string) => {
    if (!websiteData) return;
    const updated = setNestedValue(websiteData, path, value);
    setWebsiteData(updated);
    setEditingField(null);
    toast.success("Text aktualisiert");
  };

  const handleWishUpdate = (data: WebsiteData) => {
    setWebsiteData(data);
  };

  const handleDownloadHTML = () => {
    if (!websiteData) return;
    const html = generateFullHTML(websiteData, brandName);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandName.toLowerCase().replace(/\s+/g, "-") || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("HTML heruntergeladen!");
  };

  const content = (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Globe className="h-6 w-6 text-accent" />
            Website Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">
            Erstelle, bearbeite und verwalte deine Marken-Websites.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view !== "manager" && (
            <Button variant="outline" size="sm" onClick={() => setView("manager")} className="gap-1.5 text-xs font-mono">
              <FolderOpen className="h-3 w-3" /> Projekte
            </Button>
          )}
          {view === "manager" && (
            <Button size="sm" onClick={() => { setWebsiteData(null); setActiveProjectId(null); setProjectName("Meine Website"); setStep(0); setView("wizard"); }} className="gap-1.5 text-xs font-mono">
              <Plus className="h-3 w-3" /> Neue Website
            </Button>
          )}
        </div>
      </div>

      {/* ═══ PROJECT MANAGER ═══ */}
      {view === "manager" && (
        <div className="space-y-4">
          {projectsLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <Globe className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-lg font-bold font-display">Noch keine Websites</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Erstelle deine erste KI-generierte Website. Du kannst sie danach bearbeiten, Wünsche eingeben und exportieren.
                </p>
                <Button onClick={() => { setStep(0); setView("wizard"); }} className="gap-2">
                  <Sparkles className="h-4 w-4" /> Erste Website erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => (
                <Card key={project.id} className="group hover:border-accent/30 transition-colors cursor-pointer" onClick={() => handleOpenProject(project)}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold font-display truncate">{project.name}</h3>
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                        {project.status === "published" ? "LIVE" : "DRAFT"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(project.selected_pages || []).map(p => (
                        <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>{new Date(project.updated_at).toLocaleDateString("de")}</span>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteProject.mutate(project.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* New project card */}
              <Card className="border-dashed hover:border-accent/30 transition-colors cursor-pointer" onClick={() => { setWebsiteData(null); setActiveProjectId(null); setStep(0); setView("wizard"); }}>
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[120px] gap-2 text-muted-foreground">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs font-mono">Neue Website</span>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ═══ WIZARD ═══ */}
      {view === "wizard" && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            {["Seiten wählen", "Generieren"].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <button onClick={() => { if (i <= step) setStep(i); }}
                  className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors font-mono",
                    step === i ? "bg-primary text-primary-foreground" : i < step ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
                  )}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-[10px] font-bold">{i < step ? "✓" : i + 1}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {i < 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-6">
              {/* Project name */}
              <Card>
                <CardHeader><CardTitle className="text-base font-mono">Projektname</CardTitle></CardHeader>
                <CardContent>
                  <Input value={projectName} onChange={e => setProjectName(e.target.value)} className="max-w-sm" placeholder="z.B. Mein Online-Shop" />
                </CardContent>
              </Card>

              {/* Page selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-mono">Welche Seiten?</CardTitle>
                  <CardDescription>Startseite ist Pflicht. Weitere Seiten optional.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {PAGE_OPTIONS.map(opt => {
                    const Icon = PAGE_ICONS[opt.id] || Globe;
                    const checked = selectedPages.includes(opt.id);
                    return (
                      <button key={opt.id} onClick={() => togglePage(opt.id)}
                        className={cn("flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                          checked ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30",
                          opt.required && "cursor-default"
                        )}>
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

              {/* Color scheme */}
              <Card>
                <CardHeader><CardTitle className="text-base font-mono">Stil & Farbschema</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {COLOR_SCHEMES.map(s => (
                      <button key={s.value} onClick={() => setColorScheme(s.value)}
                        className={cn("flex items-center gap-3 rounded-xl border p-3 transition-all",
                          colorScheme === s.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                        )}>
                        <div className={cn("h-8 w-8 rounded-lg border", s.preview)} />
                        <span className="text-sm font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Brand data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-mono">Marken-Daten</CardTitle>
                  <CardDescription>Aus deinem Brand-Profil.</CardDescription>
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
                    <p className="mt-3 text-xs text-orange-500">⚠ Bitte lege zuerst ein Brand-Profil in der Founder Journey an.</p>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setStep(1)} disabled={!brandId} className="gap-2 font-mono">
                  Weiter <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display">Bereit zur Generierung</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPages.length} {selectedPages.length === 1 ? "Seite" : "Seiten"}: {selectedPages.map(p => PAGE_OPTIONS.find(o => o.id === p)?.label).join(", ")}
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
                    <Button variant="outline" onClick={() => setStep(0)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Zurück</Button>
                    <Button onClick={handleGenerate} disabled={!brandId} variant="premium" className="gap-2">
                      <Sparkles className="h-4 w-4" /> Website generieren
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══ EDITOR ═══ */}
      {view === "editor" && websiteData && (
        <div className="space-y-4">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="max-w-[200px] text-sm font-mono h-8"
              />
              <Badge variant="outline" className="text-[10px] font-mono gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {Object.keys(websiteData.pages).length} Seiten
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveProject} disabled={saveProject.isPending} className="gap-1.5 text-xs font-mono">
                {saveProject.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Speichern
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadHTML} className="gap-1.5 text-xs font-mono">
                <Download className="h-3 w-3" /> Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setWebsiteData(null); setStep(0); setView("wizard"); }} className="gap-1.5 text-xs font-mono">
                <Sparkles className="h-3 w-3" /> Neu
              </Button>
            </div>
          </div>

          {/* Editor tabs */}
          <div className="flex items-center gap-1 border-b border-border pb-2">
            {([
              { id: "preview", label: "Vorschau", icon: Eye },
              { id: "wish", label: "KI Wünsche", icon: Wand2 },
              { id: "code", label: "Code", icon: Code },
              { id: "deploy", label: "Deploy", icon: Rocket },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setEditorTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors",
                  editorTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preview Tab */}
          {editorTab === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {websiteData.navigation.map(nav => (
                    <Button key={nav.page} variant={activePage === nav.page ? "default" : "outline"} size="sm" onClick={() => setActivePage(nav.page)} className="text-xs font-mono">
                      {nav.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] font-mono gap-1">
                    <MousePointerClick className="h-3 w-3" /> Klicke auf Text zum Bearbeiten
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant={previewMode === "desktop" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setPreviewMode("desktop")}><Monitor className="h-4 w-4" /></Button>
                    <Button variant={previewMode === "mobile" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setPreviewMode("mobile")}><Smartphone className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>

              {/* Inline editor panel */}
              {editingField && (
                <InlineEditor
                  fieldPath={editingField}
                  currentValue={editingValue}
                  onSave={handleFieldSave}
                  onClose={() => setEditingField(null)}
                />
              )}

              {/* Preview */}
              <div className={cn("mx-auto rounded-xl border border-border bg-card overflow-hidden shadow-lg transition-all", previewMode === "mobile" ? "max-w-[375px]" : "w-full")}>
                <PreviewRenderer
                  data={websiteData}
                  activePage={activePage}
                  onNavigate={setActivePage}
                  brandName={brandName}
                  editingField={editingField}
                  onFieldClick={handleFieldClick}
                />
              </div>
            </div>
          )}

          {/* Wish Tab */}
          {editorTab === "wish" && (
            <WishPanel
              websiteData={websiteData}
              brandName={brandName}
              activePage={activePage}
              onUpdate={handleWishUpdate}
              projectId={activeProjectId || undefined}
            />
          )}

          {/* Code Tab */}
          {editorTab === "code" && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-mono">HTML EXPORT</CardTitle>
                  <CardDescription>Komplette Website als einzelne HTML-Datei.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2 font-mono" onClick={handleDownloadHTML}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 font-mono" onClick={handleCopyHTML}>
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Kopiert!" : "Kopieren"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto rounded-xl bg-muted p-4 text-xs font-mono">
                  {generateFullHTML(websiteData, brandName).slice(0, 5000)}...
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Deploy Tab */}
          {editorTab === "deploy" && (
            <DeployGuide brandName={brandName} />
          )}
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

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-[11px] text-muted-foreground font-medium font-mono">{label}</p>
      <p className="text-sm truncate">{value || <span className="text-muted-foreground italic">Nicht angegeben</span>}</p>
    </div>
  );
}

function DeployGuide({ brandName }: { brandName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 font-mono"><Rocket className="h-4 w-4 text-accent" /> VERÖFFENTLICHUNG</CardTitle>
        <CardDescription>So bringst du deine Website online.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {[
          { n: 1, title: "HTML herunterladen", icon: Download, content: <p className="text-xs text-muted-foreground">Nutze den "Export"-Button oben oder den Code-Tab.</p> },
          { n: 2, title: "Dateien vorbereiten", icon: Folder, content: <pre className="mt-2 rounded-lg bg-muted p-3 text-[11px] font-mono">{`${brandName.toLowerCase().replace(/\s+/g, "-") || "website"}/\n├── index.html\n├── images/\n└── favicon.ico`}</pre> },
          { n: 3, title: "Lokal testen", icon: Terminal, content: <pre className="mt-2 rounded-lg bg-muted p-3 text-[11px] font-mono">npx serve .</pre> },
          { n: 4, title: "Veröffentlichen", icon: Globe, content: (
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {[
                { name: "Netlify", url: "https://app.netlify.com/drop", desc: "Drag & Drop" },
                { name: "Vercel", url: "https://vercel.com/new", desc: "Git oder Upload" },
                { name: "GitHub Pages", url: "https://pages.github.com", desc: "Gratis Hosting" },
              ].map(h => (
                <a key={h.name} href={h.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{h.name}</p>
                    <p className="text-[10px] text-muted-foreground">{h.desc}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          )},
        ].map(s => (
          <div key={s.n} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{s.n}</div>
              <div className="flex-1 w-px bg-border mt-2" />
            </div>
            <div className="flex-1 pb-4 min-w-0">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 font-mono"><s.icon className="h-4 w-4 text-muted-foreground" />{s.title}</h4>
              {s.content}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
