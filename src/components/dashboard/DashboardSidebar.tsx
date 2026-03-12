import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/hooks/useMode";
import { useTranslation } from "react-i18next";
import type { AppMode } from "@/lib/mode-types";
import {
  Crosshair, Brain, BarChart3, Wrench, Globe as GlobeIcon, Rocket, Settings, LogOut,
  ChevronDown, ChevronRight, TrendingUp, PieChart, Sparkles, Gift, HeartPulse, Crown,
  Zap, Map, Target, Shield, Wallet, Activity, Scale, Users, Telescope, Terminal,
} from "lucide-react";
import { ModeBadge } from "@/components/ModeSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const MODE_NAV: Record<AppMode, { icon: React.ElementType; label: string; path: string }[]> = {
  founder: [
    { icon: Crosshair, label: "Command Center", path: "/dashboard/command" },
    { icon: Brain, label: "Intelligence", path: "/dashboard/intelligence" },
    { icon: BarChart3, label: "Simulations", path: "/dashboard/failure-simulator" },
    { icon: Sparkles, label: "Website Builder", path: "/dashboard/website-builder" },
    { icon: Wrench, label: "Builder Tools", path: "/dashboard" },
  ],
  trading: [
    { icon: Crosshair, label: "Command Center", path: "/dashboard/command" },
    { icon: Wallet, label: "Accounts", path: "/dashboard/accounts" },
    { icon: TrendingUp, label: "Trading Dashboard", path: "/dashboard/trading" },
    { icon: Activity, label: "Trading Intelligence", path: "/trading-intelligence" },
    { icon: Shield, label: "Risk Analysis", path: "/risk-analysis" },
    { icon: BarChart3, label: "Risk Simulator", path: "/dashboard/failure-simulator" },
    { icon: Brain, label: "Intelligence", path: "/dashboard/intelligence" },
  ],
  investor: [
    { icon: Crosshair, label: "Command Center", path: "/dashboard/command" },
    { icon: PieChart, label: "Portfolio Dashboard", path: "/dashboard/investor" },
    { icon: BarChart3, label: "Risk Simulator", path: "/dashboard/failure-simulator" },
    { icon: Brain, label: "Intelligence", path: "/dashboard/intelligence" },
  ],
  strategy: [
    { icon: Crosshair, label: "Command Center", path: "/dashboard/command" },
    { icon: Brain, label: "Strategy Dashboard", path: "/dashboard/strategy" },
    { icon: BarChart3, label: "Simulations", path: "/dashboard/failure-simulator" },
    { icon: Scale, label: "Intelligence", path: "/dashboard/intelligence" },
  ],
};

const FOUNDER_JOURNEY = [1, 2, 3, 4, 5];

const EXTRAS = [
  { icon: Users, label: "Community", path: "/dashboard/community" },
  { icon: Telescope, label: "Wettbewerber", path: "/dashboard/competitors" },
  { icon: Gift, label: "Empfehlungen", path: "/dashboard/referrals" },
  { icon: HeartPulse, label: "Recovery Mode", path: "/dashboard/recovery" },
  { icon: Crown, label: "Execution OS", path: "/dashboard/execution" },
  { icon: Zap, label: "Revenue", path: "/dashboard/revenue" },
  { icon: Map, label: "Evolution", path: "/dashboard/evolution" },
  { icon: Target, label: "Benchmark", path: "/dashboard/benchmark" },
];

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { mode } = useMode();
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
  const navItems = MODE_NAV[mode] ?? MODE_NAV.founder;
  const isFounder = mode === "founder";

  return (
    <aside className="flex h-screen w-[220px] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo – system style */}
      <div className="flex h-11 items-center justify-between px-3 border-b border-sidebar-border shrink-0">
        <button onClick={() => handleNav("/dashboard")} className="flex items-center gap-2 group">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/90">
            <Terminal className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
          <span className="text-xs font-bold tracking-wide font-mono">BRAND<span className="text-accent">OS</span></span>
        </button>
        <ThemeToggle />
      </div>

      {/* Mode Badge */}
      <div className="px-2.5 pt-2.5 pb-1">
        <ModeBadge />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1.5 space-y-3 scrollbar-thin">
        {/* Mode-specific main nav */}
        <NavGroup label={mode === "founder" ? "FOUNDER" : mode === "trading" ? "TRADING" : mode === "investor" ? "INVESTOR" : "STRATEGY"}>
          {navItems.map(({ icon, label, path }) => (
            <NavItem key={path} icon={icon} label={label} path={path} active={isActive(path)} onClick={handleNav} />
          ))}
        </NavGroup>

        {/* Founder Journey */}
        {isFounder && (
          <NavGroup label="JOURNEY">
            {FOUNDER_JOURNEY.map((n) => (
              <NavItem
                key={n}
                icon={Rocket}
                label={t(`steps.p${n}`)}
                path={`/dashboard/step/${n}`}
                active={isActive(`/dashboard/step/${n}`)}
                onClick={handleNav}
                compact
              />
            ))}
          </NavGroup>
        )}

        {/* Cross-mode */}
        {!isFounder && (
          <NavGroup label="SWITCH">
            {mode !== "trading" && <NavItem icon={TrendingUp} label="Trading" path="/dashboard/trading" active={isActive("/dashboard/trading")} onClick={handleNav} />}
            {mode !== "investor" && <NavItem icon={PieChart} label="Investor" path="/dashboard/investor" active={isActive("/dashboard/investor")} onClick={handleNav} />}
            {mode !== "strategy" && <NavItem icon={Brain} label="Strategy" path="/dashboard/strategy" active={isActive("/dashboard/strategy")} onClick={handleNav} />}
            <NavItem icon={Rocket} label="Founder" path="/dashboard" active={isActive("/dashboard")} onClick={handleNav} />
          </NavGroup>
        )}

        {/* More */}
        <div>
          <button
            onClick={() => setExtrasOpen(!extrasOpen)}
            className="flex w-full items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.12em] hover:text-muted-foreground transition-colors"
          >
            {extrasOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
            MORE
          </button>
          {extrasOpen && (
            <div className="space-y-0.5 mt-0.5">
              {EXTRAS.map(({ icon, label, path }) => (
                <NavItem key={path} icon={icon} label={label} path={path} active={isActive(path)} onClick={handleNav} />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <NavItem icon={Settings} label={t("dashboard.settings")} path="/dashboard/settings" active={isActive("/dashboard/settings")} onClick={handleNav} />
        <button
          onClick={toggleLang}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          <GlobeIcon className="h-3.5 w-3.5" />
          {i18n.language === "de" ? "EN" : "DE"}
        </button>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t("dashboard.logout")}
        </button>
      </div>
    </aside>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="px-2 pb-0.5 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.12em]">{label}</p>
      {children}
    </div>
  );
}

function NavItem({ icon: Icon, label, path, active, onClick, compact }: {
  icon: React.ElementType; label: string; path: string; active: boolean; onClick: (path: string) => void; compact?: boolean;
}) {
  return (
    <button
      onClick={() => onClick(path)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 transition-all duration-75",
        compact ? "py-1 text-[11px]" : "py-1.5 text-[12px]",
        active
          ? "bg-accent/10 text-accent font-medium"
          : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon className={cn("shrink-0", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span className="truncate">{label}</span>
      {active && <div className="ml-auto h-1 w-1 rounded-full bg-accent" />}
    </button>
  );
}
