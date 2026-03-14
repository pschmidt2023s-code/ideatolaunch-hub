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
  Brain,
  Globe,
  Smartphone,
  Users,
  Sparkles,
  LineChart,
  Lock,
  Layers,
  MessageSquare,
  FileText,
  Gauge,
  Workflow,
  PieChart,
  RefreshCcw,
  Megaphone,
  Store,
  BookOpen,
  Puzzle,
  Star,
  Shield,
  Cpu,
  Mail,
} from "lucide-react";

export type Status = "released" | "in-progress" | "coming-soon";

export interface RoadmapItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  features: string[];
  status: Status;
}

export interface RoadmapSection {
  label: { de: string; en: string };
  month: { de: string; en: string };
  subtitle: { de: string; en: string };
  dotStyle: "solid" | "border" | "dashed";
  items: RoadmapItem[];
  isDE?: boolean;
}

export function getRoadmapSections(isDE: boolean): RoadmapSection[] {
  return [
    // Phase 1 — March
    {
      label: { de: "Phase 1", en: "Phase 1" },
      month: {
        de: "März — Monetarisierung & Execution Fundament",
        en: "March — Monetization & Execution Foundation",
      },
      subtitle: {
        de: "Grundlagen für nachhaltiges Wachstum",
        en: "Laying the groundwork for sustainable growth",
      },
      dotStyle: "solid",
      items: [
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
      ],
    },
    // Phase 2 — April
    {
      label: { de: "Phase 2", en: "Phase 2" },
      month: {
        de: "April — Differenzierung & Revenue Intelligence",
        en: "April — Differentiation & Revenue Intelligence",
      },
      subtitle: {
        de: "Einzigartige Werkzeuge, die kein anderes Tool bietet",
        en: "Unique tools no other platform offers",
      },
      dotStyle: "border",
      items: [
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
      ],
    },
    // Phase 3 — May
    {
      label: { de: "Phase 3", en: "Phase 3" },
      month: {
        de: "Mai — AI Copilot & Smart Automation",
        en: "May — AI Copilot & Smart Automation",
      },
      subtitle: {
        de: "Intelligente Assistenz für schnellere Entscheidungen",
        en: "Intelligent assistance for faster decisions",
      },
      dotStyle: "solid",
      items: [
        {
          icon: Brain,
          title: isDE ? "AI Copilot 2.0" : "AI Copilot 2.0",
          features: [
            isDE ? "Kontextbezogene Vorschläge" : "Context-aware suggestions",
            isDE ? "Marktdaten-Integration" : "Market data integration",
            isDE ? "Automatische Risikoerkennung" : "Auto risk detection",
            isDE ? "Gründer-spezifische Prompts" : "Founder-specific prompts",
          ],
          status: "released",
        },
        {
          icon: Sparkles,
          title: isDE ? "Smart Insights Panel" : "Smart Insights Panel",
          features: [
            isDE ? "KPI-Anomalie-Erkennung" : "KPI anomaly detection",
            isDE ? "Wöchentliche AI-Zusammenfassung" : "Weekly AI summary",
            isDE ? "Handlungsempfehlungen" : "Actionable recommendations",
          ],
          status: "released",
        },
        {
          icon: Workflow,
          title: isDE ? "Workflow-Automatisierung" : "Workflow Automation",
          features: [
            isDE ? "Automatische Task-Erstellung" : "Auto task creation",
            isDE ? "Phasen-basierte Trigger" : "Phase-based triggers",
            isDE ? "Benachrichtigungs-Regeln" : "Notification rules",
          ],
          status: "released",
        },
        {
          icon: MessageSquare,
          title: isDE ? "CEO Briefing System" : "CEO Briefing System",
          features: [
            isDE ? "Tägliche Zusammenfassung" : "Daily summary",
            isDE ? "Prioritäts-Ranking" : "Priority ranking",
            isDE ? "Entscheidungshilfen" : "Decision support",
          ],
          status: "released",
        },
      ],
    },
    // Phase 4 — June
    {
      label: { de: "Phase 4", en: "Phase 4" },
      month: {
        de: "Juni — Community & Netzwerk-Effekte",
        en: "June — Community & Network Effects",
      },
      subtitle: {
        de: "Von Solo-Gründer zum vernetzten Ökosystem",
        en: "From solo founder to connected ecosystem",
      },
      dotStyle: "border",
      items: [
        {
          icon: Users,
          title: isDE ? "Gründer-Circles" : "Founder Circles",
          features: [
            isDE ? "Branchen-basierte Gruppen" : "Industry-based groups",
            isDE ? "Wöchentliche Challenges" : "Weekly challenges",
            isDE ? "Peer-Accountability" : "Peer accountability",
          ],
          status: "released",
        },
        {
          icon: Star,
          title: isDE ? "Leaderboard & Reputation" : "Leaderboard & Reputation",
          features: [
            isDE ? "XP-basiertes Ranking" : "XP-based ranking",
            isDE ? "Expertise-Badges" : "Expertise badges",
            isDE ? "Gründer-Level-System" : "Founder level system",
          ],
          status: "released",
        },
        {
          icon: BookOpen,
          title: isDE ? "Startup Logs" : "Startup Logs",
          features: [
            isDE ? "Öffentliches Gründer-Tagebuch" : "Public founder diary",
            isDE ? "Follower-System" : "Follower system",
            isDE ? "Meilenstein-Tracking" : "Milestone tracking",
          ],
          status: "released",
        },
        {
          icon: Megaphone,
          title: isDE ? "Lieferanten-Reviews" : "Supplier Reviews",
          features: [
            isDE ? "Verifizierte Bewertungen" : "Verified reviews",
            isDE ? "Qualitäts- & Kommunikations-Score" : "Quality & communication score",
            isDE ? "Community-Intelligence" : "Community intelligence",
          ],
          status: "released",
        },
      ],
    },
    // Phase 5 — July
    {
      label: { de: "Phase 5", en: "Phase 5" },
      month: {
        de: "Juli — Website Builder & Brand Präsenz",
        en: "July — Website Builder & Brand Presence",
      },
      subtitle: {
        de: "Vom Konzept zur Live-Marke in Minuten",
        en: "From concept to live brand in minutes",
      },
      dotStyle: "solid",
      items: [
        {
          icon: Globe,
          title: isDE ? "AI Website Builder" : "AI Website Builder",
          features: [
            isDE ? "Prompt-basierte Generierung" : "Prompt-based generation",
            isDE ? "Inline-Bearbeitung" : "Inline editing",
            isDE ? "HTML/CSS Export" : "HTML/CSS export",
            isDE ? "Responsive Vorschau" : "Responsive preview",
          ],
          status: "released",
        },
        {
          icon: Layers,
          title: isDE ? "Template-Bibliothek" : "Template Library",
          features: [
            isDE ? "Branchen-spezifische Vorlagen" : "Industry-specific templates",
            isDE ? "One-Click Anpassung" : "One-click customization",
            isDE ? "A/B-Test Varianten" : "A/B test variants",
          ],
          status: "in-progress",
        },
        {
          icon: FileText,
          title: isDE ? "SEO & Meta-Optimierung" : "SEO & Meta Optimization",
          features: [
            isDE ? "Auto Meta-Tags" : "Auto meta tags",
            isDE ? "Schema.org Markup" : "Schema.org markup",
            isDE ? "Open Graph Vorschau" : "Open Graph preview",
          ],
          status: "in-progress",
        },
      ],
    },
    // Phase 6 — August
    {
      label: { de: "Phase 6", en: "Phase 6" },
      month: {
        de: "August — Advanced Analytics & Forecasting",
        en: "August — Advanced Analytics & Forecasting",
      },
      subtitle: {
        de: "Datengetriebene Entscheidungen auf Profi-Niveau",
        en: "Data-driven decisions at a professional level",
      },
      dotStyle: "border",
      items: [
        {
          icon: LineChart,
          title: isDE ? "Umsatzprognose-Engine" : "Revenue Forecast Engine",
          features: [
            isDE ? "ML-basierte Prognosen" : "ML-based forecasts",
            isDE ? "Saisonale Muster-Erkennung" : "Seasonal pattern detection",
            isDE ? "Konfidenz-Intervalle" : "Confidence intervals",
          ],
          status: "in-progress",
        },
        {
          icon: PieChart,
          title: isDE ? "Kohortenanalyse" : "Cohort Analysis",
          features: [
            isDE ? "Kunden-Retention Kurven" : "Customer retention curves",
            isDE ? "LTV-Projektion" : "LTV projection",
            isDE ? "Segment-Vergleiche" : "Segment comparisons",
          ],
          status: "in-progress",
        },
        {
          icon: Gauge,
          title: isDE ? "Live KPI Dashboard" : "Live KPI Dashboard",
          features: [
            isDE ? "Echtzeit-Metriken" : "Real-time metrics",
            isDE ? "Benutzerdefinierte Widgets" : "Custom widgets",
            isDE ? "Alert-Schwellenwerte" : "Alert thresholds",
            isDE ? "Export-Automatisierung" : "Export automation",
          ],
          status: "in-progress",
        },
      ],
    },
    // Phase 7 — September
    {
      label: { de: "Phase 7", en: "Phase 7" },
      month: {
        de: "September — Compliance 2.0 & Rechtssicherheit",
        en: "September — Compliance 2.0 & Legal Safety",
      },
      subtitle: {
        de: "Automatisierte Rechtskonformität für EU-Gründer",
        en: "Automated legal compliance for EU founders",
      },
      dotStyle: "solid",
      items: [
        {
          icon: Shield,
          title: isDE ? "DSGVO-Assistent" : "GDPR Assistant",
          features: [
            isDE ? "Datenschutz-Audit" : "Privacy audit",
            isDE ? "Cookie-Consent Generator" : "Cookie consent generator",
            isDE ? "Verarbeitungsverzeichnis" : "Processing directory",
          ],
          status: "coming-soon",
        },
        {
          icon: FileText,
          title: isDE ? "Vertrags-Generator" : "Contract Generator",
          features: [
            isDE ? "AGB-Vorlagen" : "Terms & conditions templates",
            isDE ? "Lieferantenverträge" : "Supplier contracts",
            isDE ? "NDA-Vorlagen" : "NDA templates",
          ],
          status: "coming-soon",
        },
        {
          icon: ShieldCheck,
          title: isDE ? "CE & Produktsicherheit" : "CE & Product Safety",
          features: [
            isDE ? "Prüfpflicht-Checker" : "Testing obligation checker",
            isDE ? "Kennzeichnungshilfe" : "Labeling assistant",
            isDE ? "Rückruf-Protokolle" : "Recall protocols",
          ],
          status: "coming-soon",
        },
      ],
    },
    // Phase 8 — October
    {
      label: { de: "Phase 8", en: "Phase 8" },
      month: {
        de: "Oktober — Multi-Channel & Marktplatz-Integration",
        en: "October — Multi-Channel & Marketplace Integration",
      },
      subtitle: {
        de: "Verkaufe überall — von einer Plattform aus",
        en: "Sell everywhere — from one platform",
      },
      dotStyle: "border",
      items: [
        {
          icon: Store,
          title: isDE ? "Marktplatz-Connector" : "Marketplace Connector",
          features: [
            isDE ? "Amazon FBA Kalkulator" : "Amazon FBA calculator",
            isDE ? "Etsy-Gebührenanalyse" : "Etsy fee analysis",
            isDE ? "Shopify-Kosten-Vergleich" : "Shopify cost comparison",
          ],
          status: "coming-soon",
        },
        {
          icon: RefreshCcw,
          title: isDE ? "Omnichannel-Sync" : "Omnichannel Sync",
          features: [
            isDE ? "Bestands-Synchronisierung" : "Inventory synchronization",
            isDE ? "Preis-Harmonisierung" : "Price harmonization",
            isDE ? "Zentrales Order-Management" : "Central order management",
          ],
          status: "coming-soon",
        },
        {
          icon: TrendingUp,
          title: isDE ? "Kanal-Performance" : "Channel Performance",
          features: [
            isDE ? "Umsatz pro Kanal" : "Revenue per channel",
            isDE ? "Margen-Vergleich" : "Margin comparison",
            isDE ? "Optimierungsvorschläge" : "Optimization suggestions",
          ],
          status: "coming-soon",
        },
      ],
    },
    // Phase 9 — November
    {
      label: { de: "Phase 9", en: "Phase 9" },
      month: {
        de: "November — Investor Readiness & Funding",
        en: "November — Investor Readiness & Funding",
      },
      subtitle: {
        de: "Bereit für Investoren — mit Daten, nicht Bauchgefühl",
        en: "Investor-ready — with data, not gut feeling",
      },
      dotStyle: "solid",
      items: [
        {
          icon: DollarSign,
          title: isDE ? "Pitch Deck Generator" : "Pitch Deck Generator",
          features: [
            isDE ? "Datengetriebene Folien" : "Data-driven slides",
            isDE ? "Finanzmodell-Export" : "Financial model export",
            isDE ? "Investor-Story Framework" : "Investor story framework",
          ],
          status: "coming-soon",
        },
        {
          icon: Target,
          title: isDE ? "Funding-Readiness Score" : "Funding Readiness Score",
          features: [
            isDE ? "Bewertungs-Checkliste" : "Valuation checklist",
            isDE ? "KPI-Benchmark vs. Funded Startups" : "KPI benchmark vs funded startups",
            isDE ? "Schwachstellen-Analyse" : "Weakness analysis",
          ],
          status: "coming-soon",
        },
        {
          icon: Mail,
          title: isDE ? "Investor CRM (Light)" : "Investor CRM (Light)",
          features: [
            isDE ? "Kontakt-Tracking" : "Contact tracking",
            isDE ? "Follow-up Erinnerungen" : "Follow-up reminders",
            isDE ? "Pipeline-Übersicht" : "Pipeline overview",
          ],
          status: "coming-soon",
        },
      ],
    },
    // Phase 10 — December
    {
      label: { de: "Phase 10", en: "Phase 10" },
      month: {
        de: "Dezember — Skalierung & Enterprise Features",
        en: "December — Scaling & Enterprise Features",
      },
      subtitle: {
        de: "Von der Marke zum skalierbaren Unternehmen",
        en: "From brand to scalable business",
      },
      dotStyle: "border",
      items: [
        {
          icon: Cpu,
          title: isDE ? "API & Integrationen" : "API & Integrations",
          features: [
            isDE ? "REST API für externe Tools" : "REST API for external tools",
            isDE ? "Zapier-Integration" : "Zapier integration",
            isDE ? "Webhook-System" : "Webhook system",
          ],
          status: "coming-soon",
        },
        {
          icon: Users,
          title: isDE ? "Team-Kollaboration" : "Team Collaboration",
          features: [
            isDE ? "Multi-User Zugang" : "Multi-user access",
            isDE ? "Rollen & Berechtigungen" : "Roles & permissions",
            isDE ? "Aktivitäts-Feed" : "Activity feed",
          ],
          status: "coming-soon",
        },
        {
          icon: Lock,
          title: isDE ? "Enterprise Security" : "Enterprise Security",
          features: [
            isDE ? "SSO-Integration" : "SSO integration",
            isDE ? "Erweiterte Audit-Logs" : "Extended audit logs",
            isDE ? "IP-Whitelisting" : "IP whitelisting",
            isDE ? "Datenresidenz-Optionen" : "Data residency options",
          ],
          status: "coming-soon",
        },
        {
          icon: Puzzle,
          title: isDE ? "White-Label Option" : "White-Label Option",
          features: [
            isDE ? "Custom Branding" : "Custom branding",
            isDE ? "Eigene Domain" : "Custom domain",
            isDE ? "Partner-Dashboard" : "Partner dashboard",
          ],
          status: "coming-soon",
        },
      ],
    },
  ];
}

export interface HighlightModule {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  status: Status;
  quarter: string;
  description: string;
  features: { icon: React.ComponentType<{ className?: string }>; label: string }[];
  cta: string;
}

export function getHighlightModule(isDE: boolean): HighlightModule {
  return {
    icon: Zap,
    title: "Revenue Activation Mode",
    status: "released",
    quarter: "Q2 2025",
    description: isDE
      ? "Ein strukturiertes System, das Gründern beibringt, ihr Produkt in Umsatz zu verwandeln — nicht durch generische Marketing-Theorie, sondern durch kapitalgesteuerte Execution."
      : "A structured system that teaches founders how to turn their product into revenue — not through generic marketing theory, but through capital-aware execution.",
    features: [
      { icon: Target, label: isDE ? "Break-even Ad-Budgetierung" : "Break-even based ad budgeting" },
      { icon: TrendingUp, label: isDE ? "Angebots-Positionierungs-Engine" : "Offer positioning engine" },
      { icon: DollarSign, label: isDE ? "Preispsychologie-Ebene" : "Price psychology layer" },
      { icon: Rocket, label: isDE ? "Pre-Order Strategie-Framework" : "Pre-order strategy framework" },
      { icon: BarChart3, label: isDE ? "CAC vs LTV Verständnis" : "CAC vs LTV understanding" },
      { icon: Flame, label: isDE ? "Launch-Test-Roadmap" : "Launch testing roadmap" },
    ],
    cta: isDE ? "Execution-Mitglieder erhalten Early Access" : "Execution Members get early access",
  };
}
