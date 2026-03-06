// ─── Signal & Forecast Engine ──────────────────────────────
// Deterministic buy/sell signals and portfolio forecasts.
// IMPORTANT: This is NOT financial advice – purely educational simulation.

import type { CryptoAsset, InvestorInput } from "./investor-engine";
import type { TradingInput } from "./trading-engine";

export type SignalType = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";

export interface AssetSignal {
  assetId: string;
  assetName: string;
  signal: SignalType;
  reason: string;
  confidence: number; // 0-100
  targetAction: string;
}

export interface ForecastPoint {
  month: number;
  label: string;
  value: number;
  optimistic: number;
  pessimistic: number;
}

export interface PortfolioForecast {
  points: ForecastPoint[];
  targetDate: string;
  targetValue: number;
  probability: number;
  monthsToTarget: number;
}

export interface TradingForecast {
  points: ForecastPoint[];
  monthlyTarget: number;
  yearlyProjection: number;
  breakEvenMonth: number | null;
  riskOfRuin: number;
}

// ── Investor Signals ───────────────────────────────────────

export function generateCryptoSignals(input: InvestorInput): AssetSignal[] {
  return input.cryptoAssets.map((asset) => {
    let signal: SignalType = "hold";
    let reason = "";
    let confidence = 50;
    let targetAction = "";

    // Overexposure → sell signal
    if (asset.allocation > 15) {
      signal = "sell";
      reason = `Übergewichtet mit ${asset.allocation}%. Reduzierung empfohlen um Klumpenrisiko zu senken.`;
      confidence = 75;
      targetAction = `Position auf max. 10% reduzieren (${Math.round(input.totalPortfolio * 0.10)}€)`;
    } else if (asset.allocation > 10 && asset.volatility === "extreme") {
      signal = "sell";
      reason = `Extreme Volatilität bei ${asset.allocation}% Allocation. Hohes Verlustpotential.`;
      confidence = 70;
      targetAction = `Auf ${Math.max(3, asset.allocation - 5)}% reduzieren`;
    }
    // Underexposure in low-vol → buy signal
    else if (asset.allocation < 3 && asset.volatility !== "extreme") {
      signal = "buy";
      reason = `Niedrige Allocation bei moderater Volatilität. Diversifikationspotential.`;
      confidence = 55;
      targetAction = `Position auf 5% erhöhen (${Math.round(input.totalPortfolio * 0.05)}€)`;
    }
    // Balanced
    else if (asset.allocation >= 3 && asset.allocation <= 10) {
      signal = "hold";
      reason = `Allocation im gesunden Bereich. Halten und regelmäßig rebalancen.`;
      confidence = 65;
      targetAction = "Quartals-Rebalancing einplanen";
    }

    // Cash cushion check
    if (input.cashPosition < 5 && signal === "buy") {
      signal = "hold";
      reason = `Cash-Reserve zu niedrig (${input.cashPosition}%). Erst Cash aufbauen, dann investieren.`;
      confidence = 80;
      targetAction = `Cash auf min. 10% erhöhen vor Neuinvestments`;
    }

    // High drawdown → defensive
    if (input.portfolioDrawdown > 15 && signal === "hold") {
      signal = "sell";
      reason = `Portfolio im Drawdown (${input.portfolioDrawdown}%). Risikopositionen reduzieren.`;
      confidence = 70;
      targetAction = `Volatile Assets um 20-30% reduzieren`;
    }

    return { assetId: asset.id, assetName: asset.name, signal, reason, confidence, targetAction };
  });
}

export function generateEquitySignals(input: InvestorInput): AssetSignal[] {
  return input.equityAssets.map((asset) => {
    let signal: SignalType = "hold";
    let reason = "";
    let confidence = 50;
    let targetAction = "";

    if (asset.type === "single_stock" && asset.allocation > 15) {
      signal = "sell";
      reason = `Einzelaktie mit ${asset.allocation}% – zu hohes Einzelrisiko.`;
      confidence = 75;
      targetAction = `Teilverkauf und in ETF umschichten`;
    } else if (asset.type === "etf" && asset.allocation < 10 && input.equityExposure < 40) {
      signal = "buy";
      reason = `Aktienquote niedrig. Breit gestreuter ETF bietet Wachstumspotential.`;
      confidence = 60;
      targetAction = `ETF-Position auf 15-20% aufstocken`;
    } else {
      signal = "hold";
      reason = `Position im Rahmen. Regelmäßiges Rebalancing beibehalten.`;
      confidence = 60;
      targetAction = "Nächstes Rebalancing-Datum setzen";
    }

    return { assetId: asset.id, assetName: asset.name, signal, reason, confidence, targetAction };
  });
}

// ── Portfolio Forecast ─────────────────────────────────────

export function buildPortfolioForecast(input: InvestorInput, targetValue?: number): PortfolioForecast {
  const months = 24;
  const monthlyReturn = input.annualReturn / 100 / 12;
  const monthlyDiv = input.dividendYield / 100 / 12;
  const volatility = (input.cryptoExposure * 0.03 + input.equityExposure * 0.015 + input.bondExposure * 0.005 + input.realEstateExposure * 0.01) / 100;

  const points: ForecastPoint[] = [];
  let base = input.totalPortfolio;
  let optimistic = input.totalPortfolio;
  let pessimistic = input.totalPortfolio;

  const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const now = new Date();

  for (let m = 0; m <= months; m++) {
    const date = new Date(now.getFullYear(), now.getMonth() + m, 1);
    points.push({
      month: m,
      label: `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`,
      value: Math.round(base),
      optimistic: Math.round(optimistic),
      pessimistic: Math.round(pessimistic),
    });
    base *= (1 + monthlyReturn + monthlyDiv);
    optimistic *= (1 + monthlyReturn * 1.3 + monthlyDiv);
    pessimistic *= (1 + monthlyReturn * 0.5 - volatility + monthlyDiv);
  }

  const target = targetValue || input.totalPortfolio * 1.5;
  const monthsToTarget = monthlyReturn > 0 ? Math.ceil(Math.log(target / input.totalPortfolio) / Math.log(1 + monthlyReturn + monthlyDiv)) : 999;
  const probability = Math.min(95, Math.max(10, Math.round(70 - input.portfolioDrawdown * 1.5 + (input.annualReturn > 0 ? 20 : -20) - input.concentrationRisk * 0.3)));

  return {
    points,
    targetDate: monthsToTarget < 120 ? `~${monthsToTarget} Monate` : "Nicht absehbar",
    targetValue: target,
    probability,
    monthsToTarget,
  };
}

// ── Trading Forecast ───────────────────────────────────────

export function buildTradingForecast(input: TradingInput): TradingForecast {
  const wr = input.winrate / 100;
  const netWin = input.avgWin - input.commissionPerTrade - input.slippageAvg;
  const netLoss = input.avgLoss + input.commissionPerTrade + input.slippageAvg;
  const expectancy = wr * netWin - (1 - wr) * netLoss;
  const monthlyPnL = expectancy * input.tradesPerMonth;
  const months = 12;

  const points: ForecastPoint[] = [];
  let base = input.accountBalance;
  let optimistic = input.accountBalance;
  let pessimistic = input.accountBalance;

  const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const now = new Date();

  for (let m = 0; m <= months; m++) {
    const date = new Date(now.getFullYear(), now.getMonth() + m, 1);
    points.push({
      month: m,
      label: `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`,
      value: Math.round(base),
      optimistic: Math.round(optimistic),
      pessimistic: Math.round(pessimistic),
    });
    base += monthlyPnL;
    optimistic += monthlyPnL * 1.3;
    pessimistic += monthlyPnL * 0.5;
  }

  // Risk of ruin simplified
  const riskPct = input.riskPerTrade / 100;
  const maxConsLosses = Math.floor(1 / riskPct);
  const blowUpProb = Math.pow(1 - wr, maxConsLosses);
  const riskOfRuin = Math.min(100, Math.round(blowUpProb * 100 * 10)); // over ~10x periods

  return {
    points,
    monthlyTarget: Math.round(monthlyPnL),
    yearlyProjection: Math.round(monthlyPnL * 12),
    breakEvenMonth: monthlyPnL > 0 && input.currentDrawdown > 0
      ? Math.ceil((input.accountBalance * input.currentDrawdown / 100) / monthlyPnL)
      : null,
    riskOfRuin,
  };
}

// ── Signal Styling ─────────────────────────────────────────

export const SIGNAL_CONFIG: Record<SignalType, { label: string; color: string; bg: string }> = {
  strong_buy: { label: "STRONG BUY", color: "text-success", bg: "bg-success/10" },
  buy: { label: "BUY", color: "text-success", bg: "bg-success/5" },
  hold: { label: "HOLD", color: "text-muted-foreground", bg: "bg-muted" },
  sell: { label: "SELL", color: "text-warning", bg: "bg-warning/10" },
  strong_sell: { label: "STRONG SELL", color: "text-destructive", bg: "bg-destructive/10" },
};
