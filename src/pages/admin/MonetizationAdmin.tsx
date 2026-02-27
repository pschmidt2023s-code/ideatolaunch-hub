import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { checkIsAdmin } from "@/lib/founder-analytics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Loader2, Tag, Users, Flag, ClipboardList, Plus, Trash2, Pencil, X, Check,
  AlertTriangle, ShieldCheck
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface DiscountCode {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  applicable_plans: string[];
  expiration_date: string | null;
  usage_limit: number | null;
  current_usage: number;
  active: boolean;
  internal_notes: string | null;
  created_at: string;
}

interface SubRow {
  user_id: string;
  status: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  current_period_end: string | null;
}

interface ProfileRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
}

interface AuditRow {
  id: string;
  admin_id: string;
  action_type: string;
  affected_user_id: string | null;
  details: any;
  created_at: string;
}

interface FeatureOverride {
  id: string;
  feature_key: string;
  override_type: "global" | "plan" | "user";
  target_value: string | null;
  enabled: boolean;
  modified_by: string | null;
  modified_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────

function StatusBadge({ code }: { code: DiscountCode }) {
  if (!code.active) return <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>;
  if (code.expiration_date && new Date(code.expiration_date) < new Date()) return <Badge variant="destructive">Expired</Badge>;
  if (code.usage_limit && code.current_usage >= code.usage_limit) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Maxed</Badge>;
  return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Active</Badge>;
}

function ConfirmModal({ title, desc, onConfirm, onCancel }: { title: string; desc: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-xl border bg-card p-6 w-full max-w-md shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Abbrechen</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>Bestätigen</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function MonetizationAdmin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("discounts");

  // Auth gate
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    checkIsAdmin(user.id).then((ok) => {
      setAuthorized(ok);
      if (!ok) navigate("/dashboard");
    });
  }, [user, authLoading, navigate]);

  if (authLoading || authorized === null) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" /> Monetization & Subscription Control</h1>
            <p className="text-sm text-muted-foreground">Admin-only management for codes, subscriptions, flags & audit.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="discounts" className="gap-1.5"><Tag className="h-3.5 w-3.5" /> Discount Codes</TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Subscriptions</TabsTrigger>
            <TabsTrigger value="flags" className="gap-1.5"><Flag className="h-3.5 w-3.5" /> Feature Flags</TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="discounts"><DiscountTab userId={user!.id} /></TabsContent>
          <TabsContent value="subscriptions"><SubscriptionTab userId={user!.id} /></TabsContent>
          <TabsContent value="flags"><FeatureFlagTab userId={user!.id} /></TabsContent>
          <TabsContent value="audit"><AuditLogTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: DISCOUNT CODES
// ═══════════════════════════════════════════════════════════════

function DiscountTab({ userId }: { userId: string }) {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [plans, setPlans] = useState<string[]>([]);
  const [expDate, setExpDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false });
    setCodes((data as DiscountCode[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setCode(""); setDiscountType("percentage"); setDiscountValue(""); setPlans([]);
    setExpDate(""); setUsageLimit(""); setNotes(""); setEditId(null); setShowForm(false);
  };

  const startEdit = (c: DiscountCode) => {
    setEditId(c.id);
    setCode(c.code);
    setDiscountType(c.discount_type);
    setDiscountValue(String(c.discount_value));
    setPlans(c.applicable_plans);
    setExpDate(c.expiration_date?.split("T")[0] || "");
    setUsageLimit(c.usage_limit ? String(c.usage_limit) : "");
    setNotes(c.internal_notes || "");
    setShowForm(true);
  };

  const save = async () => {
    const val = parseFloat(discountValue);
    if (!code.trim() || isNaN(val) || val <= 0) { toast.error("Code und Wert sind erforderlich"); return; }
    if (discountType === "percentage" && val > 100) { toast.error("Prozent-Rabatt max. 100%"); return; }
    if (plans.length === 0) { toast.error("Mindestens einen Plan auswählen"); return; }

    const payload = {
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: val,
      applicable_plans: plans,
      expiration_date: expDate || null,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      internal_notes: notes || null,
      created_by: userId,
    };

    if (editId) {
      const { error } = await supabase.from("discount_codes").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      await logAudit(userId, "discount_updated", null, { code: payload.code, id: editId });
      toast.success("Code aktualisiert");
    } else {
      const { error } = await supabase.from("discount_codes").insert(payload);
      if (error) { toast.error(error.message); return; }
      await logAudit(userId, "discount_created", null, { code: payload.code });
      toast.success("Code erstellt");
    }
    resetForm();
    load();
  };

  const toggleActive = async (c: DiscountCode) => {
    await supabase.from("discount_codes").update({ active: !c.active }).eq("id", c.id);
    await logAudit(userId, c.active ? "discount_disabled" : "discount_enabled", null, { code: c.code });
    toast.success(c.active ? "Code deaktiviert" : "Code aktiviert");
    load();
  };

  const deleteCode = async (c: DiscountCode) => {
    await supabase.from("discount_codes").delete().eq("id", c.id);
    await logAudit(userId, "discount_deleted", null, { code: c.code });
    toast.success("Code gelöscht");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Discount Codes</h2>
        <Button size="sm" className="gap-1.5" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-3.5 w-3.5" /> Neuer Code
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{editId ? "Code bearbeiten" : "Neuen Discount Code erstellen"}</h3>
            <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER25" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Discount Type</Label>
              <Select value={discountType} onValueChange={(v: "percentage" | "fixed") => setDiscountType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Prozent (%)</SelectItem>
                  <SelectItem value="fixed">Fester Betrag (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Wert</Label>
              <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType === "percentage" ? "25" : "10"} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Anwendbar auf Pläne</Label>
            <div className="flex gap-4">
              {["builder", "pro", "execution"].map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm capitalize">
                  <Checkbox checked={plans.includes(p)} onCheckedChange={(v) => setPlans(v ? [...plans, p] : plans.filter((x) => x !== p))} />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Ablaufdatum (optional)</Label>
              <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nutzungslimit (optional)</Label>
              <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Unbegrenzt" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Interne Notizen</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Button onClick={save} className="gap-1.5"><Check className="h-3.5 w-3.5" /> Speichern</Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : codes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Keine Discount Codes vorhanden.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="p-3">Code</th><th className="p-3">Typ</th><th className="p-3">Wert</th><th className="p-3">Pläne</th>
              <th className="p-3">Nutzung</th><th className="p-3">Status</th><th className="p-3">Aktionen</th>
            </tr></thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3 font-mono font-semibold">{c.code}</td>
                  <td className="p-3">{c.discount_type === "percentage" ? "%" : "€"}</td>
                  <td className="p-3">{c.discount_value}{c.discount_type === "percentage" ? "%" : " €"}</td>
                  <td className="p-3">{c.applicable_plans.join(", ")}</td>
                  <td className="p-3">{c.current_usage}{c.usage_limit ? `/${c.usage_limit}` : ""}</td>
                  <td className="p-3"><StatusBadge code={c} /></td>
                  <td className="p-3 flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(c)}>
                      {c.active ? <X className="h-3.5 w-3.5 text-destructive" /> : <Check className="h-3.5 w-3.5 text-green-600" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCode(c)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2: SUBSCRIPTION CONTROL
// ═══════════════════════════════════════════════════════════════

function SubscriptionTab({ userId }: { userId: string }) {
  const [subs, setSubs] = useState<(SubRow & { profile?: ProfileRow })[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ title: string; desc: string; action: () => Promise<void> } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: subData } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    const { data: profileData } = await supabase.from("profiles").select("user_id, first_name, last_name, company_name");
    const profileMap = new Map((profileData || []).map((p: ProfileRow) => [p.user_id, p]));
    setSubs((subData || []).map((s: SubRow) => ({ ...s, profile: profileMap.get(s.user_id) })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updatePlan = async (sub: SubRow, newPlan: string) => {
    setConfirm({
      title: `Plan ändern: ${sub.status} → ${newPlan}`,
      desc: `User ${sub.user_id} wird auf "${newPlan}" gesetzt. Stripe wird nicht automatisch aktualisiert.`,
      action: async () => {
        await supabase.from("subscriptions").update({ status: newPlan }).eq("user_id", sub.user_id);
        await logAudit(userId, "subscription_plan_changed", sub.user_id, { from: sub.status, to: newPlan });
        toast.success(`Plan auf ${newPlan} geändert`);
        setConfirm(null);
        load();
      },
    });
  };

  const cancelSub = async (sub: SubRow) => {
    setConfirm({
      title: "Abo kündigen",
      desc: `Abo von ${sub.user_id} wird auf "free" gesetzt.`,
      action: async () => {
        await supabase.from("subscriptions").update({ status: "free" }).eq("user_id", sub.user_id);
        await logAudit(userId, "subscription_cancelled", sub.user_id, { previous: sub.status });
        toast.success("Abo gekündigt");
        setConfirm(null);
        load();
      },
    });
  };

  return (
    <div className="space-y-4">
      {confirm && <ConfirmModal title={confirm.title} desc={confirm.desc} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}
      <h2 className="font-semibold">User Subscriptions</h2>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="p-3">User</th><th className="p-3">Plan</th><th className="p-3">Stripe ID</th>
              <th className="p-3">Start</th><th className="p-3">Nächste Abr.</th><th className="p-3">Aktionen</th>
            </tr></thead>
            <tbody>
              {subs.map((s) => {
                const name = s.profile ? [s.profile.first_name, s.profile.last_name].filter(Boolean).join(" ") || s.profile.company_name || s.user_id.slice(0, 8) : s.user_id.slice(0, 8);
                return (
                  <tr key={s.user_id} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium text-xs">{name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{s.user_id.slice(0, 12)}…</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize">{s.status}</Badge>
                    </td>
                    <td className="p-3 text-[10px] font-mono text-muted-foreground">{s.stripe_subscription_id?.slice(0, 20) || "—"}</td>
                    <td className="p-3 text-xs">{new Date(s.created_at).toLocaleDateString("de-DE")}</td>
                    <td className="p-3 text-xs">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("de-DE") : "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <Select onValueChange={(v) => updatePlan(s, v)}>
                          <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Plan →" /></SelectTrigger>
                          <SelectContent>
                            {["free", "builder", "pro", "execution"].filter((p) => p !== s.status).map((p) => (
                              <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => cancelSub(s)}>Cancel</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3: FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════

const FEATURES = [
  { key: "scenarioSimulator", label: "Scenario Simulator" },
  { key: "supplierMatching", label: "Supplier Matching" },
  { key: "aiStrategyRecommendations", label: "AI Copilot" },
  { key: "executionOS", label: "Execution OS" },
  { key: "survivalMonitoring", label: "Survival Monitoring" },
  { key: "benchmarkEngine", label: "Benchmark Engine" },
  { key: "executionPlanner", label: "Execution Planner" },
  { key: "investorMode", label: "Investor Mode" },
  { key: "advancedCopilot", label: "Advanced Copilot" },
];

function FeatureFlagTab({ userId }: { userId: string }) {
  const [overrides, setOverrides] = useState<FeatureOverride[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("feature_flag_overrides").select("*").order("modified_at", { ascending: false });
    setOverrides((data as FeatureOverride[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const getGlobalState = (featureKey: string): boolean | null => {
    const o = overrides.find((x) => x.feature_key === featureKey && x.override_type === "global");
    return o ? o.enabled : null;
  };

  const toggleGlobal = async (featureKey: string) => {
    const existing = overrides.find((x) => x.feature_key === featureKey && x.override_type === "global");
    if (existing) {
      await supabase.from("feature_flag_overrides").update({ enabled: !existing.enabled, modified_by: userId, modified_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("feature_flag_overrides").insert({ feature_key: featureKey, override_type: "global", target_value: null, enabled: false, modified_by: userId });
    }
    await logAudit(userId, "feature_flag_toggled", null, { feature: featureKey, type: "global" });
    toast.success(`Flag "${featureKey}" geändert`);
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Feature Flags (Global Toggles)</h2>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="rounded-xl border divide-y">
          {FEATURES.map((f) => {
            const state = getGlobalState(f.key);
            const override = overrides.find((x) => x.feature_key === f.key && x.override_type === "global");
            return (
              <div key={f.key} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{f.key}</p>
                  {override && (
                    <p className="text-[10px] text-muted-foreground">
                      Geändert: {new Date(override.modified_at).toLocaleString("de-DE")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{state === null ? "Default" : state ? "ON" : "OFF"}</span>
                  <Switch checked={state !== false} onCheckedChange={() => toggleGlobal(f.key)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 4: AUDIT LOG
// ═══════════════════════════════════════════════════════════════

function AuditLogTab() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100);
      setLogs((data as AuditRow[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Admin Audit Log</h2>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Keine Audit-Einträge vorhanden.</p>
      ) : (
        <div className="rounded-xl border divide-y">
          {logs.map((log) => (
            <div key={log.id} className="px-4 py-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] font-mono">{log.action_type}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("de-DE")}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{log.admin_id.slice(0, 8)}…</span>
              </div>
              {expanded === log.id && (
                <pre className="mt-2 rounded bg-muted p-3 text-[10px] overflow-auto max-h-40">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Audit helper ───────────────────────────────────────────────

async function logAudit(adminId: string, actionType: string, affectedUserId: string | null, details: any) {
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    action_type: actionType,
    affected_user_id: affectedUserId,
    details,
  });
}
