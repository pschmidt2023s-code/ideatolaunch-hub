import { ReactNode, useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { TopBar } from "./TopBar";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { CopilotChatWidget } from "./CopilotChatWidget";
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
        <div className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
              <span className="text-[10px] font-bold text-background">B</span>
            </div>
            <span className="text-sm font-semibold">BrandOS</span>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Copilot Chat Widget */}
      <CopilotChatWidget />

      {/* Mode selection dialog */}
      <ModeSwitcher
        open={modeDialogOpen}
        onOpenChange={setModeDialogOpen}
        isInitial={needsSelection}
      />
    </div>
  );
}
