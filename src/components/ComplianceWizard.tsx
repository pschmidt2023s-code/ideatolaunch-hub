import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { COMPLIANCE_ITEMS, computeComplianceScore, type ComplianceState, type ComplianceResult } from "@/lib/compliance-engine";
import { generateLegalMap, type LegalRequirement, type LegalMap } from "@/lib/dynamic-legal";
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
};

const RISK_COLORS: Record<string, string> = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-destructive",
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

  const [state, setState] = useState<ComplianceState>({});
  const [dynamicChecked, setDynamicChecked] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [saving, setSaving] = useState(false);

  // Dynamic legal map for PRO+
  const legalMap: LegalMap | null = useMemo(() => {
    if (!isPro || !bp) return null;
    return generateLegalMap(bp, plan);
  }, [isPro, bp, plan]);

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
        const loaded: ComplianceState = {};
        for (const item of COMPLIANCE_ITEMS) {
          loaded[item.key] = (data as Record<string, unknown>)[item.key] === true;
        }
        setState(loaded);
      }
    })();
  }, [brand?.id]);

  // Recompute on state change (static)
  useEffect(() => {
    setResult(computeComplianceScore(state));
  }, [state]);

  const toggle = (key: string) => setState(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleDynamic = (id: string) => setDynamicChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const save = async () => {
    if (!brand?.id) return;
    setSaving(true);
    const compResult = computeComplianceScore(state);
    const payload = {
      brand_id: brand.id,
      overall_score: compResult.score,
      risk_flags: compResult.riskFlags,
      recommendations: compResult.recommendations,
      ...Object.fromEntries(COMPLIANCE_ITEMS.map(i => [i.key, state[i.key] || false])),
    };
    const { error } = await supabase.from("compliance_scores").upsert(payload, { onConflict: "brand_id" });
    setSaving(false);
    if (error) toast.error("Fehler beim Speichern");
    else toast.success("Compliance-Status gespeichert");
  };

  // ── Dynamic PRO/Execution Legal Map ─────────────────────────
  if (legalMap) {
    const dynamicCompleted = legalMap.requirements.filter(r => dynamicChecked[r.id]).length;
    const dynamicTotal = legalMap.requirements.length;
    const dynamicReqCompleted = legalMap.requirements.filter(r => r.required && dynamicChecked[r.id]).length;
    const dynamicScore = dynamicTotal > 0 ? Math.round((dynamicCompleted / dynamicTotal) * 100) : 0;

    const categories = [...new Set(legalMap.requirements.map(r => r.category))];

    return (
      <div className="space-y-6">
        {/* Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legal Compliance — {legalMap.regionLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={dynamicScore >= 80 ? "hsl(var(--accent))" : dynamicScore >= 50 ? "hsl(45, 93%, 47%)" : "hsl(var(--destructive))"}
                    strokeWidth="8" strokeDasharray={`${dynamicScore * 2.51} 251`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{dynamicScore}%</span>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {dynamicCompleted}/{dynamicTotal} erledigt · {dynamicReqCompleted}/{legalMap.totalRequired} Pflichtangaben
                </p>
                <Progress value={dynamicScore} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Personalisiert basierend auf: {bp?.categoryId || "Allgemein"} · {legalMap.regionLabel} · {bp?.fulfillmentModel || "Standard"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category checklists */}
        {categories.map(cat => (
          <Card key={cat}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{CATEGORY_LABELS[cat] || cat}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {legalMap.requirements.filter(r => r.category === cat).map(item => (
                <label key={item.id}
                  className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Checkbox checked={dynamicChecked[item.id] || false} onCheckedChange={() => toggleDynamic(item.id)} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.required && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pflicht</Badge>}
                      <Badge variant={item.riskLevel === "critical" ? "destructive" : item.riskLevel === "high" ? "secondary" : "outline"}
                        className="text-[10px] px-1.5 py-0">
                        {RISK_LABELS[item.riskLevel]}
                      </Badge>
                      {dynamicChecked[item.id] && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{item.estimatedCost}</span>
                      {isExecution && item.complianceProbability !== undefined && (
                        <span>Compliance-Chance: {item.complianceProbability}%</span>
                      )}
                      {isExecution && item.financialExposure && (
                        <span className="text-destructive">Exposure: {item.financialExposure}</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        ))}

        <Button onClick={save} disabled={saving}>
          {saving ? "Speichert…" : "Compliance-Status speichern"}
        </Button>
      </div>
    );
  }

  // ── Static fallback for FREE/BUILDER ────────────────────────
  const categories = ["legal", "data", "product", "packaging"];

  return (
    <div className="space-y-6">
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={result.riskLevel === "low" ? "hsl(var(--accent))" : result.riskLevel === "medium" ? "hsl(45, 93%, 47%)" : "hsl(var(--destructive))"}
                    strokeWidth="8" strokeDasharray={`${result.score * 2.51} 251`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{result.score}%</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Risikostufe:</span>
                  <Badge variant={result.riskLevel === "low" ? "default" : "destructive"} className={RISK_COLORS[result.riskLevel]}>
                    {RISK_LABELS[result.riskLevel]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.completedCount}/{result.totalCount} erledigt · {result.requiredCompleted}/{result.requiredTotal} Pflichtangaben
                </p>
                <Progress value={result.score} className="h-2" />
              </div>
            </div>
            {result.riskFlags.length > 0 && (
              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" /> {result.riskFlags.length} offene Risiken
                </p>
                <ul className="mt-2 space-y-1">
                  {result.riskFlags.map((f, i) => <li key={i} className="text-xs text-destructive/80">• {f}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {categories.map(cat => (
        <Card key={cat}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{CATEGORY_LABELS[cat]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {COMPLIANCE_ITEMS.filter(i => i.category === cat).map(item => (
              <label key={item.key} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <Checkbox checked={state[item.key] || false} onCheckedChange={() => toggle(item.key)} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.required && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Pflicht</Badge>}
                    {state[item.key] && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button onClick={save} disabled={saving}>
        {saving ? "Speichert…" : "Compliance-Status speichern"}
      </Button>
    </div>
  );
}
