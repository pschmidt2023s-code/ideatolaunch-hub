// ─── Investor Mode Engine ──────────────────────────────────
import type { RiskLevel, StatusMetrics, MoneySummary, RiskItem, ExecutionAction, ScenarioMode } from "./command-center-types";

// ── Sub-asset types ────────────────────────────────────────
export interface CryptoAsset {
  id: string;
  name: string;
  allocation: number; // percentage of total portfolio
  volatility: "low" | "medium" | "high" | "extreme";
}

export interface EquityAsset {
  id: string;
  name: string;
  allocation: number;
  type: "etf" | "single_stock" | "index_fund";
}

export interface BondAsset {
  id: string;
  name: string;
  allocation: number;
  duration: "short" | "medium" | "long";
}

export interface RealEstateAsset {
  id: string;
  name: string;
  allocation: number;
  type: "reit" | "direct" | "crowdfunding";
}

export interface InvestorInput {
  totalPortfolio: number;
  cashPosition: number;
  // Aggregated (auto-calculated from sub-assets)
  equityExposure: number;
  bondExposure: number;
  cryptoExposure: number;
  realEstateExposure: number;
  // Sub-assets
  cryptoAssets: CryptoAsset[];
  equityAssets: EquityAsset[];
  bondAssets: BondAsset[];
  realEstateAssets: RealEstateAsset[];
  // Performance
  annualReturn: number;
  portfolioDrawdown: number;
  concentrationRisk: number;
  dividendYield: number;
}

const DEFAULT_CRYPTO: CryptoAsset[] = [
  { id: "btc", name: "Bitcoin (BTC)", allocation: 5, volatility: "high" },
  { id: "eth", name: "Ethereum (ETH)", allocation: 3, volatility: "high" },
  { id: "sol", name: "Solana (SOL)", allocation: 2, volatility: "extreme" },
];

const DEFAULT_EQUITY: EquityAsset[] = [
  { id: "msci", name: "MSCI World ETF", allocation: 30, type: "etf" },
  { id: "sp500", name: "S&P 500 ETF", allocation: 15, type: "etf" },
  { id: "single", name: "Einzelaktien", allocation: 5, type: "single_stock" },
];

const DEFAULT_BONDS: BondAsset[] = [
  { id: "gov", name: "Staatsanleihen", allocation: 12, type: "etf" as any, duration: "medium" },
  { id: "corp", name: "Unternehmensanleihen", allocation: 8, type: "etf" as any, duration: "short" },
];

const DEFAULT_RE: RealEstateAsset[] = [
  { id: "reit1", name: "REIT ETF", allocation: 10, type: "reit" },
];

const DEFAULT_INVESTOR: InvestorInput = {
  totalPortfolio: 50000,
  cashPosition: 10,
  equityExposure: 50,
  bondExposure: 20,
  cryptoExposure: 10,
  realEstateExposure: 10,
  cryptoAssets: DEFAULT_CRYPTO,
  equityAssets: DEFAULT_EQUITY,
  bondAssets: DEFAULT_BONDS,
  realEstateAssets: DEFAULT_RE,
  annualReturn: 8,
  portfolioDrawdown: 5,
  concentrationRisk: 30,
  dividendYield: 2.5,
};

export function getInvestorDefaults(): InvestorInput {
  return JSON.parse(JSON.stringify(DEFAULT_INVESTOR));
}

/** Recalculate aggregated exposures from sub-assets */
export function recalcAllocations(input: InvestorInput): InvestorInput {
  const crypto = input.cryptoAssets.reduce((s, a) => s + a.allocation, 0);
  const equity = input.equityAssets.reduce((s, a) => s + a.allocation, 0);
  const bonds = input.bondAssets.reduce((s, a) => s + a.allocation, 0);
  const re = input.realEstateAssets.reduce((s, a) => s + a.allocation, 0);
  return {
    ...input,
    cryptoExposure: crypto,
    equityExposure: equity,
    bondExposure: bonds,
    realEstateExposure: re,
  };
}

/** Calculate concentration risk from sub-assets automatically */
export function autoConcentrationRisk(input: InvestorInput): number {
  const allAssets = [
    ...input.cryptoAssets.map(a => a.allocation),
    ...input.equityAssets.map(a => a.allocation),
    ...input.bondAssets.map(a => a.allocation),
    ...input.realEstateAssets.map(a => a.allocation),
    input.cashPosition,
  ].filter(a => a > 0);
  if (allAssets.length <= 1) return 100;
  const max = Math.max(...allAssets);
  const total = allAssets.reduce((s, v) => s + v, 0);
  // Herfindahl-style: higher = more concentrated
  const hhi = allAssets.reduce((s, v) => s + Math.pow(v / total, 2), 0);
  return Math.min(100, Math.round(hhi * 100 * allAssets.length / 2 + max * 0.5));
}

export function calculatePortfolioRisk(input: InvestorInput): number {
  let score = 100;

  // Concentration risk
  if (input.concentrationRisk > 60) score -= 25;
  else if (input.concentrationRisk > 40) score -= 10;

  // Crypto volatility penalty (weighted by extreme assets)
  const extremeCrypto = input.cryptoAssets.filter(a => a.volatility === "extreme").reduce((s, a) => s + a.allocation, 0);
  const highCrypto = input.cryptoAssets.filter(a => a.volatility === "high").reduce((s, a) => s + a.allocation, 0);
  if (extremeCrypto > 5) score -= 15;
  if (highCrypto > 20) score -= 10;
  if (input.cryptoExposure > 30) score -= 20;
  else if (input.cryptoExposure > 15) score -= 8;

  // Single stock risk
  const singleStocks = input.equityAssets.filter(a => a.type === "single_stock").reduce((s, a) => s + a.allocation, 0);
  if (singleStocks > 20) score -= 15;

  // Low cash buffer
  if (input.cashPosition < 5) score -= 15;
  else if (input.cashPosition < 10) score -= 5;

  // Drawdown
  if (input.portfolioDrawdown > 20) score -= 20;
  else if (input.portfolioDrawdown > 10) score -= 10;

  // Negative returns
  if (input.annualReturn < 0) score -= 15;

  return Math.max(0, Math.min(100, score));
}

export function buildInvestorStatus(input: InvestorInput, mode: ScenarioMode): StatusMetrics {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.2, realistic: 1, "worst-case": 0.7 };
  const riskScore = calculatePortfolioRisk(input);
  const effectiveReturn = input.annualReturn * mods[mode];
  const monthlyGrowth = (input.totalPortfolio * effectiveReturn / 100) / 12;

  return {
    founderRiskIndex: riskScore,
    confidenceScore: Math.round(100 - input.concentrationRisk * 0.6 - input.portfolioDrawdown),
    riskLevel: riskScore > 70 ? "low" : riskScore >= 40 ? "medium" : "high",
    runwayMonths: effectiveReturn > 0 ? 24 : Math.max(1, Math.round(input.totalPortfolio / Math.abs(monthlyGrowth || 1))),
    breakEvenDate: effectiveReturn > 0 ? "Wachsend" : "–",
    capitalPressure: Math.round(input.portfolioDrawdown * 2.5 + (100 - input.cashPosition)),
    lastUpdated: "Live",
  };
}

export function buildInvestorMoney(input: InvestorInput, mode: ScenarioMode): MoneySummary {
  const mods: Record<ScenarioMode, number> = { optimistic: 1.2, realistic: 1, "worst-case": 0.7 };
  const effectiveReturn = input.annualReturn * mods[mode];
  const monthlyReturn = Math.round((input.totalPortfolio * effectiveReturn / 100) / 12);
  const monthlyDividend = Math.round((input.totalPortfolio * input.dividendYield / 100) / 12);

  return {
    margin: Math.round(effectiveReturn * 10) / 10,
    breakEvenUnits: 0,
    cashflowMonthly: monthlyReturn + monthlyDividend,
    totalCapital: input.totalPortfolio,
    capitalUsed: Math.round(input.totalPortfolio * (1 - input.cashPosition / 100)),
    capitalDelta: monthlyReturn,
  };
}

export function buildInvestorRisks(input: InvestorInput): RiskItem[] {
  const risks: RiskItem[] = [];

  if (input.concentrationRisk > 40) {
    risks.push({ id: "concentration", title: `Klumpenrisiko ${input.concentrationRisk}%`, impact: Math.round(input.totalPortfolio * 0.15), level: input.concentrationRisk > 60 ? "high" : "medium" });
  }

  // Individual extreme crypto assets
  input.cryptoAssets.filter(a => a.volatility === "extreme" && a.allocation > 3).forEach(a => {
    risks.push({ id: `crypto_${a.id}`, title: `${a.name} extrem volatil (${a.allocation}%)`, impact: Math.round(input.totalPortfolio * a.allocation / 100 * 0.6), level: "high" });
  });

  if (input.cryptoExposure > 20) {
    risks.push({ id: "crypto", title: `Crypto-Exposure ${input.cryptoExposure}%`, impact: Math.round(input.totalPortfolio * input.cryptoExposure / 100 * 0.5), level: "high" });
  }

  const singleStocks = input.equityAssets.filter(a => a.type === "single_stock").reduce((s, a) => s + a.allocation, 0);
  if (singleStocks > 15) {
    risks.push({ id: "single_stock", title: `Einzelaktien-Risiko ${singleStocks}%`, impact: Math.round(input.totalPortfolio * singleStocks / 100 * 0.3), level: "medium" });
  }

  if (input.cashPosition < 10) {
    risks.push({ id: "cash", title: `Niedrige Cash-Reserve ${input.cashPosition}%`, impact: Math.round(input.totalPortfolio * 0.05), level: "medium" });
  }
  if (input.portfolioDrawdown > 10) {
    risks.push({ id: "drawdown", title: `Drawdown ${input.portfolioDrawdown}%`, impact: Math.round(input.totalPortfolio * input.portfolioDrawdown / 100), level: "high" });
  }

  return risks.sort((a, b) => b.impact - a.impact).slice(0, 4);
}

export function buildInvestorActions(input: InvestorInput): ExecutionAction[] {
  const actions: ExecutionAction[] = [];

  if (input.concentrationRisk > 50) actions.push({ id: "diversify", label: "Portfolio diversifizieren", priority: "critical", blocker: "Klumpenrisiko" });
  if (input.cashPosition < 5) actions.push({ id: "cash", label: "Cash-Reserve aufbauen", priority: "critical" });

  const extremeCrypto = input.cryptoAssets.filter(a => a.volatility === "extreme" && a.allocation > 5);
  if (extremeCrypto.length > 0) actions.push({ id: "crypto_extreme", label: `${extremeCrypto[0].name} Position reduzieren`, priority: "high" });
  else if (input.cryptoExposure > 25) actions.push({ id: "crypto", label: "Crypto-Position reduzieren", priority: "high" });

  if (input.dividendYield < 2) actions.push({ id: "yield", label: "Dividenden-Assets prüfen", priority: "medium" });

  return actions.slice(0, 3);
}
