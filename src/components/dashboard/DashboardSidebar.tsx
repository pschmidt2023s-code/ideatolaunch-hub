import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  LayoutDashboard,
  Target,
  Calculator,
  Factory,
  Shield,
  Rocket,
  LogOut,
  Settings,
  Brain,
  Crosshair,
  Sparkles,
  Gift,
  HeartPulse,
  Crown,
  Zap,
  Map,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [extrasOpen, setExtrasOpen] = useState(false);

  const toggleLang = () => {
    const next = i18n.language === "de" ? "en" : "de";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const isActive = (path: string) => location.pathname === path;

  const phases = [
    { icon: Target, label: t("steps.p1"), path: "/dashboard/step/1" },
    { icon: Calculator, label: t("steps.p2"), path: "/dashboard/step/2" },
    { icon: Factory, label: t("steps.p3"), path: "/dashboard/step/3" },
    { icon: Shield, label: t("steps.p4"), path: "/dashboard/step/4" },
    { icon: Rocket, label: t("steps.p5"), path: "/dashboard/step/5" },
  ];

  const extras = [
    { icon: Sparkles, label: "Website Builder", path: "/dashboard/website-builder" },
    { icon: Gift, label: "Empfehlungen", path: "/dashboard/referrals" },
    { icon: HeartPulse, label: "Recovery Mode", path: "/dashboard/recovery" },
    { icon: Crown, label: "Execution OS", path: "/dashboard/execution" },
    { icon: Zap, label: "Revenue Activation", path: "/dashboard/revenue" },
    { icon: Map, label: "Product Evolution", path: "/dashboard/evolution" },
    { icon: Target, label: "Failure Simulator", path: "/dashboard/failure-simulator" },
    { icon: Brain, label: "Market Benchmark", path: "/dashboard/benchmark" },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col overflow-hidden bg-sidebar text-sidebar-foreground border-r border-sidebar-border relative grain">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shadow-glow-accent">
          <span className="text-sm font-bold text-sidebar-primary-foreground">B</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-sidebar-accent-foreground font-display">BrandOS</span>
      </div>

      {/* Search */}
      <div className="px-3 pt-4 pb-2">
        <CommandPalette />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {/* 4 Main Items */}
        <NavBtn icon={Crosshair} label="Command Center" path="/dashboard/command" active={isActive("/dashboard/command")} onClick={handleNav} />
        <NavBtn icon={LayoutDashboard} label={t("dashboard.title")} path="/dashboard" active={isActive("/dashboard")} onClick={handleNav} />
        <NavBtn icon={Sparkles} label="Intelligence" path="/dashboard/intelligence" active={isActive("/dashboard/intelligence")} onClick={handleNav} />

        {/* Founder Journey */}
        <p className="px-3 pt-5 pb-1.5 section-label">
          Founder Journey
        </p>
        {phases.map(({ icon: Icon, label, path }) => (
          <NavBtn key={path} icon={Icon} label={label} path={path} active={isActive(path)} onClick={handleNav} />
        ))}

        {/* Extras (collapsible) */}
        <button
          onClick={() => setExtrasOpen(!extrasOpen)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-sidebar-accent-foreground transition-colors mt-3"
        >
          {extrasOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          Extras
        </button>
        {extrasOpen && extras.map(({ icon: Icon, label, path }) => (
          <NavBtn key={path} icon={Icon} label={label} path={path} active={isActive(path)} onClick={handleNav} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <NavBtn icon={Settings} label={t("dashboard.settings")} path="/dashboard/settings" active={isActive("/dashboard/settings")} onClick={handleNav} />
        <button
          onClick={toggleLang}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Globe className="h-4 w-4" />
          {i18n.language === "de" ? "English" : "Deutsch"}
        </button>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t("dashboard.logout")}
        </button>
      </div>
    </aside>
  );
}

function NavBtn({ icon: Icon, label, path, active, onClick }: {
  icon: React.ElementType;
  label: string;
  path: string;
  active: boolean;
  onClick: (path: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(path)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
