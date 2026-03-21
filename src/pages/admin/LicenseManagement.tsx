import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/founder-analytics";
import {
  ArrowLeft, Plus, Pencil, Trash2, Copy, Check, KeyRound, Loader2,
  Link2, Power, PowerOff, Send, MoreHorizontal, ExternalLink, QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ── Types ──
interface SubscriptionRow {
  id: string; user_id: string; status: string; license_key: string | null;
  stripe_customer_id: string | null; stripe_subscription_id: string | null;
  current_period_end: string | null; created_at: string; updated_at: string;
}
interface ProfileRow {
  user_id: string; first_name: string | null; last_name: string | null; company_name: string | null;
}
interface InvitationRow {
  id: string; token: string; plan: string; license_key: string | null;
  status: string; label: string | null; created_by: string;
  used_by: string | null; created_at: string; used_at: string | null; expires_at: string | null;
  short_code: string | null;
}
interface LicenseRow {
  id: string; license_key: string; tier: string | null; status: string | null;
  email: string | null; user_id: string; expires_at: string | null; created_at: string | null;
}
type SubWithProfile = SubscriptionRow & { profile?: ProfileRow };

const PLANS = ["free", "builder", "pro", "execution", "trading"] as const;
const PLAN_LABELS: Record<string, string> = {
  free: "Free", builder: "Builder (29€/mo)", pro: "Pro (79€/mo)", execution: "Execution OS (159€/mo)", trading: "Trading (199€/mo)",
};

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
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [directLicenses, setDirectLicenses] = useState<LicenseRow[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubWithProfile | null>(null);

  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [invitePlan, setInvitePlan] = useState<string>("builder");
  const [inviteLabel, setInviteLabel] = useState("");
  const [inviteExpiry, setInviteExpiry] = useState("");
  const [inviteSaving, setInviteSaving] = useState(false);

  // Direct license key dialog
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [licenseTier, setLicenseTier] = useState<string>("pro");
  const [licenseEmail, setLicenseEmail] = useState("");
  const [licenseDays, setLicenseDays] = useState("365");
  const [licenseSaving, setLicenseSaving] = useState(false);
  const [createdLicenseKey, setCreatedLicenseKey] = useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);

  // QR Code dialog
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLabel, setQrLabel] = useState("");

  const openQrDialog = (code: string, label?: string | null) => {
    setQrCode(code);
    setQrLabel(label || code);
    setQrDialogOpen(true);
  };

  const getQrUrl = (code: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}&bgcolor=0a0a0a&color=D4AF37&format=png`;

  const downloadQr = async () => {
    if (!qrCode) return;
    const url = getQrUrl(qrCode);
    const resp = await fetch(url);
    const blob = await resp.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `einladung-${qrCode}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("QR-Code heruntergeladen!");
  };

  const shareQrWhatsApp = () => {
    if (!qrCode) return;
    const text = `🎉 Du wurdest zu BrandOS eingeladen!\n\nDein Einladungscode: *${qrCode}*\n\nGib den Code bei der Registrierung ein, um deinen Plan freizuschalten.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Form
  const [formPlan, setFormPlan] = useState<string>("builder");
  const [formLicenseKey, setFormLicenseKey] = useState("");
  const [formPeriodEnd, setFormPeriodEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");
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

  const loadData = async () => {
    setLoading(true);
    const [subRes, profRes, invRes, licRes] = await Promise.all([
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, first_name, last_name, company_name"),
      supabase.from("license_invitations").select("*").order("created_at", { ascending: false }),
      supabase.from("licenses").select("*").order("created_at", { ascending: false }),
    ]);

    const subsData = (subRes.data ?? []) as SubscriptionRow[];
    const profsData = (profRes.data ?? []) as ProfileRow[];
    setInvitations((invRes.data ?? []) as InvitationRow[]);
    setDirectLicenses((licRes.data ?? []) as LicenseRow[]);

    const merged: SubWithProfile[] = subsData.map((s) => ({
      ...s,
      profile: profsData.find((p) => p.user_id === s.user_id),
    }));
    setSubs(merged);
    setLoading(false);
  };

  useEffect(() => { if (authorized) loadData(); }, [authorized]);

  // ── Quick Actions ──
  const quickToggle = async (sub: SubWithProfile, newStatus: string) => {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: newStatus, license_key: newStatus === "free" ? null : sub.license_key })
      .eq("id", sub.id);
    if (error) { toast.error("Fehler: " + error.message); return; }
    await supabase.from("admin_audit_log").insert({
      admin_id: user!.id, affected_user_id: sub.user_id,
      action_type: newStatus === "free" ? "license_deactivated" : "license_reactivated",
      details: { previous: sub.status, new: newStatus },
    });
    toast.success(newStatus === "free" ? "Lizenz deaktiviert" : `Auf ${newStatus} gesetzt`);
    loadData();
  };

  // ── Edit dialog ──
  const openEdit = (sub: SubWithProfile) => {
    setEditing(sub);
    setFormPlan(sub.status);
    setFormLicenseKey(sub.license_key ?? "");
    setFormNotes("");
    setFormPeriodEnd(sub.current_period_end ? sub.current_period_end.split("T")[0] : "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: formPlan,
        license_key: formLicenseKey || null,
        current_period_end: formPeriodEnd ? new Date(formPeriodEnd).toISOString() : editing.current_period_end,
      })
      .eq("id", editing.id);

    if (error) { toast.error("Fehler: " + error.message); }
    else {
      await supabase.from("admin_audit_log").insert({
        admin_id: user!.id, affected_user_id: editing.user_id,
        action_type: "license_updated",
        details: { plan: formPlan, license_key: formLicenseKey, notes: formNotes },
      });
      toast.success("Lizenz aktualisiert");
      setDialogOpen(false);
      loadData();
    }
    setSaving(false);
  };

  // ── Create Invite Link ──
  const CUSTOM_DOMAIN = "https://brand.aldenairperfumes.de";

  const [createdShortCode, setCreatedShortCode] = useState<string | null>(null);

  const handleCreateInvite = async () => {
    setInviteSaving(true);
    const { data, error } = await supabase.from("license_invitations").insert({
      plan: invitePlan,
      label: inviteLabel || null,
      created_by: user!.id,
      expires_at: inviteExpiry ? new Date(inviteExpiry).toISOString() : null,
    }).select("token, short_code").single();

    if (error) { toast.error("Fehler: " + error.message); }
    else if (data) {
      const url = getInviteUrl(data.token);
      setCreatedInviteUrl(url);
      setCreatedShortCode((data as any).short_code ?? null);
      setInviteLabel("");
      setInviteExpiry("");
      loadData();
    }
    setInviteSaving(false);
  };

  const getInviteUrl = (token: string) => {
    return `${CUSTOM_DOMAIN}/#/invite?token=${token}`;
  };

  const copyInviteUrl = async (token: string) => {
    try {
      await navigator.clipboard.writeText(getInviteUrl(token));
      toast.success("Link kopiert!");
    } catch { toast.error("Kopieren fehlgeschlagen"); }
  };

  const revokeInvite = async (inv: InvitationRow) => {
    if (!confirm("Einladung widerrufen?")) return;
    const { error } = await supabase
      .from("license_invitations")
      .update({ status: "revoked" })
      .eq("id", inv.id);
    if (error) toast.error("Fehler: " + error.message);
    else { toast.success("Einladung widerrufen"); loadData(); }
  };

  const reactivateInvite = async (inv: InvitationRow) => {
    const { error } = await supabase
      .from("license_invitations")
      .update({ status: "active" })
      .eq("id", inv.id);
    if (error) toast.error("Fehler: " + error.message);
    else { toast.success("Einladung reaktiviert"); loadData(); }
  };

  // ── Create Direct License Key ──
  const handleCreateLicense = async () => {
    setLicenseSaving(true);
    const key = generateLicenseKey();
    const expiresAt = parseInt(licenseDays) > 0
      ? new Date(Date.now() + parseInt(licenseDays) * 86400000).toISOString()
      : null;

    const { error } = await supabase.from("licenses").insert({
      license_key: key,
      tier: licenseTier,
      user_id: user!.id,
      email: licenseEmail || null,
      expires_at: expiresAt,
      status: "active",
    });

    if (error) {
      toast.error("Fehler: " + error.message);
    } else {
      setCreatedLicenseKey(key);
      await supabase.from("admin_audit_log").insert({
        admin_id: user!.id,
        action_type: "license_created",
        details: { tier: licenseTier, license_key: key, email: licenseEmail, days: licenseDays },
      });
      toast.success("Lizenzschlüssel erstellt!");
      loadData();
    }
    setLicenseSaving(false);
  };

  if (authLoading || authorized === null || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const paidSubs = subs.filter((s) => s.status !== "free");
  const activeInvites = invitations.filter((i) => i.status === "active");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <KeyRound className="h-6 w-6" /> Lizenzverwaltung
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {paidSubs.length} zahlende Nutzer · {activeInvites.length} offene Einladungen
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => { setLicenseTier("pro"); setLicenseEmail(""); setLicenseDays("365"); setCreatedLicenseKey(null); setLicenseDialogOpen(true); }} size="sm" className="gap-1.5">
              <KeyRound className="h-4 w-4" /> Lizenzschlüssel
            </Button>
            <Button onClick={() => { setInvitePlan("builder"); setInviteDialogOpen(true); }} size="sm" variant="outline" className="gap-1.5">
              <Link2 className="h-4 w-4" /> Einladungslink
            </Button>
            <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Admin
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-8">
          {(["free", "builder", "pro", "execution", "trading"] as const).map((plan) => (
            <div key={plan} className="rounded-xl border bg-card p-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{plan}</p>
              <p className="text-2xl font-bold mt-1">{subs.filter((s) => s.status === plan).length}</p>
            </div>
          ))}
          <div className="rounded-xl border bg-card p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Einladungen</p>
            <p className="text-2xl font-bold mt-1">{activeInvites.length}</p>
          </div>
        </div>

        <Tabs defaultValue="licenses">
          <TabsList>
            <TabsTrigger value="licenses">Lizenzen</TabsTrigger>
            <TabsTrigger value="invitations">Einladungslinks ({invitations.length})</TabsTrigger>
          </TabsList>

          {/* ── Licenses Tab ── */}
          <TabsContent value="licenses">
            <div className="rounded-xl border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nutzer</TableHead>
                    <TableHead className="text-xs">Plan</TableHead>
                    <TableHead className="text-xs">Lizenzschlüssel</TableHead>
                    <TableHead className="text-xs">Stripe</TableHead>
                    <TableHead className="text-xs">Gültig bis</TableHead>
                    <TableHead className="text-xs text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Keine Abonnements gefunden</TableCell></TableRow>
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
                          {sub.profile?.company_name && <p className="text-[11px] text-muted-foreground">{sub.profile.company_name}</p>}
                          <p className="text-[10px] text-muted-foreground/60 font-mono">{sub.user_id.slice(0, 8)}…</p>
                        </div>
                      </TableCell>
                      <TableCell><PlanBadge plan={sub.status} /></TableCell>
                      <TableCell>
                        {sub.license_key ? <LicenseKeyCell value={sub.license_key} /> : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {sub.stripe_subscription_id
                          ? <span className="text-[11px] text-green-600 font-medium">● Aktiv</span>
                          : <span className="text-[11px] text-muted-foreground">Manual</span>}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("de-DE") : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(sub)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Bearbeiten
                            </DropdownMenuItem>
                            {sub.status !== "free" && (
                              <DropdownMenuItem onClick={() => quickToggle(sub, "free")} className="text-destructive">
                                <PowerOff className="h-3.5 w-3.5 mr-2" /> Deaktivieren
                              </DropdownMenuItem>
                            )}
                            {sub.status === "free" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => quickToggle(sub, "builder")}>
                                  <Power className="h-3.5 w-3.5 mr-2" /> → Builder
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => quickToggle(sub, "pro")}>
                                  <Power className="h-3.5 w-3.5 mr-2" /> → Pro
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => quickToggle(sub, "execution")}>
                                  <Power className="h-3.5 w-3.5 mr-2" /> → Execution
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── Invitations Tab ── */}
          <TabsContent value="invitations">
            <div className="rounded-xl border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Code</TableHead>
                    <TableHead className="text-xs">Label</TableHead>
                    <TableHead className="text-xs">Plan</TableHead>
                    <TableHead className="text-xs">Key</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Erstellt</TableHead>
                    <TableHead className="text-xs">Gültig bis</TableHead>
                    <TableHead className="text-xs text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">Keine Einladungen</TableCell></TableRow>
                  )}
                  {invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        {inv.short_code ? (
                          <div className="flex items-center gap-1.5">
                            <code className="text-sm font-mono font-bold text-primary">{inv.short_code}</code>
                            <button onClick={async () => { await navigator.clipboard.writeText(inv.short_code!); toast.success("Code kopiert!"); }} className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
                            <button onClick={() => openQrDialog(inv.short_code!, inv.label)} className="text-muted-foreground hover:text-foreground" title="QR-Code"><QrCode className="h-3 w-3" /></button>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell><span className="text-sm">{inv.label || "—"}</span></TableCell>
                      <TableCell><PlanBadge plan={inv.plan} /></TableCell>
                      <TableCell>{inv.license_key ? <LicenseKeyCell value={inv.license_key} /> : "—"}</TableCell>
                      <TableCell><InviteStatusBadge status={inv.status} /></TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("de-DE")}</span></TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{inv.expires_at ? new Date(inv.expires_at).toLocaleDateString("de-DE") : "∞"}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.status === "active" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyInviteUrl(inv.token)} title="Link kopieren">
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => revokeInvite(inv)} title="Widerrufen">
                                <PowerOff className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          {inv.status === "revoked" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => reactivateInvite(inv)} title="Reaktivieren">
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Lizenz bearbeiten</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => <SelectItem key={p} value={p}>{PLAN_LABELS[p]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lizenzschlüssel</Label>
              <div className="flex gap-2">
                <Input value={formLicenseKey} onChange={(e) => setFormLicenseKey(e.target.value)} placeholder="BOS-XXXX-XXXX-XXXX" className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => setFormLicenseKey(generateLicenseKey())} title="Neuen Key generieren">
                  <KeyRound className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gültig bis</Label>
              <Input type="date" value={formPeriodEnd} onChange={(e) => setFormPeriodEnd(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Interne Notiz</Label>
              <Input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="z.B. Sonderkonditionen…" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={(open) => { setInviteDialogOpen(open); if (!open) { setCreatedInviteUrl(null); setCreatedShortCode(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{createdShortCode ? "Einladung erstellt ✅" : "Einladung erstellen"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {createdShortCode ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Teile den <strong>Code</strong> – der Empfänger gibt ihn bei der Registrierung oder auf <code>/redeem</code> ein.
                </p>
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center">
                  <p className="text-[11px] text-muted-foreground mb-2">Einladungscode</p>
                  <code className="text-3xl font-mono font-black tracking-widest text-primary">{createdShortCode}</code>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={async () => {
                    await navigator.clipboard.writeText(createdShortCode);
                    toast.success("Code kopiert!");
                  }}>
                    <Copy className="h-4 w-4" /> Code kopieren
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => { if (createdShortCode) openQrDialog(createdShortCode, inviteLabel); }}>
                    <QrCode className="h-4 w-4" /> QR-Code
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                  if (!createdShortCode) return;
                  const text = `🎉 Du wurdest zu BrandOS eingeladen!\n\nDein Einladungscode: *${createdShortCode}*\n\nGib den Code bei der Registrierung ein, um deinen Plan freizuschalten.`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                }}>
                  <Send className="h-3.5 w-3.5" /> Per WhatsApp teilen
                </Button>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { setCreatedInviteUrl(null); setCreatedShortCode(null); setInviteDialogOpen(false); }}>
                  Fertig
                </Button>
                {createdInviteUrl && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">Alternativ: Direktlink</summary>
                    <code className="mt-2 text-[10px] font-mono break-all block bg-muted/30 rounded p-2">{createdInviteUrl}</code>
                  </details>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Erstelle einen Einladungscode. Keine E-Mail-Verifizierung nötig.
                </p>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={invitePlan} onValueChange={setInvitePlan}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLANS.filter(p => p !== "free").map((p) => <SelectItem key={p} value={p}>{PLAN_LABELS[p]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Label (intern)</Label>
                  <Input value={inviteLabel} onChange={(e) => setInviteLabel(e.target.value)} placeholder="z.B. Für Max, Partner-Deal…" />
                </div>
                <div className="space-y-2">
                  <Label>Ablaufdatum (optional)</Label>
                  <Input type="date" value={inviteExpiry} onChange={(e) => setInviteExpiry(e.target.value)} />
                </div>
                <Button onClick={handleCreateInvite} disabled={inviteSaving} className="w-full gap-2">
                  {inviteSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Send className="h-4 w-4" /> Code erstellen
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>QR-Code: {qrCode}</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCode && (
              <div className="rounded-xl border border-border bg-white p-4">
                <img
                  src={getQrUrl(qrCode)}
                  alt={`QR Code für ${qrCode}`}
                  className="w-[250px] h-[250px]"
                />
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground">
              Scanne den QR-Code oder teile den Einladungscode: <strong className="text-primary">{qrCode}</strong>
            </p>
            <div className="flex gap-2 w-full">
              <Button className="flex-1 gap-2" onClick={downloadQr}>
                <Copy className="h-4 w-4" /> Herunterladen
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={shareQrWhatsApp}>
                <Send className="h-4 w-4" /> WhatsApp
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={async () => {
              if (qrCode) { await navigator.clipboard.writeText(qrCode); toast.success("Code kopiert!"); }
            }}>
              <Copy className="h-3.5 w-3.5 mr-2" /> Code kopieren
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Direct License Key Dialog */}
      <Dialog open={licenseDialogOpen} onOpenChange={(open) => { setLicenseDialogOpen(open); if (!open) setCreatedLicenseKey(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{createdLicenseKey ? "Lizenzschlüssel erstellt ✅" : "Lizenzschlüssel erstellen"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {createdLicenseKey ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Der Schlüssel wurde in der Datenbank gespeichert. Teile ihn mit dem Nutzer.
                </p>
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center">
                  <p className="text-[11px] text-muted-foreground mb-2">Lizenzschlüssel</p>
                  <code className="text-2xl font-mono font-black tracking-widest text-primary">{createdLicenseKey}</code>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={async () => {
                    await navigator.clipboard.writeText(createdLicenseKey);
                    toast.success("Schlüssel kopiert!");
                  }}>
                    <Copy className="h-4 w-4" /> Kopieren
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => {
                    const text = `🔑 Dein BrandOS Lizenzschlüssel:\n\n*${createdLicenseKey}*\n\nGib ihn unter Einstellungen → Lizenz ein.`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                  }}>
                    <Send className="h-4 w-4" /> WhatsApp
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { setCreatedLicenseKey(null); setLicenseDialogOpen(false); }}>
                  Fertig
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Erstelle einen Lizenzschlüssel direkt. Der Nutzer kann ihn unter Einstellungen aktivieren.
                </p>
                <div className="space-y-2">
                  <Label>Tier / Plan</Label>
                  <Select value={licenseTier} onValueChange={setLicenseTier}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLANS.filter(p => p !== "free").map((p) => <SelectItem key={p} value={p}>{PLAN_LABELS[p]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>E-Mail des Empfängers (optional)</Label>
                  <Input value={licenseEmail} onChange={(e) => setLicenseEmail(e.target.value)} placeholder="nutzer@email.de" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Gültigkeit (Tage)</Label>
                  <Input value={licenseDays} onChange={(e) => setLicenseDays(e.target.value)} placeholder="365" type="number" min="0" />
                  <p className="text-[11px] text-muted-foreground">0 = unbegrenzt</p>
                </div>
                <Button onClick={handleCreateLicense} disabled={licenseSaving} className="w-full gap-2">
                  {licenseSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <KeyRound className="h-4 w-4" /> Schlüssel generieren
                </Button>
              </>
            )}
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
    pro: "bg-accent/10 text-accent-foreground",
    execution: "bg-orange-500/10 text-orange-600",
    trading: "bg-blue-500/10 text-blue-600",
  };
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[plan] ?? styles.free}`}>
      {plan}
    </span>
  );
}

/* ── Invite Status Badge ── */
function InviteStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/10 text-green-600",
    used: "bg-muted text-muted-foreground",
    revoked: "bg-destructive/10 text-destructive",
    expired: "bg-orange-500/10 text-orange-600",
  };
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[status] ?? styles.active}`}>
      {status}
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
        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}
