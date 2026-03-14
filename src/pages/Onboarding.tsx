import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, GraduationCap, Loader2, ArrowRight, ArrowLeft, Package, DollarSign, Target, ShieldAlert, Zap, Heart, AlertTriangle, Monitor, Briefcase, Box, CheckCircle2, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES } from "@/lib/categories";
import { RISK_FLAGS, getDefaultRiskFlags, type ProductType } from "@/lib/product-intelligence";
import { cn } from "@/lib/utils";

type Step = "welcome" | "experience" | "product_type" | "product_category" | "risk_flags" | "product" | "budget" | "archetype" | "done";

const STEPS: Step[] = ["welcome", "experience", "product_type", "product_category", "risk_flags", "product", "budget", "archetype", "done"];

const STEP_LABELS_DE = ["Willkommen", "Erfahrung", "Produkttyp", "Kategorie", "Risiken", "Ziel", "Budget", "Archetyp"];
const STEP_ICONS = [Sparkles, Target, Box, Package, AlertTriangle, Target, DollarSign, ShieldAlert];

function determineArchetype(goal: string, riskTolerance: string, budget: string): string {
  if (goal === "survival" || (budget === "under1k" && riskTolerance === "low")) return "recovery_founder";
  if (goal === "scale" || riskTolerance === "high") return "aggressive_scaler";
  if ((goal === "launch" || goal === "profitability") && riskTolerance !== "high" && (budget === "5k-15k" || budget === "15k-50k" || budget === "50k+")) return "brand_perfectionist";
  return "conservative_planner";
}

const ARCHETYPE_DATA: Record<string, { emoji: string; label: string; desc: string; color: string }> = {
  conservative_planner: { emoji: "🛡️", label: "Conservative Planner", desc: "Sicherheit zuerst. Schritt für Schritt zum Erfolg.", color: "text-sky-500" },
  aggressive_scaler: { emoji: "🚀", label: "Aggressive Scaler", desc: "Schnelles Wachstum mit kalkuliertem Risiko.", color: "text-emerald-500" },
  brand_perfectionist: { emoji: "💎", label: "Brand Perfectionist", desc: "Premium-Qualität und starke Marke.", color: "text-violet-500" },
  recovery_founder: { emoji: "🔄", label: "Recovery Founder", desc: "Cashflow stabilisieren und Risiken minimieren.", color: "text-amber-500" },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("welcome");
  const [experience, setExperience] = useState("");
  const [productTypeChoice, setProductTypeChoice] = useState<ProductType | "">("");
  const [productCategory, setProductCategory] = useState("");
  const [riskFlagSelections, setRiskFlagSelections] = useState<string[]>([]);
  const [productType, setProductType] = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("");
  const [riskTolerance, setRiskTolerance] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-starter", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("completed_starter_mode")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && profile?.completed_starter_mode) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, profile, navigate]);

  useEffect(() => {
    if (productCategory) {
      setRiskFlagSelections(getDefaultRiskFlags(productCategory));
    }
  }, [productCategory]);

  const markCompleted = async (path: string) => {
    if (!user) return;
    const archetype = determineArchetype(goal, riskTolerance, budget);
    await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, completed_starter_mode: true, archetype, risk_tolerance: riskTolerance } as any,
        { onConflict: "user_id" }
      );
    trackEvent("onboarding_finished", { path, experience, productType: productCategory, budget, goal, riskTolerance, archetype, productTypeChoice, riskFlags: riskFlagSelections });
  };

  const currentIdx = STEPS.indexOf(step);
  const progress = Math.round(((currentIdx) / (STEPS.length - 1)) * 100);

  // Compute visible steps (skip category/risk_flags for non-physical)
  const visibleSteps = STEPS.filter((s) => {
    if ((s === "product_category" || s === "risk_flags") && productTypeChoice !== "physical" && productTypeChoice !== "") return false;
    if (s === "done") return false;
    return true;
  });
  const visibleIdx = visibleSteps.indexOf(step);

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (step === "product_type" && productTypeChoice !== "physical") {
      setStep("product");
      return;
    }
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };
  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (step === "product" && productTypeChoice !== "physical") {
      setStep("product_type");
      return;
    }
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  if (isLoading || profile?.completed_starter_mode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const physicalCategories = CATEGORIES.filter(c => c.id !== "other");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        {/* Step indicator dots */}
        {step !== "welcome" && step !== "done" && (
          <div className="mb-8 space-y-4">
            {/* Dot stepper */}
            <div className="flex items-center justify-center gap-2">
              {visibleSteps.map((s, i) => {
                const done = i < visibleIdx;
                const active = s === step;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full transition-all duration-300",
                        done && "bg-success",
                        active && "bg-primary w-6",
                        !done && !active && "bg-muted"
                      )}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{STEP_LABELS_DE[currentIdx] || `Schritt ${currentIdx}`}</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums font-medium">{progress}%</span>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-[10px]">~{Math.max(1, Math.ceil((visibleSteps.length - visibleIdx) * 0.3))} min übrig</span>
              </div>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Step: Welcome */}
        {step === "welcome" && (
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">B</span>
            </div>
            <h1 className="text-2xl font-bold">{t("onboarding.title")}</h1>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">{t("onboarding.subtitle")}</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                onClick={async () => {
                  setExperience("experienced");
                  await markCompleted("experienced");
                  navigate("/dashboard");
                }}
                className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-semibold">{t("onboarding.experienced")}</h2>
                <p className="text-sm text-muted-foreground">{t("onboarding.experiencedDesc")}</p>
              </button>

              <button
                onClick={() => {
                  setExperience("beginner");
                  setStep("experience");
                }}
                className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-semibold">{t("onboarding.beginner")}</h2>
                <p className="text-sm text-muted-foreground">{t("onboarding.beginnerDesc")}</p>
              </button>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              {isDE ? "⏱ Dauer: ca. 2 Minuten · Personalisiert dein Dashboard" : "⏱ Duration: ~2 minutes · Personalizes your dashboard"}
            </p>
          </div>
        )}

        {/* Step: Experience Level */}
        {step === "experience" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Wie viel Erfahrung hast du?" : "How much experience do you have?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Das hilft uns, dir die richtigen Tools zu zeigen." : "This helps us show you the right tools."}</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "none", label: isDE ? "Komplett neu" : "Complete beginner", desc: isDE ? "Noch nie ein physisches Produkt verkauft" : "Never sold a physical product", emoji: "🌱" },
                { value: "some", label: isDE ? "Erste Erfahrung" : "Some experience", desc: isDE ? "Habe schon recherchiert oder erste Produkte getestet" : "Have researched or tested first products", emoji: "📋" },
                { value: "active", label: isDE ? "Bereits aktiv" : "Already active", desc: isDE ? "Verkaufe bereits und möchte optimieren" : "Already selling and want to optimize", emoji: "📈" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setExperience(opt.value); goNext(); }}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm flex items-center gap-4",
                    experience === opt.value ? "border-primary bg-primary/5" : "bg-card"
                  )}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-start">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Product Type */}
        {step === "product_type" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Box className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Was ist dein Produkttyp?" : "What's your product type?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Dies bestimmt deine Checklisten, Compliance und Lieferantenempfehlungen." : "This determines your checklists, compliance, and supplier recommendations."}</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "physical" as const, icon: Package, label: isDE ? "Physisches Produkt" : "Physical product", desc: isDE ? "Kosmetik, Textilien, Food, Elektronik, Print etc." : "Cosmetics, textiles, food, electronics, print etc." },
                { value: "digital" as const, icon: Monitor, label: isDE ? "Digitales Produkt" : "Digital product", desc: isDE ? "E-Books, Kurse, Templates, Software" : "E-books, courses, templates, software" },
                { value: "service" as const, icon: Briefcase, label: isDE ? "Dienstleistung" : "Service", desc: isDE ? "Beratung, Coaching, Agentur" : "Consulting, coaching, agency" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setProductTypeChoice(opt.value); goNext(); }}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm flex items-center gap-4",
                    productTypeChoice === opt.value ? "border-primary bg-primary/5" : "bg-card"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <opt.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-start">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Product Category (Physical only) */}
        {step === "product_category" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Welche Produktkategorie?" : "Which product category?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Deine Checklisten, Compliance und Lieferanten werden darauf angepasst." : "Your checklists, compliance, and suppliers will be tailored to this."}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {physicalCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setProductCategory(cat.id); setProductType(cat.id); goNext(); }}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm",
                    productCategory === cat.id ? "border-primary bg-primary/5" : "bg-card"
                  )}
                >
                  <p className="font-semibold text-sm">{isDE ? cat.labelDe : cat.labelEn}</p>
                </button>
              ))}
              <button
                onClick={() => { setProductCategory("other"); setProductType("other"); goNext(); }}
                className={cn(
                  "text-left rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm",
                  productCategory === "other" ? "border-primary bg-primary/5" : "bg-card"
                )}
              >
                <p className="font-semibold text-sm">{isDE ? "Sonstiges" : "Other"}</p>
              </button>
            </div>
            <div className="flex justify-start">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Risk Flags */}
        {step === "risk_flags" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Risiko-Flags prüfen" : "Review risk flags"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Basierend auf deiner Kategorie – passe an, was auf dein Produkt zutrifft." : "Based on your category – adjust what applies to your product."}</p>
            </div>
            <div className="space-y-2">
              {RISK_FLAGS.map((flag) => (
                <label
                  key={flag.id}
                  className={cn(
                    "flex items-center gap-3 cursor-pointer rounded-xl border p-3.5 transition-all hover:border-primary/30",
                    riskFlagSelections.includes(flag.id) ? "border-primary bg-primary/5" : "bg-card"
                  )}
                >
                  <Checkbox
                    checked={riskFlagSelections.includes(flag.id)}
                    onCheckedChange={(checked) => {
                      setRiskFlagSelections(prev =>
                        checked ? [...prev, flag.id] : prev.filter(f => f !== flag.id)
                      );
                    }}
                  />
                  <span className="text-sm font-medium">{isDE ? flag.labelDe : flag.labelEn}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
              <Button size="sm" onClick={goNext} className="gap-1.5">
                {isDE ? "Weiter" : "Next"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Goal */}
        {step === "product" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Was ist dein Ziel?" : "What is your goal?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Das bestimmt deine Dashboard-Prioritäten." : "This determines your dashboard priorities."}</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "validate", label: isDE ? "Idee validieren" : "Validate idea", desc: isDE ? "Herausfinden, ob mein Produkt Potenzial hat" : "Find out if my product has potential", emoji: "🔍" },
                { value: "launch", label: isDE ? "Ersten Launch planen" : "Plan first launch", desc: isDE ? "Strukturiert zum ersten Produkt" : "Structured path to first product", emoji: "🎯" },
                { value: "profitability", label: isDE ? "Profitabilität steigern" : "Increase profitability", desc: isDE ? "Margen verbessern und Kosten senken" : "Improve margins and reduce costs", emoji: "💰" },
                { value: "scale", label: isDE ? "Skalieren" : "Scale", desc: isDE ? "Umsatz und Volumen steigern" : "Increase revenue and volume", emoji: "📈" },
                { value: "survival", label: isDE ? "Überleben sichern" : "Secure survival", desc: isDE ? "Cashflow stabilisieren und Risiken senken" : "Stabilize cashflow and reduce risks", emoji: "🛟" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setGoal(opt.value); goNext(); }}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm flex items-center gap-4",
                    goal === opt.value ? "border-primary bg-primary/5" : "bg-card"
                  )}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-start">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Budget */}
        {step === "budget" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Wie viel Budget hast du?" : "What's your budget?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Dein Startbudget für Produktion + Marketing." : "Your starting budget for production + marketing."}</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "under1k", label: isDE ? "Unter 1.000 €" : "Under €1,000", desc: isDE ? "Micro-Budget, maximale Effizienz" : "Micro-budget, maximum efficiency" },
                { value: "1k-5k", label: "1.000 – 5.000 €", desc: isDE ? "Solider Start mit Kernprodukt" : "Solid start with core product" },
                { value: "5k-15k", label: "5.000 – 15.000 €", desc: isDE ? "Professioneller Launch möglich" : "Professional launch possible" },
                { value: "15k-50k", label: "15.000 – 50.000 €", desc: isDE ? "Multi-Produkt oder Premium-Marke" : "Multi-product or premium brand" },
                { value: "50k+", label: isDE ? "Über 50.000 €" : "Over €50,000", desc: isDE ? "Vollständige Skalierung" : "Full-scale operation" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setBudget(opt.value); goNext(); }}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm",
                    budget === opt.value ? "border-primary bg-primary/5" : "bg-card"
                  )}
                >
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-start">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Archetype (Risk Tolerance) */}
        {step === "archetype" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Wie risikobereit bist du?" : "What's your risk tolerance?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isDE ? "Das bestimmt deinen Gründer-Archetyp und personalisiert dein Dashboard." : "This determines your founder archetype and personalizes your dashboard."}
              </p>
            </div>
            <div className="space-y-3">
              {[
                { value: "low", icon: ShieldAlert, label: isDE ? "Konservativ" : "Conservative", desc: isDE ? "Sicherheit zuerst. Kapital schützen." : "Safety first. Protect capital.", color: "text-sky-500" },
                { value: "medium", icon: Heart, label: isDE ? "Ausgewogen" : "Balanced", desc: isDE ? "Kalkulierte Risiken. Kontrolliertes Wachstum." : "Calculated risks. Controlled growth.", color: "text-amber-500" },
                { value: "high", icon: Zap, label: isDE ? "Aggressiv" : "Aggressive", desc: isDE ? "Schnell skalieren. Hoher Einsatz, hohe Rendite." : "Scale fast. High stake, high reward.", color: "text-emerald-500" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRiskTolerance(opt.value)}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm flex items-center gap-4",
                    riskTolerance === opt.value ? "border-primary bg-primary/5" : "bg-card"
                  )}
                >
                  <opt.icon className={cn("h-5 w-5 shrink-0", opt.color)} />
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Archetype reveal */}
            {riskTolerance && goal && (
              <div className="rounded-2xl border bg-card p-5 animate-fade-in shadow-card">
                {(() => {
                  const arch = determineArchetype(goal, riskTolerance, budget);
                  const data = ARCHETYPE_DATA[arch];
                  return (
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                        {data.emoji}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dein Archetyp</p>
                        <p className="font-bold text-sm">{data.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{data.desc}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!riskTolerance}
                onClick={async () => {
                  setStep("done");
                  await markCompleted("guided");
                  navigate("/dashboard");
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isDE ? "Dashboard starten" : "Start Dashboard"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
