import { ReactNode, useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Breadcrumb } from "./Breadcrumb";
import { Footer } from "@/components/landing/Footer";
import { ModeSwitcher } from "@/components/ModeSwitcher";
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
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-64 animate-slide-in-left">
            <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">B</span>
            </div>
            <span className="font-semibold tracking-tight">BrandOS</span>
          </div>
        </div>

        <div className="content-container py-8 lg:py-10">
          <Breadcrumb />
          {children}
        </div>

        <Footer />
      </main>
    </div>
  );
}