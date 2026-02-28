import { useState, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { useBrand } from "@/hooks/useBrand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";
import {
  generateStarterProfile,
  type StarterAnswers,
  type StarterProfile,
} from "@/lib/starter-profile-generator";

interface GuidedStarterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QuestionDef {
  key: keyof StarterAnswers;
  titleDe: string;
  titleEn: string;
  options: { value: string; labelDe: string; labelEn: string }[];
  allowCustom?: boolean;
}

const questions: QuestionDef[] = [
  {
    key: "productType",
    titleDe: "Welche Art von Produkt planst du?",
    titleEn: "What type of product are you planning?",
    options: [
      { value: "Kosmetik / Skincare", labelDe: "Kosmetik / Skincare", labelEn: "Cosmetics / Skincare" },
      { value: "Food / Getränke", labelDe: "Food / Getränke", labelEn: "Food / Beverages" },
      { value: "Mode / Accessoires", labelDe: "Mode / Accessoires", labelEn: "Fashion / Accessories" },
      { value: "Home / Lifestyle", labelDe: "Home / Lifestyle", labelEn: "Home / Lifestyle" },
    ],
    allowCustom: true,
  },
  {
    key: "budget",
    titleDe: "Wie hoch ist dein Startbudget?",
    titleEn: "What is your starting budget?",
    options: [
      { value: "<1k", labelDe: "Unter 1.000 €", labelEn: "Under €1,000" },
      { value: "1k-5k", labelDe: "1.000 – 5.000 €", labelEn: "€1,000 – €5,000" },
      { value: "5k-15k", labelDe: "5.000 – 15.000 €", labelEn: "€5,000 – €15,000" },
      { value: "15k+", labelDe: "Über 15.000 €", labelEn: "Over €15,000" },
    ],
  },
  {
    key: "targetMarket",
    titleDe: "Welchen Markt möchtest du bedienen?",
    titleEn: "What market do you want to target?",
    options: [
      { value: "mass", labelDe: "Massenmarkt – Breites Publikum", labelEn: "Mass market – Broad audience" },
      { value: "niche", labelDe: "Nische – Spezialisierte Zielgruppe", labelEn: "Niche – Specialized audience" },
      { value: "premium", labelDe: "Premium – Hochwertig & exklusiv", labelEn: "Premium – High-end & exclusive" },
    ],
  },
  {
    key: "launchGoal",
    titleDe: "Was ist dein Ziel mit diesem Launch?",
    titleEn: "What is your goal with this launch?",
    options: [
      { value: "test-idea", labelDe: "Idee testen – Sehen ob es funktioniert", labelEn: "Test idea – See if it works" },
      { value: "side-income", labelDe: "Nebeneinkommen aufbauen", labelEn: "Build side income" },
      { value: "build-brand", labelDe: "Eigene Marke aufbauen", labelEn: "Build a brand" },
    ],
  },
  {
    key: "riskTolerance",
    titleDe: "Wie risikobereit bist du?",
    titleEn: "How risk-tolerant are you?",
    options: [
      { value: "low", labelDe: "Niedrig – Lieber vorsichtig starten", labelEn: "Low – Prefer to start carefully" },
      { value: "medium", labelDe: "Mittel – Kalkuliertes Risiko ist okay", labelEn: "Medium – Calculated risk is okay" },
      { value: "high", labelDe: "Hoch – Ich bin bereit, mehr zu investieren", labelEn: "High – I'm ready to invest more" },
    ],
  },
];

export const GuidedStarterDialog = forwardRef<HTMLDivElement, GuidedStarterDialogProps>(function GuidedStarterDialog({ open, onOpenChange }, _ref) {
  const { i18n } = useTranslation();
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const isDE = i18n.language === "de";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<StarterAnswers>>({});
  const [customProduct, setCustomProduct] = useState("");
  const [result, setResult] = useState<StarterProfile | null>(null);
  const [applying, setApplying] = useState(false);

  const totalSteps = questions.length;
  const isResult = step === totalSteps;
  const progress = Math.round((step / totalSteps) * 100);

  const currentQ = questions[step];
  const currentValue = currentQ ? answers[currentQ.key] : undefined;

  const handleSelect = (value: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.key]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Generate result
      const finalAnswers: StarterAnswers = {
        productType: answers.productType || customProduct || "Produkt",
        budget: answers.budget || "<1k",
        targetMarket: answers.targetMarket || "mass",
        launchGoal: answers.launchGoal || "test-idea",
        riskTolerance: answers.riskTolerance || "low",
      };
      setResult(generateStarterProfile(finalAnswers));
      setStep(totalSteps);
    }
  };

  const handleApply = async () => {
    if (!result || !activeBrand) return;
    setApplying(true);
    try {
      const { error } = await supabase
        .from("brand_profiles")
        .upsert(
          {
            brand_id: activeBrand.id,
            ...result.prefill,
          },
          { onConflict: "brand_id" }
        );
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["brand_profile", activeBrand.id] });
      toast.success(isDE ? "Empfehlungen wurden übernommen!" : "Recommendations applied!");
      onOpenChange(false);
      resetState();
    } catch {
      toast.error(isDE ? "Fehler beim Speichern" : "Error saving");
    } finally {
      setApplying(false);
    }
  };

  const resetState = () => {
    setStep(0);
    setAnswers({});
    setCustomProduct("");
    setResult(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {isDE ? "Guided Starter" : "Guided Starter"}
          </DialogTitle>
          <DialogDescription>
            {isDE
              ? "Beantworte ein paar Fragen – wir helfen dir beim Einstieg."
              : "Answer a few questions – we'll help you get started."}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1.5" />

        {!isResult && currentQ && (
          <div className="space-y-4 py-2">
            <p className="text-sm font-medium">
              {isDE ? currentQ.titleDe : currentQ.titleEn}
            </p>
            <RadioGroup
              value={currentValue || ""}
              onValueChange={handleSelect}
              className="space-y-2"
            >
              {currentQ.options.map((opt) => (
                <div
                  key={opt.value}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                >
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label htmlFor={opt.value} className="flex-1 cursor-pointer text-sm">
                    {isDE ? opt.labelDe : opt.labelEn}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {currentQ.allowCustom && (
              <Input
                placeholder={isDE ? "Oder eigene Kategorie eingeben…" : "Or enter your own category…"}
                value={customProduct}
                onChange={(e) => {
                  setCustomProduct(e.target.value);
                  setAnswers((prev) => ({ ...prev, productType: e.target.value }));
                }}
              />
            )}
          </div>
        )}

        {isResult && result && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-accent/5 p-4 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {isDE ? "Positionierung" : "Positioning"}
                </p>
                <p className="text-sm font-medium">{result.positioning}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {isDE ? "Empfohlene Startmenge" : "Recommended Starting Quantity"}
                </p>
                <p className="text-sm font-medium">
                  {result.quantityRange.min} – {result.quantityRange.max}{" "}
                  {isDE ? "Einheiten" : "units"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {isDE ? "Preislogik" : "Pricing Logic"}
                </p>
                <p className="text-sm">{result.pricingLogic}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {isDE ? "Empfohlene Strategie" : "Recommended Strategy"}
                </p>
                <p className="text-sm">{result.strategy}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-xs text-muted-foreground">
                {isDE
                  ? "Dies ist eine Startempfehlung, keine finale Strategie. Passe die Werte im Workflow an deine Situation an."
                  : "This is a starting recommendation, not a final strategy. Adjust the values in the workflow to fit your situation."}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 0 && !isResult && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {isDE ? "Zurück" : "Back"}
            </Button>
          )}
          {!isResult ? (
            <Button
              onClick={handleNext}
              disabled={!currentValue && !customProduct}
              className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {step === totalSteps - 1
                ? isDE
                  ? "Auswertung"
                  : "Generate"
                : isDE
                ? "Weiter"
                : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleApply}
              disabled={applying || !activeBrand}
              className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {applying
                ? isDE
                  ? "Wird übernommen…"
                  : "Applying…"
                : isDE
                ? "In Workflow übernehmen"
                : "Apply to Workflow"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
