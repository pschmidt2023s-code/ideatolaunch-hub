import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, [string, string]> = {
  "/dashboard": ["Dashboard", "Dashboard"],
  "/dashboard/command": ["Command Center", "Command Center"],
  "/dashboard/intelligence": ["Intelligence", "Intelligence"],
  "/dashboard/settings": ["Einstellungen", "Settings"],
  "/dashboard/pricing": ["Pricing", "Pricing"],
  "/dashboard/referrals": ["Empfehlungen", "Referrals"],
  "/dashboard/recovery": ["Recovery Mode", "Recovery Mode"],
  "/dashboard/execution": ["Execution OS", "Execution OS"],
  "/dashboard/revenue": ["Revenue Activation", "Revenue Activation"],
  "/dashboard/evolution": ["Product Evolution", "Product Evolution"],
  "/dashboard/failure-simulator": ["Failure Simulator", "Failure Simulator"],
  "/dashboard/benchmark": ["Market Benchmark", "Market Benchmark"],
};

export function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const path = location.pathname;

  // Build crumb chain
  const crumbs: { label: string; path?: string }[] = [
    { label: "Dashboard", path: "/dashboard" },
  ];

  // Step pages
  const stepMatch = path.match(/\/dashboard\/step\/(\d+)/);
  if (stepMatch) {
    const step = parseInt(stepMatch[1]);
    crumbs.push({ label: t(`steps.p${step}`) });
  } else if (path !== "/dashboard") {
    const labels = ROUTE_LABELS[path];
    if (labels) {
      crumbs.push({ label: isDE ? labels[0] : labels[1] });
    }
  }

  // Don't show breadcrumb on dashboard root
  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm mb-6" aria-label="Breadcrumb">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </button>
      {crumbs.slice(1).map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          {crumb.path ? (
            <button
              onClick={() => navigate(crumb.path!)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
