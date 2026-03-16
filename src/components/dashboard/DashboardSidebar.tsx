import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useTranslation } from "react-i18next";
import { JOURNEY_PHASES } from "@/lib/journey-phases";
import {
  LayoutDashboard, Map, Brain, Users, Settings, LogOut,
  ChevronDown, ChevronRight, Globe as GlobeIcon, Terminal,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { activeBrand } = useBrand();
  const { t, i18n } = useTranslation();
  const [journeyOpen, setJourneyOpen] = useState(true);
  const currentStep = activeBrand?.current_step ?? 1;

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
  const isJourneyActive = location.pathname.startsWith("/dashboard/journey");

  return (
    <aside className="flex h-screen w-[220px] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-11 items-center justify-between px-3 border-b border-sidebar-border shrink-0">
        <button onClick={() => handleNav("/dashboard")} className="flex items-center gap-2 group">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/90">
            <Terminal className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
          <span className="text-xs font-bold tracking-wide font-mono">BRAND<span className="text-accent">OS</span></span>
        </button>
        <ThemeToggle />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin">
        {/* Dashboard */}
        <div className="space-y-0.5">
          <NavItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" active={isActive("/dashboard")} onClick={handleNav} />
        </div>

        {/* Journey */}
        <div>
          <button
            onClick={() => setJourneyOpen(!journeyOpen)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
              isJourneyActive ? "text-accent" : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
            )}
          >
            <Map className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">Journey</span>
            {journeyOpen ? <ChevronDown className="h-3 w-3 opacity-50" /> : <ChevronRight className="h-3 w-3 opacity-50" />}
          </button>
          {journeyOpen && (
            <div className="mt-0.5 ml-2 space-y-0.5 border-l border-sidebar-border pl-2">
              {JOURNEY_PHASES.map((phase) => {
                const isDone = phase.phase < currentStep;
                const isActivePhase = phase.phase === Math.min(currentStep, 5);
                const phasePath = `/dashboard/journey/${phase.phase}`;
                const PhaseIcon = phase.icon;

                return (
                  <button
                    key={phase.phase}
                    onClick={() => handleNav(phasePath)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors",
                      isActive(phasePath)
                        ? "bg-accent/10 text-accent font-medium"
                        : isDone
                        ? "text-success/70 hover:text-success hover:bg-sidebar-accent"
                        : isActivePhase
                        ? "text-sidebar-foreground font-medium hover:bg-sidebar-accent"
                        : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <PhaseIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{phase.title}</span>
                    {isDone && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-success shrink-0" />}
                    {isActivePhase && !isDone && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Intelligence */}
        <div className="space-y-0.5">
          <NavItem icon={Brain} label="Intelligence" path="/dashboard/intelligence" active={isActive("/dashboard/intelligence")} onClick={handleNav} />
        </div>

        {/* Community */}
        <div className="space-y-0.5">
          <NavItem icon={Users} label="Community" path="/dashboard/community" active={isActive("/dashboard/community")} onClick={handleNav} />
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

function NavItem({ icon: Icon, label, path, active, onClick }: {
  icon: React.ElementType; label: string; path: string; active: boolean; onClick: (path: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(path)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-all duration-75",
        active
          ? "bg-accent/10 text-accent font-medium"
          : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
      {active && <div className="ml-auto h-1 w-1 rounded-full bg-accent" />}
    </button>
  );
}
