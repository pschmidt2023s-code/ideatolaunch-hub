import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Link2, Unlink, RefreshCw, Shield, Wallet, TrendingUp, TrendingDown,
  AlertTriangle, Activity, PieChart, BarChart3, Eye, Loader2, Plus, Trash2
} from "lucide-react";

interface TradingAccount {
  id: string;
  exchange: string;
  label: string;
  status: string;
  last_synced_at: string | null;
  account_data: Record<string, unknown>;
  balances: Array<{ asset: string; free: number; locked: number }>;
  positions: Array<{
    symbol: string; side: string; size: number; entryPrice: number;
    markPrice: number; leverage: number; unrealizedPnl: number; marginType: string;
  }>;
  risk_metrics: Record<string, unknown>;
}

const EXCHANGES = [
  { id: "binance", name: "Binance", color: "hsl(var(--chart-1))" },
  { id: "bybit", name: "Bybit", color: "hsl(var(--chart-2))" },
  { id: "okx", name: "OKX", color: "hsl(var(--chart-3))" },
  { id: "kraken", name: "Kraken", color: "hsl(var(--chart-4))" },
];

export default function Accounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [form, setForm] = useState({ exchange: "", apiKey: "", apiSecret: "", label: "" });

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("trading_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    setAccounts((data as unknown as TradingAccount[]) || []);
    setLoading(false);
  };

  const connectAccount = async () => {
    if (!form.exchange || !form.apiKey || !form.apiSecret) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("exchange-sync", {
        body: { action: "connect", exchange: form.exchange, apiKey: form.apiKey, apiSecret: form.apiSecret, label: form.label },
      });
      if (error) throw error;
      toast.success("Exchange verbunden!");
      setConnectOpen(false);
      setForm({ exchange: "", apiKey: "", apiSecret: "", label: "" });
      fetchAccounts();
    } catch (e: unknown) {
      toast.error("Verbindung fehlgeschlagen");
    } finally {
      setConnecting(false);
    }
  };

  const syncAccount = async (id: string) => {
    setSyncing(id);
    try {
      await supabase.functions.invoke("exchange-sync", { body: { action: "sync", accountId: id } });
      toast.success("Account synchronisiert");
      fetchAccounts();
    } catch { toast.error("Sync fehlgeschlagen"); }
    finally { setSyncing(null); }
  };

  const disconnectAccount = async (id: string) => {
    try {
      await supabase.functions.invoke("exchange-sync", { body: { action: "disconnect", accountId: id } });
      toast.success("Exchange getrennt");
      fetchAccounts();
    } catch { toast.error("Trennung fehlgeschlagen"); }
  };

  // Aggregated portfolio
  const totalEquity = accounts.reduce((s, a) => s + ((a.account_data as Record<string, number>)?.totalEquity || 0), 0);
  const totalPnl = accounts.reduce((s, a) => s + ((a.account_data as Record<string, number>)?.totalPnl || 0), 0);
  const allPositions = accounts.flatMap((a) => a.positions || []);
  const allBalances = accounts.flatMap((a) => a.balances || []);

  // Exposure calculation
  const exposureMap: Record<string, number> = {};
  accounts.forEach((account) => {
    const prices = ((account.account_data as Record<string, any>)?.prices ?? {}) as Record<string, number>;
    (account.balances || []).forEach((b) => {
      const amount = (b.free || 0) + (b.locked || 0);
      const quotePrice = ["USDT", "USD", "EUR"].includes(b.asset) ? 1 : Number(prices[b.asset] ?? 0);
      if (amount <= 0 || quotePrice <= 0) return;
      const eurVal = amount * quotePrice;
      exposureMap[b.asset] = (exposureMap[b.asset] || 0) + eurVal;
    });
  });
  const totalExposure = Object.values(exposureMap).reduce((s, v) => s + v, 0);

  // Risk aggregation
  const avgRiskScore = accounts.length
    ? accounts.reduce((s, a) => s + ((a.risk_metrics as Record<string, number>)?.riskScore || 0), 0) / accounts.length
    : 0;
  const avgSurvival = accounts.length
    ? accounts.reduce((s, a) => s + ((a.risk_metrics as Record<string, number>)?.survivalProbability || 0), 0) / accounts.length
    : 0;
  const avgDiscipline = accounts.length
    ? accounts.reduce((s, a) => s + ((a.risk_metrics as Record<string, number>)?.disciplineScore || 0), 0) / accounts.length
    : 0;
  const maxDrawdown = accounts.length
    ? Math.max(...accounts.map((a) => (a.risk_metrics as Record<string, number>)?.maxDrawdownRisk || 0))
    : 0;

  const riskColor = (v: number, inv = false) => {
    const val = inv ? 100 - v : v;
    if (val < 30) return "text-emerald-500";
    if (val < 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trading Accounts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verbinde deine Exchanges — Read-Only Analyse
            </p>
          </div>
          <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Exchange verbinden</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exchange verbinden</DialogTitle>
                <DialogDescription>
                  Verbinde deinen Account mit einem READ-ONLY API Key. BrandOS führt keine Trades aus.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Shield className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Nutze ausschließlich READ-ONLY API Keys. Keine Trade- oder Withdrawal-Berechtigungen.
                  </p>
                </div>
                <div>
                  <Label>Exchange</Label>
                  <Select value={form.exchange} onValueChange={(v) => setForm({ ...form, exchange: v })}>
                    <SelectTrigger><SelectValue placeholder="Exchange wählen" /></SelectTrigger>
                    <SelectContent>
                      {EXCHANGES.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Label (optional)</Label>
                  <Input placeholder="z.B. Main Account" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                </div>
                <div>
                  <Label>API Key</Label>
                  <Input placeholder="API Key eingeben" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} type="password" />
                </div>
                <div>
                  <Label>API Secret</Label>
                  <Input placeholder="API Secret eingeben" value={form.apiSecret} onChange={(e) => setForm({ ...form, apiSecret: e.target.value })} type="password" />
                </div>
                <Button className="w-full" onClick={connectAccount} disabled={connecting}>
                  {connecting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verbinde...</> : <><Link2 className="h-4 w-4 mr-2" />Verbinden</>}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : accounts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold">Keine Accounts verbunden</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Verbinde deinen ersten Exchange-Account um dein Portfolio und Risiko automatisch analysieren zu lassen.
              </p>
              <Button className="mt-6" onClick={() => setConnectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />Ersten Account verbinden
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="portfolio" className="space-y-4">
            <TabsList>
              <TabsTrigger value="portfolio"><PieChart className="h-4 w-4 mr-1.5" />Portfolio</TabsTrigger>
              <TabsTrigger value="positions"><BarChart3 className="h-4 w-4 mr-1.5" />Positions</TabsTrigger>
              <TabsTrigger value="risk"><Shield className="h-4 w-4 mr-1.5" />Risk Analysis</TabsTrigger>
              <TabsTrigger value="accounts"><Link2 className="h-4 w-4 mr-1.5" />Accounts</TabsTrigger>
            </TabsList>

            {/* PORTFOLIO TAB */}
            <TabsContent value="portfolio" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Capital" value={`${totalEquity.toLocaleString("de-DE", { maximumFractionDigits: 0 })}€`} icon={Wallet} />
                <MetricCard title="Total PnL" value={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString("de-DE", { maximumFractionDigits: 0 })}€`} icon={totalPnl >= 0 ? TrendingUp : TrendingDown} className={totalPnl >= 0 ? "text-emerald-500" : "text-red-500"} />
                <MetricCard title="Open Positions" value={String(allPositions.length)} icon={Activity} />
                <MetricCard title="Connected Exchanges" value={String(accounts.length)} icon={Link2} />
              </div>

              {/* Exposure Map */}
              <Card>
                <CardHeader><CardTitle className="text-base">Portfolio Exposure</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(exposureMap)
                      .sort((a, b) => b[1] - a[1])
                      .map(([asset, val]) => {
                        const pct = totalExposure > 0 ? (val / totalExposure) * 100 : 0;
                        return (
                          <div key={asset} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{asset}</span>
                              <span className="text-muted-foreground">{pct.toFixed(1)}% — ${val.toLocaleString("en", { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-foreground/80 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* POSITIONS TAB */}
            <TabsContent value="positions" className="space-y-4">
              {allPositions.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">Keine offenen Positionen</CardContent></Card>
              ) : (
                <div className="grid gap-3">
                  {allPositions.map((p, i) => {
                    const liqDistance = p.side === "LONG"
                      ? ((p.markPrice - p.entryPrice / p.leverage) / p.markPrice) * 100
                      : ((p.entryPrice * (1 + 1 / p.leverage) - p.markPrice) / p.markPrice) * 100;
                    return (
                      <Card key={i}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                              <Badge variant={p.side === "LONG" ? "default" : "destructive"} className="text-xs">
                                {p.side}
                              </Badge>
                              <div>
                                <p className="font-semibold text-sm">{p.symbol}</p>
                                <p className="text-xs text-muted-foreground">{p.leverage}x · {p.marginType}</p>
                              </div>
                            </div>
                            <div className="flex gap-6 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Size</p>
                                <p className="font-medium">{p.size}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Entry</p>
                                <p className="font-medium">${p.entryPrice.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Mark</p>
                                <p className="font-medium">${p.markPrice.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">uPnL</p>
                                <p className={`font-bold ${p.unrealizedPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                  {p.unrealizedPnl >= 0 ? "+" : ""}${p.unrealizedPnl.toFixed(0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Liq. Distance</p>
                                <p className={`font-medium ${liqDistance < 10 ? "text-red-500" : liqDistance < 25 ? "text-amber-500" : "text-emerald-500"}`}>
                                  {liqDistance.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* RISK TAB */}
            <TabsContent value="risk" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Risk Score</p>
                    <p className={`text-4xl font-bold ${riskColor(avgRiskScore)}`}>{avgRiskScore.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{avgRiskScore < 30 ? "Low Risk" : avgRiskScore < 60 ? "Medium Risk" : "High Risk"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Survival Probability</p>
                    <p className={`text-4xl font-bold ${riskColor(avgSurvival, true)}`}>{avgSurvival.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Account Survival</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Max Drawdown Risk</p>
                    <p className={`text-4xl font-bold ${riskColor(maxDrawdown)}`}>{maxDrawdown.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Worst Case</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Discipline Score</p>
                    <p className={`text-4xl font-bold ${riskColor(avgDiscipline, true)}`}>{avgDiscipline.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{avgDiscipline > 70 ? "Disciplined" : avgDiscipline > 40 ? "Needs Work" : "Undisciplined"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Liquidation Risk per position */}
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Liquidation Risk Scanner</CardTitle></CardHeader>
                <CardContent>
                  {allPositions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Keine Futures-Positionen</p>
                  ) : (
                    <div className="space-y-3">
                      {allPositions.map((p, i) => {
                        const liqDist = p.side === "LONG"
                          ? ((p.markPrice - p.entryPrice / p.leverage) / p.markPrice) * 100
                          : ((p.entryPrice * (1 + 1 / p.leverage) - p.markPrice) / p.markPrice) * 100;
                        const marginBuffer = liqDist / 100 * p.markPrice * p.size;
                        return (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Badge variant={p.side === "LONG" ? "default" : "destructive"} className="text-xs">{p.side}</Badge>
                              <span className="font-medium text-sm">{p.symbol}</span>
                              <span className="text-xs text-muted-foreground">{p.leverage}x</span>
                            </div>
                            <div className="flex gap-6 text-sm">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Liq. Distance</p>
                                <p className={`font-bold ${liqDist < 10 ? "text-red-500" : liqDist < 25 ? "text-amber-500" : "text-emerald-500"}`}>
                                  {liqDist.toFixed(1)}%
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Margin Buffer</p>
                                <p className="font-medium">${marginBuffer.toFixed(0)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Leverage Risk</p>
                                <p className={`font-bold ${p.leverage > 10 ? "text-red-500" : p.leverage > 5 ? "text-amber-500" : "text-emerald-500"}`}>
                                  {p.leverage > 10 ? "HIGH" : p.leverage > 5 ? "MEDIUM" : "LOW"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACCOUNTS TAB */}
            <TabsContent value="accounts" className="space-y-4">
              {accounts.map((acc) => (
                <Card key={acc.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{acc.label || acc.exchange}</p>
                          <p className="text-xs text-muted-foreground capitalize">{acc.exchange} · {acc.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs gap-1">
                          <Eye className="h-3 w-3" />READ ONLY
                        </Badge>
                        {acc.last_synced_at && (
                          <span className="text-xs text-muted-foreground">
                            Synced {new Date(acc.last_synced_at).toLocaleString("de")}
                          </span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => syncAccount(acc.id)} disabled={syncing === acc.id}>
                          <RefreshCw className={`h-4 w-4 ${syncing === acc.id ? "animate-spin" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => disconnectAccount(acc.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon: Icon, className }: { title: string; value: string; icon: React.ElementType; className?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${className || ""}`}>{value}</p>
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
