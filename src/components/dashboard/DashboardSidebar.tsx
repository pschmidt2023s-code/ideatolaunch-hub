import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Lightbulb,
  Palette,
  Calculator,
  Factory,
  Shield,
  ShoppingBag,
  Rocket,
  LogOut,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Lightbulb, label: "Ideen-Fundament", path: "/dashboard/step/1" },
  { icon: Palette, label: "Markenstruktur", path: "/dashboard/step/2" },
  { icon: Calculator, label: "Business-Kalkulator", path: "/dashboard/step/3" },
  { icon: Factory, label: "Produktion", path: "/dashboard/step/4" },
  { icon: Shield, label: "Compliance", path: "/dashboard/step/5" },
  { icon: ShoppingBag, label: "Vertrieb", path: "/dashboard/step/6" },
  { icon: Rocket, label: "Launch-Roadmap", path: "/dashboard/step/7" },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
          <span className="text-sm font-bold text-sidebar-primary-foreground">B</span>
        </div>
        <span className="text-lg font-semibold text-sidebar-accent-foreground">BrandOS</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <button
          onClick={() => navigate("/dashboard/settings")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Einstellungen
        </button>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
