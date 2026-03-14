import {
  BarChart3,
  Rocket,
  Zap,
  TrendingUp,
  Target,
  DollarSign,
  Flame,
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
  Megaphone,
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
    // Phase 1 — May (updated with new ambitious features)
    {
      label: { de: "Phase 1", en: "Phase 1" },
      month: {
        de: "Mai — AI Copilot & Entscheidungs-Intelligenz",
        en: "May — AI Copilot & Decision Intelligence",
      },
      subtitle: {
        de: "Dein persönlicher Gründer-Assistent auf Steroiden",
        en: "Your personal founder assistant on steroids",
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
          icon: Wand2,
          title: isDE ? "AI Markenname-Generator" : "AI Brand Name Generator",
          features: [
            isDE ? "Domainverfügbarkeits-Check" : "Domain availability check",
            isDE ? "Tonalitäts-Matching" : "Tonality matching",
            isDE ? "Trademark-Risiko-Bewertung" : "Trademark risk assessment",
            isDE ? "Multi-Sprach-Scoring" : "Multi-language scoring",
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
    // Phase 2 — June (updated with new features)
    {
      label: { de: "Phase 2", en: "Phase 2" },
      month: {
        de: "Juni — Community, Gamification & Netzwerk",
        en: "June — Community, Gamification & Network",
      },
      subtitle: {
        de: "Gemeinsam wachsen — mit Daten und Accountability",
        en: "Grow together — with data and accountability",
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
          title: isDE ? "Gamification & XP-System" : "Gamification & XP System",
          features: [
            isDE ? "XP-basiertes Ranking" : "XP-based ranking",
            isDE ? "8 Achievement-Kategorien" : "8 achievement categories",
            isDE ? "Gründer-Level (Starter → Legend)" : "Founder levels (Starter → Legend)",
            isDE ? "Konfetti-Animationen bei Meilensteinen" : "Confetti animations on milestones",
          ],
          status: "released",
        },
        {
          icon: BookOpen,
          title: isDE ? "Startup Logs & Case Studies" : "Startup Logs & Case Studies",
          features: [
            isDE ? "Öffentliches Gründer-Tagebuch" : "Public founder diary",
            isDE ? "Follower-System" : "Follower system",
            isDE ? "Verifizierte Lieferanten-Reviews" : "Verified supplier reviews",
          ],
          status: "released",
        },
        {
          icon: Compass,
          title: isDE ? "Trend-Radar & Intelligenz-Feed" : "Trend Radar & Intelligence Feed",
          features: [
            isDE ? "Markttrend-Erkennung" : "Market trend detection",
            isDE ? "Nischen-Signale" : "Niche signals",
            isDE ? "Community-Insights Aggregation" : "Community insights aggregation",
          ],
          status: "released",
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
    status: "in-progress",
    quarter: "Q3 2025",
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
    cta: isDE ? "Pro & Execution-Mitglieder erhalten Beta-Zugang" : "Pro & Execution Members get beta access",
  };
}
