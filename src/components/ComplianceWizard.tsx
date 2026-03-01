import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, DollarSign, Briefcase, Package, Truck, Landmark } from "lucide-react";
import { generateLegalMap, type LegalMap } from "@/lib/dynamic-legal";
import { generateLegalHints, generateOperationalChecklist, type ChecklistEntry } from "@/lib/checklist-generators";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/hooks/useBrand";
import { useBrandProfile } from "@/hooks/useBrandProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { getCapabilities } from "@/lib/feature-flags";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  legal: "Rechtliche Anforderungen",
  data: "Datenschutz",
  product: "Produktanforderungen",
  packaging: "Verpackung & Registrierung",
  tax: "Steuern & Abgaben",
  liability: "Haftung",
  business: "Geschäftsgründung",
  production: "Produktion",
  logistics: "Logistik",
  financial: "Finanzen",
};

const CATEGORY_ICONS: Record<string, typeof Shield> = {
  business: Briefcase,
  production: Package,
  logistics: Truck,
  financial: Landmark,
};

const RISK_LABELS: Record<string, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
  critical: "Kritisch",
};

export default function ComplianceWizard() {
  const { activeBrand: brand } = useBrand();
  const { plan } = useSubscription();
  const { brandProfile: bp } = useBrandProfile();
  const caps = getCapabilities(plan);
  const isPro = caps.canUseLegalMap;
  const isExecution = plan === "execution";

  const [dynamicChecked, setDynamicChecked] = useState<Record<string, boolean>>({});
  const [opsChecked, setOpsChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Dynamic legal map for PRO+
  const legalMap: LegalMap | null = useMemo(() => {
    if (!isPro || !bp) return null;
    return generateLegalMap(bp, plan);
  }, [isPro, bp, plan]);

  // Dynamic legal hints
  const legalHints: ChecklistEntry[] = useMemo(() => {
    if (!bp) return [];
    return generateLegalHints(bp, plan);
  }, [bp, plan]);

  // Dynamic operational checklist
  const opsChecklist: ChecklistEntry[] = useMemo(() => {
    if (!bp) return [];
    return generateOperationalChecklist(bp, plan);
  }, [bp, plan]);

  // Load existing compliance state
  useEffect(() => {
    if (!brand?.id) return;
    (async () => {
      const { data } = await supabase
        .from("compliance_scores")
        .select("*")
        .eq("brand_id", brand.id)
        .maybeSingle();
      if (data) {
        // Restore dynamic checked from risk_flags (stored as checked ids)
        if (data.risk_flags && Array.isArray(data.risk_flags)) {
          const loaded: Record<string, boolean> = {};
          (data.risk_flags as string[]).forEach(id => { loaded[id] = true; });
          setDynamicChecked(loaded);
        }
        if (data.recommendations && Array.isArray(data.recommendations)) {
          const loaded: Record<string, boolean> = {};
          (data.recommendations as string[]).forEach(id => { loaded[id] = true; });
          setOpsChecked(loaded);
        }
      }
    })();
  }, [brand?.id]);

  const toggleDynamic = (id: string) => setDynamicChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleOps = (id: string) => setOpsChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const save = async () => {
    if (!brand?.id) return;
    setSaving(true);
    const checkedLegalIds = Object.entries(dynamicChecked).filter(([, v]) => v).map(([k]) => k);
    const checkedOpsIds = Object.entries(opsChecked).filter(([, v]) => v).map(([k]) => k);
    const allItems = [...(legalMap?.requirements || []), ...legalHints];
    const totalRequired = allItems.filter(i => i.required).length;
    const completedRequired = allItems.filter(i => i.required && dynamicChecked[i.id]).length;
    const score = allItems.length > 0 ? Math.round(((checkedLegalIds.length) / allItems.length) * 100) : 0;

    const payload = {
      brand_id: brand.id,
      overall_score: score,
      risk_flags: checkedLegalIds,
      recommendations: checkedOpsIds,
    };
    const { error } = await supabase.from("compliance_scores").upsert(payload, { onConflict: "brand_id" });
    setSaving(false);
    if (error) toast.error("Fehler beim Speichern");
    else toast.success("Compliance-Status gespeichert");
  };

  // Merge legal map + legal hints for the legal section
  const allLegalItems = useMemo(() => {
    const mapItems = legalMap?.requirements || [];
    // Avoid duplicates: legal hints that aren't already in the map
    const mapIds = new Set(mapItems.map(i => i.id));
    const uniqueHints = legalHints.filter(h => !mapIds.has(h.id));
    return [...mapItems, ...uniqueHints];
  }, [legalMap, legalHints]);

  const legalCompleted = allLegalItems.filter(r => dynamicChecked[r.id]).length;
  const legalTotal = allLegalItems.length;
  const legalScore = legalTotal > 0 ? Math.round((legalCompleted / legalTotal) * 100) : 0;

  const opsCompleted = opsChecklist.filter(r => opsChecked[r.id]).length;
  const opsTotal = opsChecklist.length;
  const opsScore = opsTotal > 0 ? Math.round((opsCompleted / opsTotal) * 100) : 0;

  const legalCategories = [...new Set(allLegalItems.map(r => r.category))];
  const opsCategories = [...new Set(opsChecklist.map(r => r.category))];

  // ── Render: Dynamic Compliance Wizard ───────────────────────
  return (
    <div className="space-y-6">
      {/* Profile context */}
      {bp && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <Shield className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs text-accent font-medium">Personalisiert:</span>
          {bp.categoryId && <Badge variant="outline" className="text-[10px]">{bp.categoryId}</Badge>}
          {bp.targetRegion && <Badge variant="outline" className="text-[10px]">{bp.targetRegion}</Badge>}
          {bp.fulfillmentModel && <Badge variant="outline" className="text-[10px]">{bp.fulfillmentModel}</Badge>}
          {bp.priceSegment && <Badge variant="outline" className="text-[10px]">{bp.priceSegment}</Badge>}
          {plan !== "free" && <Badge variant="secondary" className="text-[10px] ml-auto">{plan.toUpperCase()}</Badge>}
        </div>
      )}

      {/* Legal & Compliance Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal & Compliance — {legalMap?.regionLabel || "Global"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={legalScore >= 80 ? "hsl(var(--accent))" : legalScore >= 50 ? "hsl(45, 93%, 47%)" : "hsl(var(--destructive))"}
                  strokeWidth="8" strokeDasharray={`${legalScore * 2.51} 251`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{legalScore}%</span>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-muted-foreground">
                {legalCompleted}/{legalTotal} erledigt
              </p>
              <Progress value={legalScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal checklists by category */}
      {legalCategories.map(cat => (
        <Card key={cat}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{CATEGORY_LABELS[cat] || cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allLegalItems.filter(r => r.category === cat).map(item => (
              <label key={item.id}
                className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <Checkbox checked={dynamicChecked[item.id] || false} onCheckedChange={() => toggleDynamic(item.id)} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.required && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pflicht</Badge>}
                    {(isPro || isExecution) && (
                      <Badge variant={item.riskLevel === "critical" ? "destructive" : item.riskLevel === "high" ? "secondary" : "outline"}
                        className="text-[10px] px-1.5 py-0">
                        {RISK_LABELS[item.riskLevel]}
                      </Badge>
                    )}
                    {dynamicChecked[item.id] && <CheckCircle className="h-3.5 w-3.5 text-accent" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
                    {"estimatedCost" in item && (item as any).estimatedCost && (
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{(item as any).estimatedCost}</span>
                    )}
                    {isExecution && "complianceProbability" in item && (item as any).complianceProbability !== undefined && (
                      <span>Compliance-Chance: {(item as any).complianceProbability}%</span>
                    )}
                    {isExecution && "auditProbability" in item && (item as any).auditProbability !== undefined && (
                      <span>Audit-Chance: {(item as any).auditProbability}%</span>
                    )}
                    {isExecution && "financialExposure" in item && (item as any).financialExposure && (
                      <span className="text-destructive">Exposure: {(item as any).financialExposure}</span>
                    )}
                    {isExecution && "estimatedFine" in item && (item as any).estimatedFine && (
                      <span className="text-destructive">Exposure: {(item as any).estimatedFine}</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Operational Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Operative Checkliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Progress value={opsScore} className="h-2 flex-1" />
            <span className="text-sm font-medium text-muted-foreground">{opsCompleted}/{opsTotal}</span>
          </div>
        </CardContent>
      </Card>

      {opsCategories.map(cat => {
        const Icon = CATEGORY_ICONS[cat] || Shield;
        return (
          <Card key={`ops-${cat}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {CATEGORY_LABELS[cat] || cat}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {opsChecklist.filter(r => r.category === cat).map(item => (
                <label key={item.id}
                  className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Checkbox checked={opsChecked[item.id] || false} onCheckedChange={() => toggleOps(item.id)} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.required && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pflicht</Badge>}
                      {(isPro || isExecution) && item.riskLevel && item.riskLevel !== "medium" && (
                        <Badge variant={item.riskLevel === "critical" ? "destructive" : "secondary"}
                          className="text-[10px] px-1.5 py-0">
                          {RISK_LABELS[item.riskLevel]}
                        </Badge>
                      )}
                      {opsChecked[item.id] && <CheckCircle className="h-3.5 w-3.5 text-accent" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    {isExecution && (item.estimatedFine || item.auditProbability) && (
                      <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
                        {item.estimatedFine && <span className="text-destructive">Exposure: {item.estimatedFine}</span>}
                        {item.auditProbability !== undefined && <span>Audit-Chance: {item.auditProbability}%</span>}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Button onClick={save} disabled={saving}>
        {saving ? "Speichert…" : "Compliance-Status speichern"}
      </Button>
    </div>
  );
}
