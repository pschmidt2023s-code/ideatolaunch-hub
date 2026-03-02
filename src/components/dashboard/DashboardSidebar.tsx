import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Globe, Sparkles, HeartPulse, Crown, Map, Zap } from "lucide-react";
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
  Gift,
} from "lucide-react";

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === "de" ? "en" : "de";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const navItems = [
    { icon: LayoutDashboard, label: t("dashboard.title"), path: "/dashboard" },
    { icon: Brain, label: t("insights.title"), path: "/dashboard/insights" },
    // ── 5 Phases ──
    { icon: Target, label: t("steps.p1"), path: "/dashboard/step/1", group: "phases" },
    { icon: Calculator, label: t("steps.p2"), path: "/dashboard/step/2", group: "phases" },
    { icon: Factory, label: t("steps.p3"), path: "/dashboard/step/3", group: "phases" },
    { icon: Shield, label: t("steps.p4"), path: "/dashboard/step/4", group: "phases" },
    { icon: Rocket, label: t("steps.p5"), path: "/dashboard/step/5", group: "phases" },
    // ── Extras ──
    { icon: Gift, label: "Empfehlungen", path: "/dashboard/referrals" },
    { icon: Sparkles, label: "Intelligence Suite", path: "/dashboard/intelligence" },
    { icon: HeartPulse, label: "Recovery Mode", path: "/dashboard/recovery" },
    { icon: Crown, label: "Execution OS", path: "/dashboard/execution" },
    { icon: Zap, label: "Revenue Activation", path: "/dashboard/revenue" },
    { icon: Map, label: "Product Evolution", path: "/dashboard/evolution" },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
          <span className="text-sm font-bold text-sidebar-primary-foreground">B</span>
        </div>
        <span className="text-lg font-semibold text-sidebar-accent-foreground">BrandOS</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path, group }, i) => {
          const isActive = location.pathname === path;
          const isFirstPhase = group === "phases" && (i === 0 || navItems[i - 1]?.group !== "phases");
          return (
            <div key={path}>
              {isFirstPhase && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {i18n.language === "de" ? "Founder Journey" : "Founder Journey"}
                </p>
              )}
              <button
                onClick={() => handleNav(path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                } ${i === 1 ? "mb-2" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <button
          onClick={toggleLang}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Globe className="h-4 w-4" />
          {i18n.language === "de" ? "English" : "Deutsch"}
        </button>
        <button
          onClick={() => handleNav("/dashboard/settings")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          {t("dashboard.settings")}
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
