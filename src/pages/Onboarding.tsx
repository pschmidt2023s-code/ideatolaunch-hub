import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, GraduationCap, Loader2, ArrowRight, ArrowLeft, Package, DollarSign, Target, ShieldAlert, Zap, Heart, RefreshCw } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type Step = "welcome" | "experience" | "product" | "budget" | "archetype" | "done";

const STEPS: Step[] = ["welcome", "experience", "product", "budget", "archetype", "done"];

function determineArchetype(goal: string, riskTolerance: string, budget: string): string {
  // Recovery founder: low budget + survival goal
  if (goal === "survival" || (budget === "under1k" && riskTolerance === "low")) return "recovery_founder";
  // Aggressive scaler: high risk + scale goal
  if (goal === "scale" || riskTolerance === "high") return "aggressive_scaler";
  // Brand perfectionist: mid-high budget + launch/profitability + low-medium risk
  if ((goal === "launch" || goal === "profitability") && riskTolerance !== "high" && (budget === "5k-15k" || budget === "15k-50k" || budget === "50k+")) return "brand_perfectionist";
  // Default: conservative planner
  return "conservative_planner";
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("welcome");
  const [experience, setExperience] = useState("");
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

  const markCompleted = async (path: string) => {
    if (!user) return;
    const archetype = determineArchetype(goal, riskTolerance, budget);
    await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, completed_starter_mode: true, archetype, risk_tolerance: riskTolerance } as any,
        { onConflict: "user_id" }
      );
    trackEvent("onboarding_finished", { path, experience, productType, budget, goal, riskTolerance, archetype });
  };

  const currentIdx = STEPS.indexOf(step);
  const progress = Math.round(((currentIdx) / (STEPS.length - 1)) * 100);

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };
  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  if (isLoading || profile?.completed_starter_mode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        {step !== "welcome" && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Schritt {currentIdx} von {STEPS.length - 1}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Step: Welcome */}
        {step === "welcome" && (
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">B</span>
            </div>
            <h1 className="text-2xl font-bold">{t("onboarding.title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("onboarding.subtitle")}</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                onClick={async () => {
                  setExperience("experienced");
                  await markCompleted("experienced");
                  navigate("/dashboard");
                }}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-md hover:border-accent/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Lightbulb className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-semibold">{t("onboarding.experienced")}</h2>
                <p className="text-sm text-muted-foreground">{t("onboarding.experiencedDesc")}</p>
              </button>

              <button
                onClick={() => {
                  setExperience("beginner");
                  setStep("experience");
                }}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-md hover:border-accent/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <h2 className="font-semibold">{t("onboarding.beginner")}</h2>
                <p className="text-sm text-muted-foreground">{t("onboarding.beginnerDesc")}</p>
              </button>
            </div>
          </div>
        )}

        {/* Step: Experience Level */}
        {step === "experience" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Wie viel Erfahrung hast du?" : "How much experience do you have?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Das hilft uns, dir die richtigen Tools zu zeigen." : "This helps us show you the right tools."}</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "none", label: isDE ? "Komplett neu" : "Complete beginner", desc: isDE ? "Noch nie ein physisches Produkt verkauft" : "Never sold a physical product" },
                { value: "some", label: isDE ? "Erste Erfahrung" : "Some experience", desc: isDE ? "Habe schon recherchiert oder erste Produkte getestet" : "Have researched or tested first products" },
                { value: "active", label: isDE ? "Bereits aktiv" : "Already active", desc: isDE ? "Verkaufe bereits und möchte optimieren" : "Already selling and want to optimize" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setExperience(opt.value); goNext(); }}
                  className={`w-full text-left rounded-xl border p-4 transition-all hover:border-accent/40 hover:shadow-sm ${
                    experience === opt.value ? "border-accent bg-accent/5" : "bg-card"
                  }`}
                >
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Product Type */}
        {step === "product" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Was willst du launchen?" : "What do you want to launch?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Wähle deine Produktkategorie." : "Choose your product category."}</p>
            </div>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger><SelectValue placeholder={isDE ? "Kategorie auswählen…" : "Select category…"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="skincare">Skincare / {isDE ? "Kosmetik" : "Cosmetics"}</SelectItem>
                <SelectItem value="food">Food / {isDE ? "Nahrungsergänzung" : "Supplements"}</SelectItem>
                <SelectItem value="fashion">Fashion / {isDE ? "Textilien" : "Textiles"}</SelectItem>
                <SelectItem value="home">Home & Living</SelectItem>
                <SelectItem value="pet">Pet / {isDE ? "Haustiere" : "Pets"}</SelectItem>
                <SelectItem value="tech">Tech-{isDE ? "Zubehör" : "Accessories"}</SelectItem>
                <SelectItem value="other">{isDE ? "Sonstiges" : "Other"}</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <Label className="text-sm">{isDE ? "Was ist dein Ziel?" : "What is your goal?"}</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger><SelectValue placeholder={isDE ? "Hauptziel auswählen…" : "Select primary goal…"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="validate">{isDE ? "Idee validieren" : "Validate idea"}</SelectItem>
                  <SelectItem value="launch">{isDE ? "Ersten Launch planen" : "Plan first launch"}</SelectItem>
                  <SelectItem value="profitability">{isDE ? "Profitabilität steigern" : "Increase profitability"}</SelectItem>
                  <SelectItem value="scale">{isDE ? "Skalieren" : "Scale"}</SelectItem>
                  <SelectItem value="survival">{isDE ? "Überleben sichern" : "Secure survival"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
              <Button size="sm" onClick={goNext} disabled={!productType} className="gap-1.5">
                {isDE ? "Weiter" : "Next"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Budget */}
        {step === "budget" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-xl font-bold">{isDE ? "Wie viel Budget hast du?" : "What's your budget?"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isDE ? "Dein Startbudget für Produktion + Marketing." : "Your starting budget for production + marketing."}</p>
            </div>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger><SelectValue placeholder={isDE ? "Budget-Range wählen…" : "Select budget range…"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="under1k">{isDE ? "Unter 1.000 €" : "Under €1,000"}</SelectItem>
                <SelectItem value="1k-5k">1.000 – 5.000 €</SelectItem>
                <SelectItem value="5k-15k">5.000 – 15.000 €</SelectItem>
                <SelectItem value="15k-50k">15.000 – 50.000 €</SelectItem>
                <SelectItem value="50k+">{isDE ? "Über 50.000 €" : "Over €50,000"}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
              <Button size="sm" onClick={goNext} disabled={!budget} className="gap-1.5">
                {isDE ? "Weiter" : "Next"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Archetype (Risk Tolerance) */}
        {step === "archetype" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <ShieldAlert className="h-6 w-6 text-accent" />
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
                  className={`w-full text-left rounded-xl border p-4 transition-all hover:border-accent/40 hover:shadow-sm flex items-center gap-4 ${
                    riskTolerance === opt.value ? "border-accent bg-accent/5" : "bg-card"
                  }`}
                >
                  <opt.icon className={`h-5 w-5 shrink-0 ${opt.color}`} />
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {riskTolerance && goal && (
              <div className="rounded-xl border bg-card/50 p-4 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-1">{isDE ? "Dein Gründer-Archetyp:" : "Your Founder Archetype:"}</p>
                <p className="font-semibold text-sm">
                  {(() => {
                    const arch = determineArchetype(goal, riskTolerance, budget);
                    const labels: Record<string, string> = {
                      conservative_planner: isDE ? "🛡️ Conservative Planner" : "🛡️ Conservative Planner",
                      aggressive_scaler: isDE ? "🚀 Aggressive Scaler" : "🚀 Aggressive Scaler",
                      brand_perfectionist: isDE ? "💎 Brand Perfectionist" : "💎 Brand Perfectionist",
                      recovery_founder: isDE ? "🔄 Recovery Founder" : "🔄 Recovery Founder",
                    };
                    return labels[arch] || arch;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isDE ? "Dein Dashboard wird entsprechend priorisiert." : "Your dashboard will be prioritized accordingly."}
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {isDE ? "Zurück" : "Back"}
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={!riskTolerance}
                onClick={async () => {
                  setStep("done");
                  await markCompleted("guided");
                  navigate("/dashboard");
                }}
              >
                {isDE ? "Dashboard starten" : "Start Dashboard"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
