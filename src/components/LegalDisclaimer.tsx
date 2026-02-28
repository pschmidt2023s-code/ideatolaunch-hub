import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LegalDisclaimerProps {
  type: "market" | "cashflow" | "copilot" | "simulation";
}

const DISCLAIMERS: Record<string, { de: string; en: string }> = {
  market: {
    de: "Die Marktdaten und Scores basieren auf vereinfachten Modellen und Ihren Eingaben. Sie stellen keine Finanz- oder Anlageberatung dar. Marktbedingungen können sich jederzeit ändern.",
    en: "Market data and scores are based on simplified models and your inputs. They do not constitute financial or investment advice. Market conditions may change at any time.",
  },
  cashflow: {
    de: "Cashflow-Prognosen und Stress-Tests basieren auf vereinfachten Annahmen. Sie ersetzen keine professionelle Finanzberatung. Tatsächliche Ergebnisse können erheblich abweichen.",
    en: "Cashflow forecasts and stress tests are based on simplified assumptions. They do not replace professional financial advice. Actual results may differ significantly.",
  },
  copilot: {
    de: "KI-Empfehlungen sind automatisch generiert und können fehlerhaft sein. Sie ersetzen keine professionelle Beratung. Alle Geschäftsentscheidungen liegen in Ihrer Verantwortung.",
    en: "AI recommendations are auto-generated and may be inaccurate. They do not replace professional advice. All business decisions are your responsibility.",
  },
  simulation: {
    de: "Simulationsergebnisse sind hypothetisch und basieren auf Ihren Eingaben. Vergangene Trends garantieren keine zukünftigen Ergebnisse. Keine Steuer- oder Rechtsberatung.",
    en: "Simulation results are hypothetical and based on your inputs. Past trends do not guarantee future results. No tax or legal advice.",
  },
};

export function LegalDisclaimer({ type }: LegalDisclaimerProps) {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const text = DISCLAIMERS[type];

  return (
    <div className="flex items-start gap-2 rounded-lg border border-muted bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span>{isDE ? text.de : text.en}</span>
    </div>
  );
}
