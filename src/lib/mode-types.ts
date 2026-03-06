// ─── BrandOS 4.0 Mode System Types ──────────────────────────
export type AppMode = "founder" | "trading" | "investor" | "strategy";

export interface ModeConfig {
  key: AppMode;
  label: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind class
}

export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  founder: {
    key: "founder",
    label: "Founder Mode",
    description: "Für Produkt-Gründer: Marke aufbauen, Risiko managen, launchen.",
    icon: "Rocket",
    color: "text-accent",
  },
  trading: {
    key: "trading",
    label: "Trading Mode",
    description: "Für Trader: Risk per Trade, Winrate, Drawdown, Survival.",
    icon: "TrendingUp",
    color: "text-chart-1",
  },
  investor: {
    key: "investor",
    label: "Investor Mode",
    description: "Für Investoren: Portfolio Risk, Allocation, Capital Growth.",
    icon: "PieChart",
    color: "text-chart-2",
  },
  strategy: {
    key: "strategy",
    label: "Strategy Mode",
    description: "Für Entscheider: Decision Impact, Risk-Profit Analyse.",
    icon: "Brain",
    color: "text-chart-3",
  },
};

export const ALL_MODES: AppMode[] = ["founder", "trading", "investor", "strategy"];
