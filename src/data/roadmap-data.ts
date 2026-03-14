import {
  BarChart3,
  Rocket,
  TrendingUp,
  Target,
  DollarSign,
  Brain,
  Globe,
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
  Store,
  BookOpen,
  Puzzle,
  Star,
  Shield,
  ShieldCheck,
  Cpu,
  Mail,
  Wand2,
  Search,
  Lightbulb,
  GitBranch,
  Eye,
  Compass,
  HeartHandshake,
  Boxes,
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
}

export function getRoadmapSections(isDE: boolean): RoadmapSection[] {
  return [
    // Phase 1 — May
    {
      label: { de: "Phase 1", en: "Phase 1" },
      month: {
        de: "Mai — AI Copilot 3.0 & Entscheidungs-Intelligenz",
        en: "May — AI Copilot 3.0 & Decision Intelligence",
      },
      subtitle: {
        de: "Nächste Generation intelligenter Gründer-Assistenz",
        en: "Next generation intelligent founder assistance",
      },
      dotStyle: "solid",
      items: [
        {
          icon: Brain,
          title: isDE ? "AI Copilot 3.0 — Deep Reasoning" : "AI Copilot 3.0 — Deep Reasoning",
          features: [
            isDE ? "Multi-Step Strategieplanung" : "Multi-step strategy planning",
            isDE ? "Wettbewerbs-Gegenanalyse" : "Competitive counter-analysis",
            isDE ? "Automatische Szenario-Generierung" : "Auto scenario generation",
            isDE ? "Kontextgedächtnis über Sessions" : "Context memory across sessions",
          ],
          status: "in-progress",
        },
        {
          icon: Wand2,
          title: isDE ? "Produkt-DNA Analyzer" : "Product DNA Analyzer",
          features: [
            isDE ? "Marktfit-Score Berechnung" : "Market-fit score calculation",
            isDE ? "Preis-Elastizitäts-Modell" : "Price elasticity model",
            isDE ? "Differenzierungs-Matrix" : "Differentiation matrix",
            isDE ? "Kategorie-Benchmark" : "Category benchmark",
          ],
          status: "in-progress",
        },
        {
          icon: Sparkles,
          title: isDE ? "Predictive Alerts Engine" : "Predictive Alerts Engine",
          features: [
            isDE ? "Cashflow-Vorhersage (30/60/90 Tage)" : "Cashflow prediction (30/60/90 days)",
            isDE ? "Lieferketten-Risiko-Frühwarnung" : "Supply chain risk early warning",
            isDE ? "Saisonale Nachfrage-Prognose" : "Seasonal demand forecast",
          ],
          status: "in-progress",
        },
        {
          icon: MessageSquare,
          title: isDE ? "Voice-to-Strategy Modus" : "Voice-to-Strategy Mode",
          features: [
            isDE ? "Spracheingabe für Geschäftsideen" : "Voice input for business ideas",
            isDE ? "AI-generierte Strategiekarten" : "AI-generated strategy maps",
            isDE ? "Sofortige Machbarkeitsanalyse" : "Instant feasibility analysis",
          ],
          status: "in-progress",
        },
      ],
    },
    // Phase 2 — June
    {
      label: { de: "Phase 2", en: "Phase 2" },
      month: {
        de: "Juni — Marktplatz-Intelligence & Growth Hacking",
        en: "June — Marketplace Intelligence & Growth Hacking",
      },
      subtitle: {
        de: "Datengestützte Wachstumsstrategien für jeden Kanal",
        en: "Data-driven growth strategies for every channel",
      },
      dotStyle: "border",
      items: [
        {
          icon: Search,
          title: isDE ? "Nischen-Scanner 2.0" : "Niche Scanner 2.0",
          features: [
            isDE ? "Echtzeit-Nachfrage-Analyse" : "Real-time demand analysis",
            isDE ? "Gewinnmargen-Heatmap" : "Profit margin heatmap",
            isDE ? "Sättigungs-Index pro Kategorie" : "Saturation index per category",
          ],
          status: "in-progress",
        },
        {
          icon: Star,
          title: isDE ? "Growth Experiment Lab" : "Growth Experiment Lab",
          features: [
            isDE ? "A/B-Test Frameworks" : "A/B test frameworks",
            isDE ? "Conversion-Funnel Analyse" : "Conversion funnel analysis",
            isDE ? "ROI-Tracker pro Experiment" : "ROI tracker per experiment",
            isDE ? "Erfolgs-Playbooks" : "Success playbooks",
          ],
          status: "in-progress",
        },
        {
          icon: BookOpen,
          title: isDE ? "Gründer-Wissensbasis" : "Founder Knowledge Base",
          features: [
            isDE ? "Interaktive Lernpfade" : "Interactive learning paths",
            isDE ? "Branchen-spezifische Guides" : "Industry-specific guides",
            isDE ? "Experten-Interviews & Podcasts" : "Expert interviews & podcasts",
          ],
          status: "in-progress",
        },
        {
          icon: Compass,
          title: isDE ? "Wettbewerbs-Radar" : "Competitor Radar",
          features: [
            isDE ? "Automatische Konkurrenz-Erkennung" : "Auto competitor detection",
            isDE ? "Preis-Monitoring" : "Price monitoring",
            isDE ? "Strategie-Vergleichsmatrix" : "Strategy comparison matrix",
          ],
          status: "in-progress",
        },
      ],
    },
    // Phase 3 — July
    {
      label: { de: "Phase 3", en: "Phase 3" },
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
          status: "in-progress",
        },
        {
          icon: Layers,
          title: isDE ? "Template-Bibliothek" : "Template Library",
          features: [
            isDE ? "Branchen-spezifische Vorlagen" : "Industry-specific templates",
            isDE ? "One-Click Anpassung" : "One-click customization",
            isDE ? "A/B-Test Varianten" : "A/B test variants",
          ],
          status: "coming-soon",
        },
        {
          icon: FileText,
          title: isDE ? "SEO & Meta-Optimierung" : "SEO & Meta Optimization",
          features: [
            isDE ? "Auto Meta-Tags" : "Auto meta tags",
            isDE ? "Schema.org Markup" : "Schema.org markup",
            isDE ? "Open Graph Vorschau" : "Open Graph preview",
          ],
          status: "coming-soon",
        },
      ],
    },
    // Phase 4 — August
    {
      label: { de: "Phase 4", en: "Phase 4" },
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
          status: "coming-soon",
        },
        {
          icon: PieChart,
          title: isDE ? "Kohortenanalyse" : "Cohort Analysis",
          features: [
            isDE ? "Kunden-Retention Kurven" : "Customer retention curves",
            isDE ? "LTV-Projektion" : "LTV projection",
            isDE ? "Segment-Vergleiche" : "Segment comparisons",
          ],
          status: "coming-soon",
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
          status: "coming-soon",
        },
      ],
    },
    // Phase 5 — September
    {
      label: { de: "Phase 5", en: "Phase 5" },
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
    // Phase 6 — October
    {
      label: { de: "Phase 6", en: "Phase 6" },
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
    // Phase 7 — November
    {
      label: { de: "Phase 7", en: "Phase 7" },
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
    // Phase 8 — December
    {
      label: { de: "Phase 8", en: "Phase 8" },
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
    icon: Boxes,
    title: isDE ? "Founder Operating System" : "Founder Operating System",
    status: "coming-soon",
    quarter: "Q3 2026",
    description: isDE
      ? "Das komplette Betriebssystem für Gründer — alle Tools, Daten und Insights an einem Ort. Vereint Strategie, Execution und Wachstum in einem einzigen, intelligenten Workspace."
      : "The complete operating system for founders — all tools, data, and insights in one place. Unifying strategy, execution, and growth in a single intelligent workspace.",
    features: [
      { icon: GitBranch, label: isDE ? "Entscheidungsbaum-Engine" : "Decision tree engine" },
      { icon: Eye, label: isDE ? "360° Marken-Übersicht" : "360° brand overview" },
      { icon: Workflow, label: isDE ? "Adaptive Workflow-Automation" : "Adaptive workflow automation" },
      { icon: Lightbulb, label: isDE ? "Prädiktive Empfehlungen" : "Predictive recommendations" },
      { icon: HeartHandshake, label: isDE ? "Mentor-Matching System" : "Mentor matching system" },
      { icon: Search, label: isDE ? "Globale Markt-Suchmaschine" : "Global market search engine" },
    ],
    cta: isDE ? "Kommt bald für Pro & Execution-Mitglieder" : "Coming soon for Pro & Execution Members",
  };
}
