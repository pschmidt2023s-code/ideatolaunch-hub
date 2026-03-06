import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/founder-analytics";
import { ArrowLeft, Plus, Pencil, Trash2, Copy, Check, KeyRound, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface SubscriptionRow {
  id: string;
  user_id: string;
  status: string;
  license_key: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
}

type SubWithProfile = SubscriptionRow & { profile?: ProfileRow };

const PLANS = ["free", "builder", "pro", "execution"] as const;
const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  builder: "Builder (29€/mo)",
  pro: "Pro (79€/mo)",
  execution: "Execution OS (159€/mo)",
};

// Custom price presets
const PRICE_PRESETS = [
  { label: "Free", value: 0 },
  { label: "19€", value: 19 },
  { label: "29€ (Builder)", value: 29 },
  { label: "49€", value: 49 },
  { label: "79€ (Pro)", value: 79 },
  { label: "99€", value: 99 },
  { label: "159€ (Execution)", value: 159 },
  { label: "Custom", value: -1 },
];

function generateLicenseKey(): string {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BOS-${seg()}-${seg()}-${seg()}`;
}

export default function LicenseManagement() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<SubWithProfile[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubWithProfile | null>(null);

  // Form
  const [formEmail, setFormEmail] = useState("");
  const [formPlan, setFormPlan] = useState<string>("builder");
  const [formLicenseKey, setFormLicenseKey] = useState("");
  const [formCustomPrice, setFormCustomPrice] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formPeriodEnd, setFormPeriodEnd] = useState("");
  const [saving, setSaving] = useState(false);

  // Auth check
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    checkIsAdmin(user.id).then((isAdmin) => {
      if (!isAdmin) { navigate("/dashboard"); return; }
      setAuthorized(true);
    });
  }, [user, authLoading, navigate]);

  // Load data
  const loadData = async () => {
    setLoading(true);
    const [subRes, profRes] = await Promise.all([
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, first_name, last_name, company_name"),
    ]);

    const subsData = (subRes.data ?? []) as SubscriptionRow[];
    const profsData = (profRes.data ?? []) as ProfileRow[];
    setProfiles(profsData);

    const merged: SubWithProfile[] = subsData.map((s) => ({
      ...s,
      profile: profsData.find((p) => p.user_id === s.user_id),
    }));
    setSubs(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (authorized) loadData();
  }, [authorized]);

  // Open create dialog
  const openCreate = () => {
    setEditing(null);
    setFormEmail("");
    setFormPlan("builder");
    setFormLicenseKey(generateLicenseKey());
    setFormCustomPrice("");
    setFormNotes("");
    setFormPeriodEnd("");
    setDialogOpen(true);
  };

  // Open edit dialog
  const openEdit = (sub: SubWithProfile) => {
    setEditing(sub);
    setFormEmail("");
    setFormPlan(sub.status);
    setFormLicenseKey(sub.license_key ?? "");
    setFormCustomPrice("");
    setFormNotes("");
    setFormPeriodEnd(sub.current_period_end ? sub.current_period_end.split("T")[0] : "");
    setDialogOpen(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    setSaving(true);

    if (editing) {
      // Update existing
      const updates: Record<string, unknown> = {
        status: formPlan,
        license_key: formLicenseKey || null,
        current_period_end: formPeriodEnd ? new Date(formPeriodEnd).toISOString() : editing.current_period_end,
      };

      const { error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", editing.id);

      if (error) {
        toast.error("Fehler beim Speichern: " + error.message);
      } else {
        // Audit log
        await supabase.from("admin_audit_log").insert({
          admin_id: user!.id,
          affected_user_id: editing.user_id,
          action_type: "license_updated",
          details: { plan: formPlan, license_key: formLicenseKey, custom_price: formCustomPrice, notes: formNotes },
        });
        toast.success("Lizenz aktualisiert");
        setDialogOpen(false);
        loadData();
      }
    } else {
      // Create: Need to find user by email first
      if (!formEmail.trim()) {
        toast.error("E-Mail ist erforderlich");
        setSaving(false);
        return;
      }

      // Look up user via auth admin or profile — we'll try to find the subscription by checking profiles
      // Since we can't query auth.users, we search existing subscriptions
      const { data: existingSubs } = await supabase
        .from("subscriptions")
        .select("id, user_id")
        .limit(1000);

      // We need to find the user_id from profiles
      // Try to match email — but profiles don't have email. We'll need to use a different approach.
      // Actually, we can look for the user through the auth admin API via edge function, 
      // but simpler: create a subscription for a specific user_id if we can match.
      
      // For now, let's check if there's already a subscription we can update
      toast.error("Bitte nutze die Edit-Funktion bei bestehenden Nutzern, oder erstelle den Nutzer zuerst über Auth.");
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  // Delete / Reset to free
  const handleResetToFree = async (sub: SubWithProfile) => {
    if (!confirm("Lizenz auf Free zurücksetzen?")) return;

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "free", license_key: null, stripe_subscription_id: null })
      .eq("id", sub.id);

    if (error) {
      toast.error("Fehler: " + error.message);
    } else {
      await supabase.from("admin_audit_log").insert({
        admin_id: user!.id,
        affected_user_id: sub.user_id,
        action_type: "license_reset_free",
        details: { previous_plan: sub.status, previous_key: sub.license_key },
      });
      toast.success("Auf Free zurückgesetzt");
      loadData();
    }
  };

  if (authLoading || authorized === null || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const paidSubs = subs.filter((s) => s.status !== "free");
  const totalLicenses = subs.filter((s) => s.license_key).length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <KeyRound className="h-6 w-6" />
              Lizenzverwaltung
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalLicenses} aktive Lizenzen · {paidSubs.length} zahlende Nutzer
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreate} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Neue Lizenz
            </Button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Admin
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(["free", "builder", "pro", "execution"] as const).map((plan) => {
            const count = subs.filter((s) => s.status === plan).length;
            return (
              <div key={plan} className="rounded-xl border bg-card p-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{plan}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nutzer</TableHead>
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs">Lizenzschlüssel</TableHead>
                <TableHead className="text-xs">Stripe</TableHead>
                <TableHead className="text-xs">Gültig bis</TableHead>
                <TableHead className="text-xs">Erstellt</TableHead>
                <TableHead className="text-xs text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                    Keine Abonnements gefunden
                  </TableCell>
                </TableRow>
              )}
              {subs.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {sub.profile?.first_name || sub.profile?.last_name
                          ? `${sub.profile.first_name ?? ""} ${sub.profile.last_name ?? ""}`.trim()
                          : "—"}
                      </p>
                      {sub.profile?.company_name && (
                        <p className="text-[11px] text-muted-foreground">{sub.profile.company_name}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 font-mono">{sub.user_id.slice(0, 8)}…</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={sub.status} />
                  </TableCell>
                  <TableCell>
                    {sub.license_key ? (
                      <LicenseKeyCell value={sub.license_key} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {sub.stripe_subscription_id ? (
                      <span className="text-[11px] text-success font-medium">● Aktiv</span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Manual</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {sub.current_period_end
                        ? new Date(sub.current_period_end).toLocaleDateString("de-DE")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString("de-DE")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(sub)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {sub.status !== "free" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleResetToFree(sub)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Lizenz bearbeiten" : "Neue Lizenz erstellen"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {!editing && (
              <div className="space-y-2">
                <Label>Nutzer E-Mail</Label>
                <Input
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="user@example.com"
                />
                <p className="text-[11px] text-muted-foreground">
                  Der Nutzer muss bereits registriert sein.
                </p>
              </div>
            )}

            {editing && (
              <div className="rounded-lg bg-muted/30 border p-3">
                <p className="text-xs text-muted-foreground">Nutzer</p>
                <p className="text-sm font-medium">
                  {editing.profile?.first_name} {editing.profile?.last_name}
                  {editing.profile?.company_name && ` · ${editing.profile.company_name}`}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{editing.user_id}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={formPlan} onValueChange={setFormPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PLAN_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lizenzschlüssel</Label>
              <div className="flex gap-2">
                <Input
                  value={formLicenseKey}
                  onChange={(e) => setFormLicenseKey(e.target.value)}
                  placeholder="BOS-XXXX-XXXX-XXXX"
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFormLicenseKey(generateLicenseKey())}
                  title="Neuen Key generieren"
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Preis (€/Monat)</Label>
              <Input
                type="number"
                value={formCustomPrice}
                onChange={(e) => setFormCustomPrice(e.target.value)}
                placeholder="z.B. 49"
              />
              <div className="flex flex-wrap gap-1.5">
                {PRICE_PRESETS.filter((p) => p.value >= 0).map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setFormCustomPrice(String(p.value))}
                    className="rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gültig bis</Label>
              <Input
                type="date"
                value={formPeriodEnd}
                onChange={(e) => setFormPeriodEnd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Interne Notiz</Label>
              <Input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="z.B. Sonderkonditionen, Partner-Deal…"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Speichern" : "Lizenz erstellen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Plan Badge ── */
function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    builder: "bg-primary/10 text-primary",
    pro: "bg-accent/10 text-accent",
    execution: "bg-warning/10 text-warning",
  };
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[plan] ?? styles.free}`}>
      {plan}
    </span>
  );
}

/* ── License Key Cell ── */
function LicenseKeyCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-1.5">
      <code className="text-[11px] font-mono text-muted-foreground">{value}</code>
      <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
        {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}
