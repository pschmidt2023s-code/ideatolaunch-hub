import { ReactNode, useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { TopBar } from "./TopBar";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { PageTransition } from "./PageTransition";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/hooks/useMode";
import { usePrefetchDashboard } from "@/hooks/useQueryDefaults";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { needsSelection } = useMode();
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const prefetch = usePrefetchDashboard(user?.id);

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
            className="absolute inset-0 bg-foreground/10 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-[240px] animate-slide-in-left">
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
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 lg:hidden pt-safe">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground active:bg-muted transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
              <span className="text-[11px] font-bold text-background">B</span>
            </div>
            <span className="text-sm font-semibold">BrandOS</span>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
    </div>
  );
}
