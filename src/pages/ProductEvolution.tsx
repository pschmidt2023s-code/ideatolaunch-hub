import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
  Settings2,
  CalendarRange,
  ListChecks,
  UserCheck,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Award,
  Rocket,
  Zap,
  TrendingUp,
  Target,
  DollarSign,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "released" | "in-progress" | "coming-soon";

interface RoadmapItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  features: string[];
  status: Status;
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; classes: string }> = {
    released: {
      label: "Released",
      classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    "in-progress": {
      label: "In Progress",
      classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    "coming-soon": {
      label: "Coming Soon",
      classes: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
  };
  const { label, classes } = map[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase", classes)}>
      {label}
    </span>
  );
}

function RoadmapCard({ item, index }: { item: RoadmapItem; index: number }) {
  const Icon = item.icon;
  return (
    <Card
      className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/70 transition-all duration-300 group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
          </div>
          <StatusBadge status={item.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-1.5">
          {item.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-1 w-1 shrink-0 rounded-full bg-accent/60" />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  month,
  subtitle,
  label,
}: {
  month: string;
  subtitle: string;
  label: string;
}) {
  return (
    <div className="relative mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">{label}</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{month}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

export default function ProductEvolution() {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const marchItems: RoadmapItem[] = [
    {
      icon: Settings2,
      title: isDE ? "Admin Monetarisierung" : "Admin Monetization Control",
      features: [
        isDE ? "Rabattcodes" : "Discount codes",
        isDE ? "Abo-Verwaltung" : "Subscription management",
        isDE ? "Rückerstattungs-Trigger" : "Refund trigger",
        "Audit Log",
      ],
      status: "released",
    },
    {
      icon: CalendarRange,
      title: isDE ? "Jahres- & Halbjahrespläne" : "Annual & Semi-Annual Plans",
      features: [
        isDE ? "Monatlich vs. Jährlich Toggle" : "Monthly vs Yearly toggle",
        isDE ? "15 % Jahresrabatt" : "15% yearly discount",
        isDE ? "Cashflow-Stabilisierung" : "Cashflow stabilization",
      ],
      status: "released",
    },
    {
      icon: ListChecks,
      title: isDE ? "Wöchentlicher Execution Check-In" : "Weekly Execution Check-In",
      features: [
        isDE ? "KPI-Erinnerung" : "KPI reminder",
        isDE ? "Fokusauswahl" : "Focus selection",
        isDE ? "3 Prioritäts-Aufgaben" : "3 priority tasks",
        "Streak Tracking",
      ],
      status: "released",
    },
    {
      icon: UserCheck,
      title: "Onboarding 2.0",
      features: [
        isDE ? "Zielauswahl" : "Goal selection",
        isDE ? "Budget-Bewusstsein" : "Budget awareness",
        isDE ? "Erfahrungslevel" : "Experience level",
        isDE ? "Archetyp-System" : "Archetype system",
        isDE ? "Fortschrittsbalken mit Restzeit" : "Progress bar with time estimate",
      ],
      status: "released",
    },
  ];

  const aprilItems: RoadmapItem[] = [
    {
      icon: AlertTriangle,
      title: isDE ? "Fehler-Simulator (Light)" : "Failure Simulator (Light)",
      features: [
        isDE ? "MOQ-Stresstest" : "MOQ stress test",
        isDE ? "Preissturz-Simulation" : "Price drop simulation",
        isDE ? "Retourenquote-Simulation" : "Return rate simulation",
        isDE ? "Verlustberechnung" : "Loss calculation output",
      ],
      status: "released",
    },
    {
      icon: BarChart3,
      title: isDE ? "Benchmark-Story Upgrade" : "Benchmark Story Upgrade",
      features: [
        isDE ? "Strategische Interpretationsebene" : "Strategic interpretation layer",
        isDE ? "Verbesserungsvorschläge" : "Improvement suggestions",
      ],
      status: "released",
    },
    {
      icon: ShieldCheck,
      title: isDE ? "Kapitalwarn-Ebene" : "Capital Warning Layer",
      features: [
        isDE ? "Runway-Alerts" : "Runway alerts",
        isDE ? "Lagerdruckwarnungen" : "Inventory pressure alerts",
        isDE ? "Margensicherheitsschwellen" : "Margin safety thresholds",
      ],
      status: "released",
    },
    {
      icon: Award,
      title: isDE ? "Vertrauen & Autorität Upgrade" : "Trust & Authority Upgrade",
      features: [
        isDE ? "Case-Study-Block" : "Case study block",
        isDE ? "Gründer-Positionierung" : "Founder positioning",
        isDE ? "Autoritäts-Badges" : "Authority badges",
      ],
      status: "released",
    },
  ];

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="h-5 w-5 text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            {isDE ? "Produktentwicklung" : "Product Evolution"}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isDE
            ? "Roadmap — März & April 2025"
            : "Roadmap — March & April 2025"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {isDE
            ? "Unsere strategische Produktentwicklung. Jede Phase baut auf der vorherigen auf — für kontinuierlichen Mehrwert."
            : "Our strategic product evolution. Each phase builds on the last — delivering continuous value."}
        </p>
      </div>

      {/* Timeline connector */}
      <div className="relative space-y-12">
        {/* Vertical timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-accent/60 via-border/40 to-transparent hidden sm:block" />

        {/* March */}
        <section className="relative sm:pl-12">
          <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-accent ring-4 ring-background hidden sm:block" />
          <SectionHeader
            label={isDE ? "Phase 1" : "Phase 1"}
            month={isDE ? "März — Monetarisierung & Execution Fundament" : "March — Monetization & Execution Foundation"}
            subtitle={isDE ? "Grundlagen für nachhaltiges Wachstum" : "Laying the groundwork for sustainable growth"}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {marchItems.map((item, i) => (
              <RoadmapCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* April */}
        <section className="relative sm:pl-12">
          <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-accent bg-background hidden sm:block" />
          <SectionHeader
            label={isDE ? "Phase 2" : "Phase 2"}
            month={isDE ? "April — Differenzierung & Revenue Intelligence" : "April — Differentiation & Revenue Intelligence"}
            subtitle={isDE ? "Einzigartige Werkzeuge, die kein anderes Tool bietet" : "Unique tools no other platform offers"}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {aprilItems.map((item, i) => (
              <RoadmapCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* Revenue Activation Mode */}
        <section className="relative sm:pl-12">
          <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-dashed border-accent/50 bg-background hidden sm:block" />
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {isDE ? "Neues Modul" : "New Mode"}
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </div>

          <Card className="relative overflow-hidden border-accent/20 bg-gradient-to-br from-card/80 via-card/60 to-accent/[0.04] backdrop-blur-sm">
            {/* Glow effect */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />

            <CardHeader>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Revenue Activation Mode
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status="coming-soon" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Q2 2025</span>
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm leading-relaxed max-w-xl">
                {isDE
                  ? "Ein strukturiertes System, das Gründern beibringt, ihr Produkt in Umsatz zu verwandeln — nicht durch generische Marketing-Theorie, sondern durch kapitalgesteuerte Execution."
                  : "A structured system that teaches founders how to turn their product into revenue — not through generic marketing theory, but through capital-aware execution."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Target, label: isDE ? "Break-even Ad-Budgetierung" : "Break-even based ad budgeting" },
                  { icon: TrendingUp, label: isDE ? "Angebots-Positionierungs-Engine" : "Offer positioning engine" },
                  { icon: DollarSign, label: isDE ? "Preispsychologie-Ebene" : "Price psychology layer" },
                  { icon: Rocket, label: isDE ? "Pre-Order Strategie-Framework" : "Pre-order strategy framework" },
                  { icon: BarChart3, label: isDE ? "CAC vs LTV Verständnis" : "CAC vs LTV understanding" },
                  { icon: Flame, label: isDE ? "Launch-Test-Roadmap" : "Launch testing roadmap" },
                ].map(({ icon: FIcon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-lg border border-border/30 bg-background/50 px-3 py-2.5 text-sm">
                    <FIcon className="h-4 w-4 shrink-0 text-accent/70" />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
                <Zap className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium">
                  {isDE
                    ? "Execution-Mitglieder erhalten Early Access"
                    : "Execution Members get early access"}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer commitment */}
      <div className="mt-16 text-center">
        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
          {isDE
            ? "Kontinuierliche Weiterentwicklung · Gebaut für Gründer · Kein Feature-Bloat"
            : "Continuous evolution · Built for founders · No feature bloat"}
        </p>
      </div>
    </DashboardLayout>
  );
}
