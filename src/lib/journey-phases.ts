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
  color: string; // tailwind token
  icon: React.ElementType;
  modules: JourneyModule[];
}

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    phase: 1,
    title: "Idea Validation",
    subtitle: "Validate before you invest",
    description: "Test and validate your business idea before spending money. Analyze market potential, competitors and risks to determine if your idea is worth pursuing.",
    goal: "Determine if your idea is worth pursuing.",
    color: "info",
    icon: Lightbulb,
    modules: [
      { id: "idea-analyzer", title: "Idea Analyzer", description: "Evaluate your business idea with AI-powered analysis", icon: Lightbulb, href: "/dashboard/step/1" },
      { id: "market-research", title: "Market Research", description: "Deep dive into market size, trends and opportunities", icon: Search, href: "/dashboard/intelligence" },
      { id: "trend-radar", title: "Trend Radar", description: "Discover emerging trends in your niche", icon: TrendingUp, href: "/dashboard/intelligence" },
      { id: "competitor-overview", title: "Competitor Overview", description: "Analyze your competition's strengths and weaknesses", icon: Users, href: "/dashboard/competitors" },
      { id: "risk-analysis", title: "Founder Risk Analysis", description: "Assess your personal and business risk profile", icon: ShieldAlert, href: "/dashboard/failure-simulator" },
    ],
  },
  {
    phase: 2,
    title: "Brand Creation",
    subtitle: "Build a strong foundation",
    description: "Create a compelling brand that stands out. From naming to positioning, build every element of your brand identity with guided tools.",
    goal: "Create a clear and strong brand concept.",
    color: "accent",
    icon: Palette,
    modules: [
      { id: "brand-name", title: "Brand Name Generator", description: "AI-powered brand name creation and validation", icon: Type, href: "/dashboard/intelligence" },
      { id: "brand-positioning", title: "Brand Positioning", description: "Define your unique market position", icon: Target, href: "/dashboard/step/1" },
      { id: "target-audience", title: "Target Audience Builder", description: "Build detailed customer personas", icon: Users, href: "/dashboard/step/1" },
      { id: "brand-story", title: "Brand Story Generator", description: "Craft a compelling brand narrative", icon: BookOpen, href: "/dashboard/intelligence" },
      { id: "brand-identity", title: "Brand Identity Planner", description: "Visual identity, tone and brand values", icon: Fingerprint, href: "/dashboard/step/1" },
    ],
  },
  {
    phase: 3,
    title: "Product Development",
    subtitle: "Build something profitable",
    description: "Plan and develop your product with realistic cost calculations. Find suppliers, calculate margins and ensure your product is profitable before production.",
    goal: "Ensure the product is profitable and realistic.",
    color: "warning",
    icon: Factory,
    modules: [
      { id: "supplier-intel", title: "Supplier Intelligence", description: "Find and evaluate verified suppliers worldwide", icon: Factory, href: "/dashboard/step/3" },
      { id: "moq-calc", title: "MOQ Calculator", description: "Calculate minimum order quantities and costs", icon: Calculator, href: "/tools/moq-rechner" },
      { id: "production-cost", title: "Production Cost Calculator", description: "Full production cost breakdown and analysis", icon: DollarSign, href: "/tools/produktionskosten-rechner" },
      { id: "margin-calc", title: "Margin Calculator", description: "Calculate margins and break-even points", icon: PieChart, href: "/tools/break-even-rechner" },
      { id: "packaging", title: "Packaging Planner", description: "Design packaging strategy and cost planning", icon: Package, href: "/dashboard/step/3" },
    ],
  },
  {
    phase: 4,
    title: "Launch System",
    subtitle: "Go live with confidence",
    description: "Prepare everything for a professional launch. Build your website, plan your marketing strategy and create a launch funnel that converts.",
    goal: "Launch a professional brand.",
    color: "success",
    icon: Rocket,
    modules: [
      { id: "website-creator", title: "Website Creator", description: "AI-powered website builder for your brand", icon: Globe, href: "/dashboard/website-builder" },
      { id: "launch-strategy", title: "Launch Strategy Planner", description: "Step-by-step launch roadmap", icon: Rocket, href: "/dashboard/step/5" },
      { id: "marketing", title: "Marketing Strategy", description: "Channel strategy, budget allocation and tactics", icon: Megaphone, href: "/dashboard/step/4" },
      { id: "content-plan", title: "Content Planning", description: "Content calendar and creation workflow", icon: FileText, href: "/dashboard/step/5" },
      { id: "compliance", title: "Compliance Check", description: "Legal requirements and regulatory compliance", icon: ShieldAlert, href: "/dashboard/compliance" },
    ],
  },
  {
    phase: 5,
    title: "Scale & Optimize",
    subtitle: "Grow your brand",
    description: "Scale your business with data-driven decisions. Track performance, optimize operations and explore growth opportunities.",
    goal: "Help founders grow their brand.",
    color: "primary",
    icon: BarChart3,
    modules: [
      { id: "analytics", title: "Business Analytics", description: "Live KPIs, metrics and performance tracking", icon: BarChart3, href: "/dashboard/intelligence" },
      { id: "growth-engine", title: "Growth Engine", description: "Automated growth strategies and experiments", icon: Zap, href: "/dashboard/execution" },
      { id: "strategy-intel", title: "Strategy Intelligence", description: "AI-powered strategic recommendations", icon: Brain, href: "/dashboard/intelligence" },
      { id: "revenue", title: "Revenue Optimization", description: "Pricing, upselling and revenue growth tools", icon: DollarSign, href: "/dashboard/revenue" },
      { id: "investor", title: "Investor Insights", description: "Investor-ready reports and valuations", icon: Briefcase, href: "/dashboard/investor" },
    ],
  },
];
