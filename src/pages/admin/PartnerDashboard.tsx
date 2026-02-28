import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, ExternalLink, MousePointerClick, TrendingUp, Users, DollarSign,
  Star, Shield, Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { productionSuppliers } from "@/data/suppliers/production";
import { packagingSuppliers } from "@/data/suppliers/packaging";
import { addonSuppliers } from "@/data/suppliers/addons";
import type { AnyIntelligentSupplier } from "@/lib/supplier-recommendation";

// Combine all suppliers for admin view
const ALL_SUPPLIERS: AnyIntelligentSupplier[] = [
  ...productionSuppliers,
  ...packagingSuppliers,
  ...addonSuppliers,
];

interface ClickData {
  supplier_id: string;
  supplier_name: string;
  count: number;
  affiliateClicks: number;
}

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;
      const { data } = await supabase.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
      setIsAdmin(!!data);
    }
    checkAdmin();
  }, [user]);

  useEffect(() => {
    async function loadClicks() {
      if (!isAdmin) return;
      setLoading(true);
      const { data } = await supabase
        .from("supplier_clicks")
        .select("supplier_id, supplier_name, affiliate");

      if (data) {
        const map = new Map<string, ClickData>();
        for (const row of data) {
          const existing = map.get(row.supplier_id) || {
            supplier_id: row.supplier_id,
            supplier_name: row.supplier_name,
            count: 0,
            affiliateClicks: 0,
          };
          existing.count++;
          if (row.affiliate) existing.affiliateClicks++;
          map.set(row.supplier_id, existing);
        }
        setClicks(Array.from(map.values()).sort((a, b) => b.count - a.count));
      }
      setLoading(false);
    }
    loadClicks();
  }, [isAdmin]);

  const totalClicks = useMemo(() => clicks.reduce((s, c) => s + c.count, 0), [clicks]);
  const totalAffiliateClicks = useMemo(() => clicks.reduce((s, c) => s + c.affiliateClicks, 0), [clicks]);
  // Conservative estimate: 5% conversion rate, €5 avg commission
  const estimatedRevenue = totalAffiliateClicks * 0.05 * 5;

  const affiliatePartners = ALL_SUPPLIERS.filter((s) => s.affiliateAvailable);
  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clicks) {
      const supplier = ALL_SUPPLIERS.find((s) => s.partnerId === c.supplier_id);
      if (supplier) {
        for (const cat of supplier.categoryTags) {
          map.set(cat, (map.get(cat) || 0) + c.count);
        }
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [clicks]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold">Admin-Zugang erforderlich</p>
            <p className="text-sm text-muted-foreground mt-2">Dieses Dashboard ist nur für Administratoren zugänglich.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-accent" />
          Partner Dashboard
        </h1>
        <Badge variant="outline" className="text-xs">B2B Infrastructure</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MousePointerClick className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">{totalClicks}</p>
              <p className="text-xs text-muted-foreground">Outbound Clicks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ExternalLink className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalAffiliateClicks}</p>
              <p className="text-xs text-muted-foreground">Affiliate Clicks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">~{estimatedRevenue.toFixed(0)} €</p>
              <p className="text-xs text-muted-foreground">Est. Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{ALL_SUPPLIERS.length}</p>
              <p className="text-xs text-muted-foreground">Total Partners</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clicks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clicks">Click Analytics</TabsTrigger>
          <TabsTrigger value="partners">Partner Übersicht</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Partner</TabsTrigger>
        </TabsList>

        <TabsContent value="clicks">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Top Clicked Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Lade Daten...</p>
              ) : clicks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Klick-Daten vorhanden.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Affiliate</TableHead>
                      <TableHead className="text-right">Est. Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clicks.slice(0, 15).map((c) => (
                      <TableRow key={c.supplier_id}>
                        <TableCell className="font-medium text-sm">{c.supplier_name}</TableCell>
                        <TableCell className="text-right">{c.count}</TableCell>
                        <TableCell className="text-right">{c.affiliateClicks}</TableCell>
                        <TableCell className="text-right text-green-600">
                          ~{(c.affiliateClicks * 0.05 * 5).toFixed(0)} €
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top Performing Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-sm">{cat}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-accent/20 w-32">
                          <div
                            className="h-full rounded-full bg-accent transition-all"
                            style={{ width: `${Math.min(100, (count / (topCategories[0]?.[1] || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alle Partner ({ALL_SUPPLIERS.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Reliability</TableHead>
                      <TableHead>MOQ</TableHead>
                      <TableHead>Affiliate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ALL_SUPPLIERS.map((s) => (
                      <TableRow key={s.partnerId}>
                        <TableCell className="font-medium text-sm">{s.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{s.euBased ? "EU" : "Asia"}</Badge>
                        </TableCell>
                        <TableCell className="text-xs capitalize">{s.positioning}</TableCell>
                        <TableCell className={`text-xs font-medium ${s.riskScore <= 20 ? "text-green-500" : s.riskScore <= 45 ? "text-yellow-500" : "text-orange-500"}`}>{s.riskScore}</TableCell>
                        <TableCell className={`text-xs font-medium ${s.reliabilityScore >= 85 ? "text-green-500" : s.reliabilityScore >= 70 ? "text-yellow-500" : "text-orange-500"}`}>{s.reliabilityScore}</TableCell>
                        <TableCell className="text-xs">{s.estimatedMOQ.toLocaleString("de-DE")}</TableCell>
                        <TableCell>
                          {s.affiliateAvailable ? (
                            <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">Active</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Affiliate Partner ({affiliatePartners.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {affiliatePartners.map((s) => {
                  const clickData = clicks.find((c) => c.supplier_id === s.partnerId);
                  return (
                    <div key={s.partnerId} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.affiliateUrl}</p>
                        </div>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-600">Standard</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded border p-2 text-center">
                          <p className="text-muted-foreground">Clicks</p>
                          <p className="font-bold">{clickData?.count || 0}</p>
                        </div>
                        <div className="rounded border p-2 text-center">
                          <p className="text-muted-foreground">Affiliate Clicks</p>
                          <p className="font-bold">{clickData?.affiliateClicks || 0}</p>
                        </div>
                        <div className="rounded border p-2 text-center">
                          <p className="text-muted-foreground">Est. Revenue</p>
                          <p className="font-bold text-green-600">~{((clickData?.affiliateClicks || 0) * 0.05 * 5).toFixed(0)} €</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
