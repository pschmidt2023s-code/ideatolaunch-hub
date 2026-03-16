import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useTranslation } from "react-i18next";
import { JOURNEY_PHASES } from "@/lib/journey-phases";
import {
  LayoutDashboard, Map, Brain, Users, Settings, LogOut,
  ChevronDown, ChevronRight, Globe as GlobeIcon, Terminal,
  Folder, Check,
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
  const { activeBrand, brands, setActiveBrandId } = useBrand();
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

  // Mini progress for sidebar
  const totalPhases = 5;
  const completedPhases = Math.min(currentStep - 1, totalPhases);
  const pct = Math.round((completedPhases / totalPhases) * 100);

  return (
    <aside className="flex h-screen w-[240px] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-12 items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        <button onClick={() => handleNav("/dashboard")} className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <Terminal className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="text-[13px] font-bold tracking-wide font-mono">BRAND<span className="text-accent">OS</span></span>
        </button>
        <ThemeToggle />
      </div>

      {/* Brand selector mini */}
      {activeBrand && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-[11px] font-bold font-mono text-sidebar-accent-foreground">
              {activeBrand.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate text-sidebar-accent-foreground">{activeBrand.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex-1 h-1 rounded-full bg-sidebar-accent overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground tabular-nums">{pct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin">
        {/* Dashboard */}
        <NavItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" active={isActive("/dashboard")} onClick={handleNav} />

        {/* Journey section */}
        <div className="pt-2">
          <button
            onClick={() => setJourneyOpen(!journeyOpen)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-all duration-100",
              isJourneyActive ? "text-accent bg-accent/5" : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
            )}
          >
            <Map className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Journey</span>
            <span className="text-[9px] font-mono text-muted-foreground/60 mr-1">{completedPhases}/{totalPhases}</span>
            {journeyOpen ? <ChevronDown className="h-3 w-3 opacity-40" /> : <ChevronRight className="h-3 w-3 opacity-40" />}
          </button>
          {journeyOpen && (
            <div className="mt-1 ml-3 space-y-0.5 border-l-2 border-sidebar-border pl-3">
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
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-all duration-100 group",
                      isActive(phasePath)
                        ? "bg-accent/10 text-accent font-medium"
                        : isDone
                        ? "text-success/80 hover:text-success hover:bg-sidebar-accent"
                        : isActivePhase
                        ? "text-sidebar-accent-foreground font-medium hover:bg-sidebar-accent"
                        : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-3 w-3 shrink-0 text-success" />
                    ) : (
                      <PhaseIcon className="h-3 w-3 shrink-0" />
                    )}
                    <span className="truncate">{phase.title}</span>
                    {isActivePhase && !isDone && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="pt-1">
          <NavItem icon={Folder} label="Projects" path="/dashboard/command" active={isActive("/dashboard/command")} onClick={handleNav} />
        </div>

        {/* Intelligence */}
        <NavItem icon={Brain} label="Intelligence" path="/dashboard/intelligence" active={isActive("/dashboard/intelligence")} onClick={handleNav} />

        {/* Community */}
        <NavItem icon={Users} label="Community" path="/dashboard/community" active={isActive("/dashboard/community")} onClick={handleNav} />
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2.5 space-y-0.5">
        <NavItem icon={Settings} label={t("dashboard.settings")} path="/dashboard/settings" active={isActive("/dashboard/settings")} onClick={handleNav} />
        <button
          onClick={toggleLang}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          <GlobeIcon className="h-4 w-4" />
          {i18n.language === "de" ? "English" : "Deutsch"}
        </button>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
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
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] transition-all duration-100",
        active
          ? "bg-accent/10 text-accent font-medium"
          : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
    </button>
  );
}
