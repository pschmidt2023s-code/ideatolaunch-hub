import {
  Lightbulb, Search, TrendingUp, Users, ShieldAlert,
  Palette, Type, Target, BookOpen, Fingerprint,
  Factory, Calculator, DollarSign, Package, Boxes,
  Globe, Rocket, Megaphone, FileText, GitBranch,
  BarChart3, Zap, Brain, PieChart, Briefcase,
} from "lucide-react";

export interface JourneyModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

export interface JourneyPhase {
  phase: number;
  title: string;
  subtitle: string;
  description: string;
  goal: string;
  color: string;
  icon: React.ElementType;
  modules: JourneyModule[];
}

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    phase: 1,
    title: "Ideenvalidierung",
    subtitle: "Validiere bevor du investierst",
    description: "Teste und validiere deine Geschäftsidee, bevor du Geld ausgibst. Analysiere Marktpotenzial, Wettbewerber und Risiken, um festzustellen, ob deine Idee tragfähig ist.",
    goal: "Feststellen, ob deine Idee es wert ist, verfolgt zu werden.",
    color: "info",
    icon: Lightbulb,
    modules: [
      { id: "idea-analyzer", title: "Ideen-Analyzer", description: "Bewerte deine Geschäftsidee mit KI-gestützter Analyse", icon: Lightbulb, href: "/dashboard/step/1" },
      { id: "market-research", title: "Marktforschung", description: "Tiefgehende Analyse von Marktgröße, Trends und Chancen", icon: Search, href: "/dashboard/intelligence" },
      { id: "trend-radar", title: "Trend-Radar", description: "Entdecke aufkommende Trends in deiner Nische", icon: TrendingUp, href: "/dashboard/intelligence" },
      { id: "competitor-overview", title: "Wettbewerbsanalyse", description: "Analysiere Stärken und Schwächen deiner Konkurrenz", icon: Users, href: "/dashboard/competitors" },
      { id: "risk-analysis", title: "Gründer-Risikoanalyse", description: "Bewerte dein persönliches und geschäftliches Risikoprofil", icon: ShieldAlert, href: "/dashboard/failure-simulator" },
    ],
  },
  {
    phase: 2,
    title: "Markenaufbau",
    subtitle: "Baue ein starkes Fundament",
    description: "Erstelle eine überzeugende Marke, die heraussticht. Von der Namensgebung bis zur Positionierung — baue jedes Element deiner Markenidentität mit geführten Tools.",
    goal: "Ein klares und starkes Markenkonzept erstellen.",
    color: "accent",
    icon: Palette,
    modules: [
      { id: "brand-name", title: "Markennamen-Generator", description: "KI-gestützte Markennamen-Erstellung und -Validierung", icon: Type, href: "/dashboard/intelligence" },
      { id: "brand-positioning", title: "Markenpositionierung", description: "Definiere deine einzigartige Marktposition", icon: Target, href: "/dashboard/step/1" },
      { id: "target-audience", title: "Zielgruppen-Builder", description: "Erstelle detaillierte Kundenpersonas", icon: Users, href: "/dashboard/step/1" },
      { id: "brand-story", title: "Markenstory-Generator", description: "Erstelle eine überzeugende Markengeschichte", icon: BookOpen, href: "/dashboard/intelligence" },
      { id: "brand-identity", title: "Markenidentität-Planer", description: "Visuelles Design, Tonalität und Markenwerte", icon: Fingerprint, href: "/dashboard/step/1" },
    ],
  },
  {
    phase: 3,
    title: "Produktentwicklung",
    subtitle: "Baue etwas Profitables",
    description: "Plane und entwickle dein Produkt mit realistischen Kostenkalkulationen. Finde Lieferanten, berechne Margen und stelle sicher, dass dein Produkt profitabel ist.",
    goal: "Sicherstellen, dass das Produkt profitabel und realistisch ist.",
    color: "warning",
    icon: Factory,
    modules: [
      { id: "supplier-intel", title: "Lieferanten-Intelligence", description: "Finde und bewerte verifizierte Lieferanten weltweit", icon: Factory, href: "/dashboard/step/3" },
      { id: "moq-calc", title: "MOQ-Rechner", description: "Berechne Mindestbestellmengen und Kosten", icon: Calculator, href: "/tools/moq-rechner" },
      { id: "production-cost", title: "Produktionskosten-Rechner", description: "Vollständige Produktionskostenaufschlüsselung", icon: DollarSign, href: "/tools/produktionskosten-rechner" },
      { id: "margin-calc", title: "Margen-Rechner", description: "Berechne Margen und Break-Even-Punkte", icon: PieChart, href: "/tools/break-even-rechner" },
      { id: "packaging", title: "Verpackungsplaner", description: "Verpackungsstrategie und Kostenplanung", icon: Package, href: "/dashboard/step/3" },
    ],
  },
  {
    phase: 4,
    title: "Launch-System",
    subtitle: "Starte mit Zuversicht",
    description: "Bereite alles für einen professionellen Launch vor. Baue deine Website, plane deine Marketingstrategie und erstelle einen Launch-Funnel, der konvertiert.",
    goal: "Eine professionelle Marke launchen.",
    color: "success",
    icon: Rocket,
    modules: [
      { id: "website-creator", title: "Website-Creator", description: "KI-gestützter Website-Builder für deine Marke", icon: Globe, href: "/dashboard/website-builder" },
      { id: "launch-strategy", title: "Launch-Strategie-Planer", description: "Schritt-für-Schritt Launch-Roadmap", icon: Rocket, href: "/dashboard/step/5" },
      { id: "marketing", title: "Marketing-Strategie", description: "Kanalstrategie, Budgetverteilung und Taktiken", icon: Megaphone, href: "/dashboard/step/4" },
      { id: "content-plan", title: "Content-Planung", description: "Content-Kalender und Erstellungs-Workflow", icon: FileText, href: "/dashboard/step/5" },
      { id: "compliance", title: "Compliance-Check", description: "Rechtliche Anforderungen und regulatorische Compliance", icon: ShieldAlert, href: "/dashboard/compliance" },
    ],
  },
  {
    phase: 5,
    title: "Skalierung & Optimierung",
    subtitle: "Wachse mit deiner Marke",
    description: "Skaliere dein Business mit datengestützten Entscheidungen. Tracke Performance, optimiere Abläufe und erkunde Wachstumschancen.",
    goal: "Gründern helfen, ihre Marke zu skalieren.",
    color: "primary",
    icon: BarChart3,
    modules: [
      { id: "analytics", title: "Business-Analytics", description: "Live-KPIs, Metriken und Performance-Tracking", icon: BarChart3, href: "/dashboard/intelligence" },
      { id: "growth-engine", title: "Growth Engine", description: "Automatisierte Wachstumsstrategien und Experimente", icon: Zap, href: "/dashboard/execution" },
      { id: "strategy-intel", title: "Strategie-Intelligence", description: "KI-gestützte strategische Empfehlungen", icon: Brain, href: "/dashboard/intelligence" },
      { id: "revenue", title: "Umsatzoptimierung", description: "Pricing, Upselling und Umsatzwachstums-Tools", icon: DollarSign, href: "/dashboard/revenue" },
      { id: "investor", title: "Investor-Insights", description: "Investoren-fertige Reports und Bewertungen", icon: Briefcase, href: "/dashboard/investor" },
    ],
  },
];
