import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { starterSteps } from "@/lib/starter-mode";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";

export default function StarterMode() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const current = starterSteps[step];
  const progress = ((step + 1) / starterSteps.length) * 100;
  const isLast = step === starterSteps.length - 1;

  const completeStarterMode = async () => {
    if (user) {
      await supabase
        .from("profiles")
        .update({ completed_starter_mode: true } as any)
        .eq("user_id", user.id);
    }
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
            <BookOpen className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">{t("starter.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("starter.subtitle", { step: step + 1, total: starterSteps.length })}
          </p>
        </div>

        <Progress value={progress} className="mb-8 h-2" />

        <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
          <h2 className="text-lg font-semibold">{t(current.titleKey)}</h2>

          <p className="text-sm leading-relaxed text-foreground">{t(current.explanationKey)}</p>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" />
              {t("starter.example")}
            </div>
            <p className="text-sm">{t(current.exampleKey)}</p>
          </div>

          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("starter.whyMatters")}
            </div>
            <p className="text-sm">{t(current.whyKey)}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => (step > 0 ? setStep(step - 1) : navigate("/onboarding"))}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("steps.back")}
          </Button>

          {isLast ? (
            <Button
              onClick={completeStarterMode}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {t("starter.finish")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setStep(step + 1)}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {t("steps.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
