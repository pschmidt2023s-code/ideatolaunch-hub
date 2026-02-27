import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, GraduationCap, Loader2, ArrowRight, ArrowLeft, Package, DollarSign, Target } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type Step = "welcome" | "experience" | "product" | "budget" | "done";

const STEPS: Step[] = ["welcome", "experience", "product", "budget", "done"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("welcome");
  const [experience, setExperience] = useState("");
  const [productType, setProductType] = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("");

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
    await supabase
      .from("profiles")
      .update({ completed_starter_mode: true })
      .eq("user_id", user.id);
    trackEvent("onboarding_finished", { path, experience, productType, budget, goal });
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
              <h2 className="text-xl font-bold">Wie viel Erfahrung hast du?</h2>
              <p className="text-sm text-muted-foreground mt-1">Das hilft uns, dir die richtigen Tools zu zeigen.</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "none", label: "Komplett neu", desc: "Noch nie ein physisches Produkt verkauft" },
                { value: "some", label: "Erste Erfahrung", desc: "Habe schon recherchiert oder erste Produkte getestet" },
                { value: "active", label: "Bereits aktiv", desc: "Verkaufe bereits und möchte optimieren" },
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
                <ArrowLeft className="h-3.5 w-3.5" /> Zurück
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
              <h2 className="text-xl font-bold">Was willst du launchen?</h2>
              <p className="text-sm text-muted-foreground mt-1">Wähle deine Produktkategorie.</p>
            </div>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger><SelectValue placeholder="Kategorie auswählen…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="skincare">Skincare / Kosmetik</SelectItem>
                <SelectItem value="food">Food / Nahrungsergänzung</SelectItem>
                <SelectItem value="fashion">Fashion / Textilien</SelectItem>
                <SelectItem value="home">Home & Living</SelectItem>
                <SelectItem value="pet">Pet / Haustiere</SelectItem>
                <SelectItem value="tech">Tech-Zubehör</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <Label className="text-sm">Was ist dein Ziel?</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger><SelectValue placeholder="Hauptziel auswählen…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="validate">Idee validieren</SelectItem>
                  <SelectItem value="launch">Ersten Launch planen</SelectItem>
                  <SelectItem value="optimize">Bestehendes Business optimieren</SelectItem>
                  <SelectItem value="scale">Skalieren</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Zurück
              </Button>
              <Button size="sm" onClick={goNext} disabled={!productType} className="gap-1.5">
                Weiter <ArrowRight className="h-3.5 w-3.5" />
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
              <h2 className="text-xl font-bold">Wie viel Budget hast du?</h2>
              <p className="text-sm text-muted-foreground mt-1">Dein Startbudget für Produktion + Marketing.</p>
            </div>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger><SelectValue placeholder="Budget-Range wählen…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="under1k">Unter 1.000 €</SelectItem>
                <SelectItem value="1k-5k">1.000 – 5.000 €</SelectItem>
                <SelectItem value="5k-15k">5.000 – 15.000 €</SelectItem>
                <SelectItem value="15k-50k">15.000 – 50.000 €</SelectItem>
                <SelectItem value="50k+">Über 50.000 €</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Zurück
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={!budget}
                onClick={async () => {
                  setStep("done");
                  await markCompleted("guided");
                  navigate("/dashboard");
                }}
              >
                Dashboard starten <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
