import { ReactNode, useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { TopBar } from "./TopBar";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { PageTransition } from "./PageTransition";
import { ChangelogDialog, useChangelog } from "./ChangelogDialog";
import { Menu, Terminal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/hooks/useMode";
import { usePrefetchDashboard } from "@/hooks/useQueryDefaults";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { NotificationBell } from "./NotificationBell";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { needsSelection } = useMode();
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const prefetch = usePrefetchDashboard(user?.id);
  const changelog = useChangelog();

  useKeyboardShortcuts();

  useEffect(() => { prefetch(); }, [prefetch]);
  useEffect(() => { if (needsSelection) setModeDialogOpen(true); }, [needsSelection]);

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
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-[240px] animate-slide-in-left">
            <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop top bar */}
        <div className="hidden lg:block">
          <TopBar />
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 lg:hidden pt-safe">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground active:bg-muted transition-colors min-w-[36px] min-h-[36px] press-scale"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
              <Terminal className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <span className="text-xs font-bold font-mono tracking-wide">BRAND<span className="text-accent">OS</span></span>
          </div>
          <NotificationBell />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scroll-ios">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>

      <ModeSwitcher open={modeDialogOpen} onOpenChange={setModeDialogOpen} isInitial={needsSelection} />
      <ChangelogDialog open={changelog.open} onOpenChange={changelog.setOpen} />
    </div>
  );
}
