import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, User, CreditCard, FlaskConical, KeyRound, Copy, Check, Shield, Globe, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getClientMode, setClientMode } from "@/lib/beta-client";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { SessionManagement } from "@/components/settings/SessionManagement";
import { TwoFactorSetup } from "@/components/settings/TwoFactorSetup";

const PLAN_META: Record<string, { label: string; color: string; icon: typeof Sparkles }> = {
  pro: { label: "Pro", color: "bg-accent text-accent-foreground", icon: Sparkles },
  builder: { label: "Builder", color: "bg-accent text-accent-foreground", icon: Sparkles },
  trading: { label: "Trading", color: "bg-blue-500 text-white", icon: Sparkles },
  execution: { label: "Execution OS", color: "bg-violet-500 text-white", icon: Sparkles },
  free: { label: "Free", color: "bg-muted text-muted-foreground", icon: User },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { isFree, plan, licenseKey } = useSubscription();
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, company_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (data) {
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        setCompanyName(data.company_name ?? "");
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: companyName.trim(),
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error(t("steps.saveError"));
    } else {
      toast.success(t("steps.saved"));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const planMeta = PLAN_META[plan] || PLAN_META.free;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("dashboard.settings")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{isDE ? "Verwalte dein Profil, Abo und App-Einstellungen." : "Manage your profile, subscription, and app settings."}</p>
        </div>

        {/* Profile */}
        <AnimatedCard index={0}>
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent font-bold text-lg">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{t("settings.profile")}</h2>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t("settings.firstName")}</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t("settings.lastName")}</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-medium">{t("settings.company")}</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="rounded-xl" placeholder={isDE ? "Optional" : "Optional"} />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="mt-5 gap-2 rounded-xl">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("steps.save")}
            </Button>
          </div>
        </AnimatedCard>

        {/* Plan & License */}
        <AnimatedCard index={1}>
          <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="text-lg font-semibold">{t("settings.plan")}</h2>
                </div>
                <Badge className={cn("rounded-lg px-3 py-1 text-xs font-semibold", planMeta.color)}>
                  {planMeta.label}
                </Badge>
              </div>

              {/* License Key */}
              {licenseKey && (
                <div className="rounded-xl border bg-muted/30 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {isDE ? "Lizenzschlüssel" : "License Key"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-xl border bg-background px-3 py-2.5 font-mono text-sm tracking-wider select-all">
                      {licenseKey}
                    </code>
                    <LicenseCopyButton value={licenseKey} isDE={isDE} />
                  </div>
                </div>
              )}

              {!licenseKey && !isFree && (
                <p className="text-xs text-muted-foreground mb-4">
                  {isDE ? "Lizenzschlüssel wird generiert…" : "License key is being generated…"}
                </p>
              )}

              <Button
                variant={isFree ? "default" : "outline"}
                className="gap-2 rounded-xl w-full"
                onClick={() => navigate("/dashboard/pricing")}
              >
                {isFree ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t("upgrade.cta")}
                  </>
                ) : (
                  <>
                    {isDE ? "Abo verwalten" : "Manage subscription"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Plan features summary */}
            {!isFree && (
              <div className="border-t bg-muted/20 px-6 py-3">
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {isDE ? "Aktives Abo" : "Active subscription"}</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {isDE ? "Alle Features" : "All features"}</span>
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>

        {/* Language */}
        <AnimatedCard index={2}>
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Globe className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold">{isDE ? "Sprache" : "Language"}</h2>
            </div>
            <div className="flex gap-2">
              {[
                { code: "de", label: "🇩🇪 Deutsch" },
                { code: "en", label: "🇬🇧 English" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                    i18n.language === lang.code
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Two-Factor Authentication */}
        <TwoFactorSetup />

        {/* Session Management */}
        <SessionManagement />

        {/* Beta Client */}
        <AnimatedCard index={4}>
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <FlaskConical className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Beta Client</h2>
                  <p className="text-xs text-muted-foreground">
                    {isDE ? "Neue Features vorab testen" : "Test new features early"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                  getClientMode() === "beta" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                )}>
                  {getClientMode() === "beta" ? "Beta" : "Stable"}
                </span>
                <Switch
                  checked={getClientMode() === "beta"}
                  onCheckedChange={(checked) => {
                    setClientMode(checked ? "beta" : "production");
                    toast.info(isDE ? "Beta-Modus geändert. Seite wird neu geladen…" : "Beta mode changed. Reloading…");
                    setTimeout(() => window.location.reload(), 800);
                  }}
                />
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </DashboardLayout>
  );
}

function LicenseCopyButton({ value, isDE }: { value: string; isDE: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(isDE ? "Lizenzschlüssel kopiert" : "License key copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(isDE ? "Kopieren fehlgeschlagen" : "Failed to copy");
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0 rounded-xl">
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
