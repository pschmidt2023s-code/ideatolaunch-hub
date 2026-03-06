import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight, ChevronLeft, CheckCircle2, TrendingUp, Shield, Target, BarChart3, Wallet, PieChart, AlertTriangle, Zap } from "lucide-react";

export type OnboardingMode = "investor" | "trading";

interface MetricStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  metric: string;
  why: string;
  howToUse: string;
  example: string;
  color: string;
}

const INVESTOR_STEPS: MetricStep[] = [
  {
    icon: PieChart,
    title: "Asset Allocation",
    metric: "Verteilung deines Portfolios auf Anlageklassen (Aktien, Crypto, Anleihen, Immobilien, Cash)",
    why: "Diversifikation ist der einzige ‚Free Lunch' im Investieren. Eine ausgewogene Verteilung reduziert dein Gesamtrisiko, ohne die Rendite proportional zu senken.",
    howToUse: "Stelle jedes einzelne Asset ein – z.B. Bitcoin separat von Ethereum. Jedes hat eine eigene Volatilitätsbewertung die in den Risk Score einfließt.",
    example: "60% Aktien / 20% Anleihen / 10% Crypto / 10% Cash = moderates Profil",
    color: "text-chart-1",
  },
  {
    icon: Shield,
    title: "Portfolio Risk Score",
    metric: "Gesamtrisiko deines Portfolios von 0-100 (100 = minimal)",
    why: "Der Score aggregiert Konzentrations-, Volatilitäts- und Drawdown-Risiken. Er zeigt dir auf einen Blick, ob dein Portfolio stabil oder gefährdet ist.",
    howToUse: "Ziel: >70 für konservativ, 40-70 für moderat, <40 = hohes Risiko. Wenn der Score fällt, zeigt die RiskCard die Ursache.",
    example: "Ein Portfolio mit 50% in einer Einzelaktie hat einen Score von ~40 (Klumpenrisiko)",
    color: "text-success",
  },
  {
    icon: TrendingUp,
    title: "Rendite p.a. (Annual Return)",
    metric: "Deine erwartete jährliche Rendite in Prozent",
    why: "Die Rendite bestimmt, ob dein Portfolio wächst oder schrumpft. Im Reality Mode wird sie für Szenarien angepasst (Optimistisch: +20%, Worst Case: -30%).",
    howToUse: "Setze die Rendite realistisch basierend auf historischen Daten. S&P 500: ~10%, Crypto: stark schwankend, Anleihen: ~3-5%.",
    example: "8% p.a. auf 50.000€ = 4.000€ Wachstum/Jahr = 333€/Monat",
    color: "text-chart-2",
  },
  {
    icon: AlertTriangle,
    title: "Drawdown",
    metric: "Aktueller Wertverlust vom Höchststand in Prozent",
    why: "Drawdown zeigt, wie viel du vom Peak verloren hast. >20% ist psychologisch schwer zu halten und signalisiert, dass eine Strategie-Anpassung nötig sein könnte.",
    howToUse: "Tracke deinen realen Drawdown. Setze vorher eine Schmerzgrenze (z.B. 15%). Wird sie überschritten → Rebalancing oder Absicherung.",
    example: "Portfolio-Peak: 55.000€, aktuell: 49.500€ → Drawdown = 10%",
    color: "text-destructive",
  },
  {
    icon: Wallet,
    title: "Dividendenrendite",
    metric: "Jährliche Ausschüttungen als Prozent des Portfoliowerts",
    why: "Dividenden generieren passiven Cashflow unabhängig von Kursgewinnen. Sie stabilisieren dein Portfolio in Seitwärtsmärkten.",
    howToUse: "Ziel für Income-Fokus: 3-5%. Für Wachstum: 1-2% reicht. Dividenden werden in den monatlichen Cashflow eingerechnet.",
    example: "2.5% auf 50.000€ = 1.250€/Jahr = ~104€/Monat passives Einkommen",
    color: "text-chart-4",
  },
  {
    icon: BarChart3,
    title: "Konzentrations-Risiko",
    metric: "Wie stark dein Portfolio auf wenige Assets fokussiert ist (0-100)",
    why: "Hohes Klumpenrisiko bedeutet, dass ein einzelner Verlust dein ganzes Portfolio treffen kann. Es wird automatisch aus deinen Sub-Assets berechnet.",
    howToUse: "Wird automatisch berechnet. <30 = gut diversifiziert, >60 = gefährlich. Füge mehr Assets hinzu um zu diversifizieren.",
    example: "3 Assets mit 70/20/10% → Konzentration ~65 (zu hoch)",
    color: "text-warning",
  },
];

const TRADING_STEPS: MetricStep[] = [
  {
    icon: Target,
    title: "Profit Factor",
    metric: "Verhältnis von Gesamtgewinnen zu Gesamtverlusten",
    why: "Der Profit Factor ist die wichtigste Kennzahl im Trading. >1.5 = gute Strategie, <1.0 = du verlierst langfristig Geld.",
    howToUse: "Berechnung: (Winrate × Ø Win) / ((1-Winrate) × Ø Loss). Optimiere durch besseres Risk-Reward-Ratio oder höhere Winrate.",
    example: "55% Winrate, 150€ Ø Win, 100€ Ø Loss → PF = 1.83 ✅",
    color: "text-success",
  },
  {
    icon: Zap,
    title: "Expectancy (Erwartungswert)",
    metric: "Durchschnittlicher Gewinn pro Trade nach Kosten",
    why: "Die Expectancy zeigt, ob dein System langfristig profitabel ist. Negativ = jeder Trade kostet dich im Schnitt Geld.",
    howToUse: "Hier fließen auch Kommission und Slippage ein. Eine positive Expectancy bei >100 Trades ist statistisch signifikant.",
    example: "+45€ Expectancy × 20 Trades/Monat = 900€ erwarteter Gewinn",
    color: "text-chart-1",
  },
  {
    icon: Shield,
    title: "Account Survival",
    metric: "Wahrscheinlichkeit, dass dein Account die nächsten 100 Trades überlebt",
    why: "Basiert auf der Wahrscheinlichkeit einer Verlustserie, die dein Konto auf 0 bringt. Bei 2% Risk/Trade brauchst du 50 Verluste in Folge.",
    howToUse: "Ziel: >95%. Wenn <80% → Risk/Trade sofort senken. Das ist die wichtigste Überlebensmetrik.",
    example: "55% WR, 2% Risk → 99.97% Survival ✅ vs. 5% Risk → 82% ⚠️",
    color: "text-chart-2",
  },
  {
    icon: BarChart3,
    title: "Risk per Trade",
    metric: "Prozent des Kontostands, das du pro Trade riskierst",
    why: "Die goldene Regel: Nie mehr als 1-2% pro Trade riskieren. Bei 5% reichen 20 Verlusttrades um 64% deines Kontos zu verlieren.",
    howToUse: "Berechne: Positionsgröße × Stop-Loss Distanz ≤ 2% des Kontostands. Das System warnt dich automatisch bei >3%.",
    example: "10.000€ Konto × 2% = 200€ max. Verlust pro Trade",
    color: "text-warning",
  },
  {
    icon: TrendingUp,
    title: "Leverage (Hebel)",
    metric: "Multiplikator für deine Positionsgröße",
    why: "Leverage verstärkt Gewinne UND Verluste gleichermaßen. 100x Hebel bedeutet: 1% Marktbewegung = 100% deines Einsatzes.",
    howToUse: "Forex: max. 30x (EU-Regulierung). Crypto: idealerweise 1-5x. Futures: je nach Margin. Das System berechnet Liquidationsrisiko.",
    example: "1.000€ mit 10x Hebel = 10.000€ Position. 10% Gegenbewegung = Totalverlust",
    color: "text-destructive",
  },
  {
    icon: AlertTriangle,
    title: "Daily Loss Limit",
    metric: "Maximaler Tagesverlust bevor du aufhörst zu traden",
    why: "Emotionales Trading nach Verlusten ist der #1 Account-Killer. Ein festes Limit schützt dich vor Revenge-Trading und Tilt.",
    howToUse: "Setze auf 3-5% des Kontostands. Wird das Limit erreicht → PC aus, morgen weiter. Das System trackt es automatisch.",
    example: "10.000€ × 5% Daily Limit = Max. 500€ Verlust/Tag",
    color: "text-chart-3",
  },
];

interface Props {
  mode: OnboardingMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MetricOnboarding({ mode, open, onOpenChange }: Props) {
  const [step, setStep] = useState(0);
  const steps = mode === "investor" ? INVESTOR_STEPS : TRADING_STEPS;
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{mode === "investor" ? "Investor" : "Trading"} Onboarding</span>
            <span className="ml-auto">{step + 1} / {steps.length}</span>
          </div>
          <DialogTitle className="flex items-center gap-2">
            <current.icon className={cn("h-5 w-5", current.color)} />
            {current.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Metric */}
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Was ist das?</p>
            <p className="text-sm">{current.metric}</p>
          </div>

          {/* Why */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Warum ist das wichtig?</p>
            <p className="text-sm text-foreground/90">{current.why}</p>
          </div>

          {/* How to use */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Wie nutze ich das?</p>
            <p className="text-sm text-foreground/90">{current.howToUse}</p>
          </div>

          {/* Example */}
          <div className="rounded-xl border border-dashed p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">💡 Beispiel</p>
            <p className="text-sm font-medium">{current.example}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-1">
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={cn("h-2 rounded-full transition-all", i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30")} />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Zurück
          </Button>
          {isLast ? (
            <Button size="sm" onClick={() => onOpenChange(false)}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Verstanden
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep(s => s + 1)}>
              Weiter <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
