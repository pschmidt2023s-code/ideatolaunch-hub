import { ReactNode, useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { TopBar } from "./TopBar";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { PageTransition } from "./PageTransition";
import { ChangelogDialog, useChangelog } from "./ChangelogDialog";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/hooks/useMode";
import { usePrefetchDashboard } from "@/hooks/useQueryDefaults";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { needsSelection } = useMode();
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const prefetch = usePrefetchDashboard(user?.id);
  const changelog = useChangelog();

  // Global keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    prefetch();
  }, [prefetch]);

  useEffect(() => {
    if (needsSelection) setModeDialogOpen(true);
  }, [needsSelection]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-[220px] animate-slide-in-left">
            <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="hidden lg:block">
          <TopBar />
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-10 items-center gap-2 border-b border-border bg-background px-3 lg:hidden pt-safe">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded p-1.5 text-muted-foreground hover:text-foreground active:bg-muted transition-colors min-w-[36px] min-h-[36px] press-scale"
            aria-label="Menü öffnen"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-xs font-bold font-mono tracking-wide">BRAND<span className="text-accent">OS</span></span>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scroll-ios">
          <div className="mx-auto max-w-content px-3 sm:px-5 lg:px-6 py-4 lg:py-6">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Mode selection dialog */}
      <ModeSwitcher
        open={modeDialogOpen}
        onOpenChange={setModeDialogOpen}
        isInitial={needsSelection}
      />

      {/* Changelog / What's New */}
      <ChangelogDialog open={changelog.open} onOpenChange={changelog.setOpen} />
    </div>
  );
}
